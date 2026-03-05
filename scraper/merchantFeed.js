import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const parser = new Parser({
  customFields: {
    item: [
      ['description'],
      ['link'],
      ['pubDate'],
      ['content:encoded']
    ]
  }
});

const FEED_URL = 'https://feeds.feedburner.com/SlickdealsnetFP?format=xml';

function extractPrice(text) {
  const m = String(text || '').match(/\$(\d+(?:\.\d{2})?)/);
  return m ? parseFloat(m[1]) : 0;
}

function parseJsonNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function pickFirstPositive(values = []) {
  for (const v of values) {
    const n = parseJsonNumber(v);
    if (n > 0) return n;
  }
  return 0;
}

async function fetchRetailerPricing(productUrl) {
  if (!productUrl || !productUrl.startsWith('http')) return null;

  try {
    const res = await axios.get(productUrl, {
      maxRedirects: 6,
      timeout: 7000,
      validateStatus: s => s >= 200 && s < 400,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const finalUrl = res?.request?.res?.responseUrl || productUrl;
    const html = String(res.data || '');
    const $ = cheerio.load(html);

    // Generic sources (JSON-LD + meta)
    let salePrice = pickFirstPositive([
      $('meta[itemprop="price"]').attr('content'),
      $('meta[property="product:price:amount"]').attr('content'),
      $('meta[property="og:price:amount"]').attr('content'),
      $('meta[name="twitter:data1"]').attr('content')
    ]);

    let originalPrice = 0;

    // JSON-LD offers parsing
    $('script[type="application/ld+json"]').each((_, el) => {
      if (salePrice > 0 && originalPrice > 0) return;
      const raw = $(el).html() || '';
      try {
        const json = JSON.parse(raw);
        const entries = Array.isArray(json) ? json : [json];
        for (const entry of entries) {
          const offers = entry?.offers;
          const offerList = Array.isArray(offers) ? offers : (offers ? [offers] : []);
          for (const offer of offerList) {
            if (!salePrice) {
              salePrice = pickFirstPositive([offer?.price, offer?.lowPrice]);
            }
            if (!originalPrice) {
              originalPrice = pickFirstPositive([offer?.highPrice, offer?.listPrice]);
            }
          }
        }
      } catch {
        // ignore malformed json-ld
      }
    });

    // Walmart-specific extraction (most reliable for "was" pricing)
    if (finalUrl.includes('walmart.com')) {
      const currentMatches = [...html.matchAll(/"currentPrice"\s*:\s*\{[^}]*"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/g)].map(m => m[1]);
      const wasMatches = [...html.matchAll(/"wasPrice"\s*:\s*\{[^}]*"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/g)].map(m => m[1]);
      const listMatches = [...html.matchAll(/"listPrice"\s*:\s*\{[^}]*"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/g)].map(m => m[1]);

      salePrice = pickFirstPositive([salePrice, ...currentMatches]);
      originalPrice = pickFirstPositive([originalPrice, ...wasMatches, ...listMatches]);
    }

    if (!salePrice || salePrice <= 0) return null;
    if (!originalPrice || originalPrice < salePrice) originalPrice = 0;

    let discountPct = 0;
    if (originalPrice > salePrice) {
      discountPct = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }

    return { salePrice, originalPrice, discountPct, finalUrl };
  } catch {
    return null;
  }
}

function extractDiscount(text) {
  const m = String(text || '').match(/(\d+)%\s*off|save\s*(\d+)%/i);
  const pct = parseInt(m?.[1] || m?.[2] || '0', 10);
  return Number.isFinite(pct) && pct > 0 ? pct : 15;
}

async function resolveFinalUrl(url) {
  if (!url || !url.startsWith('http')) return url;
  try {
    const res = await axios.get(url, {
      maxRedirects: 8,
      timeout: 6000,
      validateStatus: s => s >= 200 && s < 400,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    return res?.request?.res?.responseUrl || url;
  } catch {
    return url;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = () => 180 + Math.floor(Math.random() * 420);

async function extractDealUrl(item) {
  const description = item['content:encoded'] || item.description || '';
  const $ = cheerio.load(description);

  const clickLink = $('a')
    .map((_, el) => $(el).attr('href'))
    .get()
    .find(href => href && href.includes('slickdeals.net/click'));

  if (clickLink) {
    await sleep(jitter());
    return resolveFinalUrl(clickLink);
  }
  return item.link || '';
}

export async function scrapeMerchantFromSlickdeals({ source, hostMatch, minPrice = 20, maxDeals = 20, category = 'tech', feedUrls = [FEED_URL] }) {
  const deals = [];

  for (const feedUrl of feedUrls) {
    if (deals.length >= maxDeals) break;

    let feed;
    try {
      feed = await parser.parseURL(feedUrl);
    } catch {
      continue;
    }

    for (const item of feed.items || []) {
      if (deals.length >= maxDeals) break;

      const title = item.title || '';
      const directUrl = await extractDealUrl(item);
      if (!directUrl || !hostMatch.some(host => directUrl.includes(host))) continue;

      const text = `${title} ${item.description || ''}`;
      const retailerPricing = await fetchRetailerPricing(directUrl);

      // Prefer retailer-direct price. Fall back to parsed copy only if direct pull fails.
      const salePrice = retailerPricing?.salePrice || extractPrice(text);
      if (salePrice < minPrice) continue;

      const originalPrice = retailerPricing?.originalPrice || 0;
      const discountPct = retailerPricing?.discountPct || extractDiscount(text);

      deals.push({
        product_name: title.trim(),
        sale_price: salePrice,
        original_price: originalPrice > salePrice ? originalPrice : null,
        discount_pct: discountPct,
        product_url: retailerPricing?.finalUrl || directUrl,
        image_url: null,
        source,
        source_url: item.link || directUrl,
        category,
        expires_at: null,
        quality_score: retailerPricing ? 92 : 84,
        is_active: true,
        is_verified: !!retailerPricing,
        source_confidence: retailerPricing ? 95 : 70
      });
    }
  }

  const unique = [];
  const seen = new Set();
  for (const d of deals) {
    if (seen.has(d.product_url)) continue;
    seen.add(d.product_url);
    unique.push(d);
  }

  return unique;
}

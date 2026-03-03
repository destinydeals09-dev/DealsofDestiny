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
      const price = extractPrice(text);
      if (price < minPrice) continue;

      deals.push({
        product_name: title.trim(),
        price,
        discount_pct: extractDiscount(text),
        product_url: directUrl,
        image_url: null,
        source,
        source_url: item.link || directUrl,
        category,
        expires_at: null,
        quality_score: 88,
        is_active: true
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

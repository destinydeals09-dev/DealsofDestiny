// Slickdeals RSS Scraper
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const browserHeaders = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
};

const SLICKDEALS_RSS_FEEDS = [
  { url: 'https://feeds.feedburner.com/SlickdealsnetFP?format=xml', category: 'general' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=beauty', category: 'beauty' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=makeup', category: 'beauty' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=skincare', category: 'beauty' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=sephora', category: 'beauty' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=ulta', category: 'beauty' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=toys', category: 'toys' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=lego', category: 'toys' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=laptop', category: 'tech' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=monitor', category: 'tech' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=home', category: 'home' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=apparel', category: 'fashion' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=shoes', category: 'fashion' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=nike', category: 'fashion' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=adidas', category: 'fashion' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=kitchen', category: 'kitchen' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=cookware', category: 'kitchen' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=appliance', category: 'kitchen' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=blender', category: 'kitchen' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=knife', category: 'kitchen' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=gaming', category: 'gaming' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=fitness', category: 'fitness' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=gym', category: 'fitness' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=dumbbell', category: 'fitness' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=book', category: 'books' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=books', category: 'books' },
  { url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=kindle', category: 'books' }
];

const MIN_ORIGINAL_PRICE = 15; // Lowered again to increase category volume
const MIN_DISCOUNT_PCT = 15; // Lowered again to increase category volume

const TARGET_CATEGORIES = new Set(['fashion', 'beauty', 'tech', 'home', 'kitchen', 'fitness', 'toys', 'books']);

function inferCategoryFromText(text) {
  const t = (text || '').toLowerCase();

  const has = (re) => re.test(t);

  const scoring = {
    beauty: 0,
    fashion: 0,
    tech: 0,
    home: 0,
    kitchen: 0,
    fitness: 0,
    toys: 0,
    books: 0,
    gaming: 0
  };

  if (has(/makeup|lipstick|mascara|eyeliner|foundation|concealer|skincare|serum|moisturizer|cleanser|beauty|sephora|ulta|perfume|cologne|fragrance|shampoo|conditioner/)) scoring.beauty += 3;
  if (has(/shirt|pants|jacket|dress|fashion|clothing|apparel|sneaker|shoe|adidas|nike|under armour|hoodie|jeans/)) scoring.fashion += 3;
  if (has(/laptop|monitor|ssd|gpu|cpu|keyboard|mouse|headset|tech|computer|electronics|router|tablet|iphone|android|tv|soundbar/)) scoring.tech += 3;
  if (has(/sofa|chair|table|lamp|bed|furniture|home decor|dresser|bookshelf|cabinet|mattress/)) scoring.home += 3;
  if (has(/kitchen|cookware|pan|pot|blender|mixer|knife|air fryer|toaster|coffee maker|instant pot/)) scoring.kitchen += 3;
  if (has(/fitness|gym|yoga|dumbbell|barbell|treadmill|protein|workout|weights|resistance band/)) scoring.fitness += 3;
  if (has(/lego|toy|doll|nerf|board game|puzzle|action figure|playset/)) scoring.toys += 3;
  if (has(/book|books|novel|kindle|paperback|hardcover|audiobook|ebook/)) scoring.books += 3;
  if (has(/game|gaming|console|ps5|ps4|xbox|switch|steam|nintendo|playstation/)) scoring.gaming += 3;

  // Anti-signals to avoid category contamination (e.g. games in beauty)
  if (scoring.gaming > 0) scoring.beauty -= 2;
  if (scoring.home > 0) scoring.beauty -= 1;
  if (scoring.tech > 0) scoring.beauty -= 1;

  const ranked = Object.entries(scoring).sort((a, b) => b[1] - a[1]);
  const [topCategory, topScore] = ranked[0];

  if (!topCategory || topScore <= 0) return null;
  return topCategory;
}

/**
 * Resolve final URL from a redirect link (HEAD request)
 */
async function resolveFinalUrl(url) {
  if (!url || !url.includes('slickdeals.net')) return url;

  // Try extracting a direct URL from query params first (if present)
  try {
    const parsed = new URL(url);
    const direct = parsed.searchParams.get('url') || parsed.searchParams.get('u') || parsed.searchParams.get('redirect');
    if (direct && direct.startsWith('http')) return decodeURIComponent(direct);
  } catch (_) {
    // ignore URL parse failures and continue
  }

  // Fallback: follow redirects with GET (HEAD is frequently blocked)
  try {
    const response = await axios.get(url, {
      maxRedirects: 8,
      timeout: 6000,
      validateStatus: status => status >= 200 && status < 400,
      headers: browserHeaders
    });

    return response?.request?.res?.responseUrl || url;
  } catch (err) {
    return url;
  }
}

async function fetchRetailerPricing(productUrl) {
  if (!productUrl || !productUrl.startsWith('http')) return null;

  try {
    const response = await axios.get(productUrl, {
      maxRedirects: 5,
      timeout: 7000,
      headers: browserHeaders,
      validateStatus: status => status >= 200 && status < 400
    });

    const finalUrl = response?.request?.res?.responseUrl || productUrl;
    const html = String(response.data || '');

    let salePrice = 0;
    let originalPrice = 0;

    if (finalUrl.includes('walmart.com')) {
      const currentMatches = [...html.matchAll(/"currentPrice"\s*:\s*\{[^}]*"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/g)].map(m => Number(m[1]));
      const wasMatches = [...html.matchAll(/"wasPrice"\s*:\s*\{[^}]*"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/g)].map(m => Number(m[1]));
      salePrice = currentMatches.find(n => Number.isFinite(n) && n > 0) || 0;
      originalPrice = wasMatches.find(n => Number.isFinite(n) && n > 0) || 0;
    }

    if (!salePrice || salePrice <= 0) return null;

    let discountPct = 0;
    if (originalPrice > salePrice) {
      discountPct = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }

    return { salePrice, originalPrice, discountPct, finalUrl };
  } catch {
    return null;
  }
}

async function fetchMerchantImage(productUrl) {
  if (!productUrl || !productUrl.startsWith('http')) return null;
  if (productUrl.includes('slickdeals.net')) return null;

  try {
    const response = await axios.get(productUrl, {
      maxRedirects: 5,
      timeout: 7000,
      headers: browserHeaders,
      validateStatus: status => status >= 200 && status < 400
    });

    const finalUrl = response?.request?.res?.responseUrl || productUrl;
    if (finalUrl.includes('slickdeals.net')) return null;

    const html = response.data || '';
    const $ = cheerio.load(html);

    const candidates = [
      $('meta[property="og:image"]').attr('content'),
      $('meta[property="og:image:url"]').attr('content'),
      $('meta[name="twitter:image"]').attr('content'),
      $('meta[name="twitter:image:src"]').attr('content'),
      $('img#landingImage').attr('src'),
      $('img#imgBlkFront').attr('src'),
      $('img').first().attr('src')
    ].filter(Boolean);

    for (const c of candidates) {
      const img = String(c).trim();
      if (!img) continue;
      if (img.startsWith('data:')) continue;
      if (img.includes('slickdealscdn.com')) continue;
      if (img.length < 12) continue;

      const lowered = img.toLowerCase();
      const blocked = ['logo', 'icon', 'sprite', 'placeholder', 'favicon', 'avatar', 'brandmark'];
      if (blocked.some(token => lowered.includes(token))) continue;

      try {
        return new URL(img, finalUrl).toString();
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract discount percentage from title or description
 * Examples: "50% off", "$100 off $200", "Save 60%"
 */
function extractDiscountPercent(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  // Pattern 1: Direct percentage (50% off, 50%, Save 50%)
  const percentMatch = text.match(/(\d+)%\s*off|(\d+)%|save\s*(\d+)%/i);
  if (percentMatch) {
    const pct = parseInt(percentMatch[1] || percentMatch[2] || percentMatch[3]);
    if (pct > 0 && pct <= 100) return pct;
  }

  // Pattern 2: Price savings ($50 off $100 = 50% off)
  const savingsMatch = text.match(/\$(\d+(?:\.\d{2})?)\s*(?:off|discount)\s*(?:on\s*)?\$(\d+(?:\.\d{2})?)/i);
  if (savingsMatch) {
    const savings = parseFloat(savingsMatch[1]);
    const originalPrice = parseFloat(savingsMatch[2]);
    if (originalPrice > 0) {
      return Math.round((savings / originalPrice) * 100);
    }
  }

  // Pattern 3: "Was $100, now $50"
  const priceMatch = text.match(/(?:was|originally)\s*\$(\d+(?:\.\d{2})?)[^\d]+(?:now|price)\s*\$(\d+(?:\.\d{2})?)/i);
  if (priceMatch) {
    const originalPrice = parseFloat(priceMatch[1]);
    const currentPrice = parseFloat(priceMatch[2]);
    if (originalPrice > currentPrice && currentPrice > 0) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
  }

  return null;
}

/**
 * Extract price from title or description
 */
function extractPrice(title, description) {
  const text = `${title} ${description}`;

  // Look for price patterns: $X.XX, $X
  const priceMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
  if (priceMatch) {
    return parseFloat(priceMatch[1]);
  }

  // Look for "free" as $0
  if (text.toLowerCase().includes('free')) {
    return 0;
  }

  return null;
}

/**
 * Scrape Slickdeals RSS feeds
 */
export async function scrapeSlickdeals() {
  const parser = new Parser({
    customFields: {
      item: [
        ['description'],
        ['link'],
        ['pubDate']
      ]
    }
  });

  let allDeals = [];

  for (const feedSource of SLICKDEALS_RSS_FEEDS) {
    try {
      console.log(`📡 Fetching Slickdeals RSS feed for ${feedSource.category}...`);
      const feed = await parser.parseURL(feedSource.url);

      const deals = [];

      for (const item of feed.items) {
        const title = item.title || '';
        const description = item.description || '';
        const link = item.link || '';

        // Extract discount percentage
        let discountPct = extractDiscountPercent(title, description);

        // Extract price
        const price = extractPrice(title, description);

        // Extract the deal link from content (usually the first link)
        let dealLink = link; // Default to thread link if we can't find better

        try {
          const content = item['content:encoded'] || description;
          const $ = cheerio.load(content);

          // Find the first link that isn't an image or internal
          const firstLink = $('a').filter((i, el) => {
            const href = $(el).attr('href');
            return href && href.includes('slickdeals.net/click');
          }).first().attr('href');

          if (firstLink) {
            dealLink = await resolveFinalUrl(firstLink);
          } else {
             // Fallback: Try to find any external link that isn't slickdeals
             const externalLink = $('a').filter((i, el) => {
               const href = $(el).attr('href');
               return href && !href.includes('slickdeals.net') && href.startsWith('http');
             }).first().attr('href');

             if (externalLink) dealLink = externalLink;
          }
        } catch (err) {
          // Ignore
        }

        // Must resolve to a direct merchant URL
        if (!dealLink || !dealLink.startsWith('http') || dealLink.includes('slickdeals.net')) {
          continue;
        }

        // Pull retailer-direct pricing when possible (critical for was/current correctness)
        const retailerPricing = await fetchRetailerPricing(dealLink);
        const effectivePrice = retailerPricing?.salePrice || price || 0;
        if (retailerPricing?.discountPct) discountPct = retailerPricing.discountPct;

        // Filter: High Ticket Items Only
        let originalPrice = 0;
        if (retailerPricing?.originalPrice && retailerPricing.originalPrice > effectivePrice) {
          originalPrice = retailerPricing.originalPrice;
        } else if (effectivePrice > 0 && discountPct > 0) {
          originalPrice = effectivePrice / (1 - (discountPct / 100));
        } else if (effectivePrice > 20) {
          originalPrice = effectivePrice;
        }

        if (originalPrice < MIN_ORIGINAL_PRICE) {
          continue;
        }

        // Filter: Only deals with minimum discount
        if (!discountPct && effectivePrice > 0) {
          discountPct = 25;
        }

        if (discountPct < MIN_DISCOUNT_PCT) {
          continue;
        }

        // Pull product image from the destination merchant page (not Slickdeals CDN)
        const imageUrl = await fetchMerchantImage(retailerPricing?.finalUrl || dealLink);

        // Strict requirement: no merchant image => no product
        if (!imageUrl) {
          continue;
        }

        // Strict category inference to prevent cross-category pollution.
        const inferredCategory = inferCategoryFromText(`${title} ${description}`);
        let category = feedSource.category;

        if (feedSource.category === 'general') {
          // For general feed, only keep confidently categorized target-category deals.
          if (!inferredCategory || !TARGET_CATEGORIES.has(inferredCategory)) {
            continue;
          }
          category = inferredCategory;
        } else {
          // For category-specific feeds, require inferred category to match requested category.
          // This blocks items like video games showing up in beauty.
          if (!inferredCategory || inferredCategory !== feedSource.category) {
            continue;
          }
          category = inferredCategory;
        }

        // Build deal object
        const deal = {
          product_name: title.trim(),
          sale_price: effectivePrice,
          original_price: originalPrice > effectivePrice ? originalPrice : null,
          discount_pct: discountPct,
          product_url: retailerPricing?.finalUrl || dealLink,
          image_url: imageUrl,
          source: 'slickdeals',
          source_url: link,
          category: category,
          expires_at: null,
          quality_score: retailerPricing ? 100 : 90,
          is_active: true,
          is_verified: !!retailerPricing,
          source_confidence: retailerPricing ? 95 : 75
        };

        deals.push(deal);
      }

      console.log(`✅ Slickdeals (${feedSource.category}): Found ${deals.length} deals`);
      allDeals = allDeals.concat(deals);

    } catch (error) {
      console.error(`❌ Slickdeals scraper error for ${feedSource.category}:`, error.message);
      // Continue to next feed
    }
  }

  // Deduplicate deals by URL
  const uniqueDeals = [];
  const seenUrls = new Set();

  for (const deal of allDeals) {
    if (!seenUrls.has(deal.product_url)) {
      seenUrls.add(deal.product_url);
      uniqueDeals.push(deal);
    }
  }

  console.log(`✅ Slickdeals Total: Found ${uniqueDeals.length} unique deals`);
  return uniqueDeals;
}

// Test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeSlickdeals()
    .then(deals => {
      console.log('\n📋 Sample deals:');
      deals.slice(0, 3).forEach(deal => {
        console.log(`\n${deal.product_name}`);
        console.log(`  💰 $${deal.price} (${deal.discount_pct}% off)`);
        console.log(`  🔗 ${deal.product_url}`);
      });
    })
    .catch(console.error);
}

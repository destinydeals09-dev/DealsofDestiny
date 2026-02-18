// Reddit Scraper - r/buildapcsales and r/GameDeals
import axios from 'axios';

const REDDIT_API = 'https://www.reddit.com/r/{subreddit}/hot.json?limit=100';
const MIN_DISCOUNT_PCT = 50;
const USER_AGENT = 'DealsofDestiny/1.0 (Deal Aggregator)';

/**
 * Extract discount percentage from Reddit post title
 * Common formats:
 * - "[GPU] RTX 4080 $899 (50% off)"
 * - "[SSD] 1TB NVMe $79.99 ($159.99 - $80 = 50%)"
 * - "Samsung Monitor $199 (Was $399, 50% off)"
 */
function extractDiscountPercent(title) {
  // Pattern 1: Direct percentage in parentheses (50% off)
  const percentMatch = title.match(/\((\d+)%\s*(?:off|discount)\)/i);
  if (percentMatch) {
    return parseInt(percentMatch[1]);
  }
  
  // Pattern 2: Percentage at end - 50% off
  const endMatch = title.match(/(\d+)%\s*off/i);
  if (endMatch) {
    return parseInt(endMatch[1]);
  }
  
  // Pattern 3: Calculate from prices ($200 - $100 = 50%)
  const calcMatch = title.match(/\$(\d+(?:\.\d{2})?)\s*-\s*\$(\d+(?:\.\d{2})?)\s*=\s*(\d+)%/i);
  if (calcMatch) {
    return parseInt(calcMatch[3]);
  }
  
  // Pattern 4: "Was $X, now $Y" - calculate manually
  const wasNowMatch = title.match(/(?:was|originally)\s*\$(\d+(?:\.\d{2})?)[^\d]+(?:now|sale|price)\s*\$(\d+(?:\.\d{2})?)/i);
  if (wasNowMatch) {
    const originalPrice = parseFloat(wasNowMatch[1]);
    const currentPrice = parseFloat(wasNowMatch[2]);
    if (originalPrice > currentPrice && currentPrice > 0) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
  }
  
  return null;
}

/**
 * Extract price from Reddit post title
 */
function extractPrice(title) {
  // Look for price in common formats: $XXX.XX or $XXX
  const priceMatches = title.match(/\$(\d+(?:\.\d{2})?)/g);
  
  if (priceMatches && priceMatches.length > 0) {
    // Usually the first price is the current price
    const price = priceMatches[0].replace('$', '');
    return parseFloat(price);
  }
  
  // Free deals
  if (title.toLowerCase().includes('free')) {
    return 0;
  }
  
  return null;
}

/**
 * Extract category from post flair or title brackets
 * Examples: [GPU], [SSD], [Monitor], etc.
 */
function extractCategory(title, flairText) {
  // Check flair first (more reliable)
  if (flairText) {
    return flairText.toLowerCase().trim();
  }
  
  // Check title brackets
  const bracketMatch = title.match(/\[([^\]]+)\]/);
  if (bracketMatch) {
    return bracketMatch[1].toLowerCase().trim();
  }
  
  return 'general';
}

/**
 * Scrape a Reddit subreddit for deals
 */
async function scrapeRedditSubreddit(subreddit) {
  const url = REDDIT_API.replace('{subreddit}', subreddit);
  
  try {
    console.log(`📡 Fetching r/${subreddit}...`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });
    
    const posts = response.data.data.children;
    const deals = [];
    
    for (const post of posts) {
      const data = post.data;
      
      // Skip stickied posts (mod announcements)
      if (data.stickied) continue;
      
      const title = data.title || '';
      let dealUrl = data.url || '';
      const postUrl = `https://www.reddit.com${data.permalink}`;
      const flairText = data.link_flair_text || '';
      const selftext = data.selftext || '';
      
      // If URL points to Reddit (text post), extract URL from selftext
      if (dealUrl.includes('reddit.com') || dealUrl.includes('redd.it')) {
        // Try to extract URL from selftext
        const urlMatch = selftext.match(/https?:\/\/[^\s\)]+/i);
        if (urlMatch) {
          dealUrl = urlMatch[0];
        } else {
          // Skip if we can't find a deal URL
          continue;
        }
      }
      
      // Skip if still no valid external URL
      if (!dealUrl || dealUrl.includes('reddit.com') || dealUrl.includes('redd.it')) {
        continue;
      }
      
      // Extract discount percentage
      const discountPct = extractDiscountPercent(title);
      
      // Filter: Only deals with 50%+ discount
      if (!discountPct || discountPct < MIN_DISCOUNT_PCT) {
        continue;
      }
      
      // Extract price and category
      const price = extractPrice(title);
      const category = extractCategory(title, flairText);
      
      // Get thumbnail/image
      let imageUrl = null;
      if (data.thumbnail && data.thumbnail.startsWith('http')) {
        imageUrl = data.thumbnail;
      } else if (data.preview?.images?.[0]?.source?.url) {
        imageUrl = data.preview.images[0].source.url.replace(/&amp;/g, '&');
      }
      
      // Calculate quality score based on upvotes and comments
      const upvotes = data.ups || 0;
      const comments = data.num_comments || 0;
      const qualityScore = Math.min(100, Math.round((upvotes / 10) + (comments / 2)));
      
      // Build deal object
      const deal = {
        product_name: title.trim(),
        price: price || 0,
        discount_pct: discountPct,
        product_url: dealUrl, // Direct link to purchase site
        image_url: imageUrl,
        source: `reddit_${subreddit}`,
        source_url: postUrl, // Reddit discussion link
        category: category,
        expires_at: null, // Reddit posts don't have expiration
        quality_score: qualityScore,
        is_active: true
      };
      
      deals.push(deal);
    }
    
    console.log(`✅ r/${subreddit}: Found ${deals.length} deals with ${MIN_DISCOUNT_PCT}%+ discount`);
    return deals;
    
  } catch (error) {
    console.error(`❌ r/${subreddit} scraper error:`, error.message);
    throw error;
  }
}

/**
 * Scrape all configured Reddit subreddits
 */
export async function scrapeReddit() {
  const subreddits = [
    'buildapcsales',      // PC/Tech
    'GameDeals',          // Video games
    'MUAontheCheap',      // Makeup & beauty
    'frugalmalefashion',  // Men's fashion
    'frugalfemalefashion',// Women's fashion
    'legodeals',          // LEGO toys
    'boardgamedeals',     // Board games
    'Sneakers'            // Sneaker deals
  ];
  
  const results = await Promise.allSettled(
    subreddits.map(sub => scrapeRedditSubreddit(sub))
  );
  
  // Combine all deals
  const allDeals = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allDeals.push(...result.value);
    } else {
      console.error(`Failed to scrape r/${subreddits[index]}:`, result.reason);
    }
  });
  
  return allDeals;
}

// Export individual subreddit scrapers too
export async function scrapeBuildAPCSales() {
  return scrapeRedditSubreddit('buildapcsales');
}

export async function scrapeGameDeals() {
  return scrapeRedditSubreddit('GameDeals');
}

// Test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeReddit()
    .then(deals => {
      console.log(`\n📋 Total: ${deals.length} deals found`);
      console.log('\nSample deals:');
      deals.slice(0, 3).forEach(deal => {
        console.log(`\n${deal.product_name}`);
        console.log(`  💰 $${deal.price} (${deal.discount_pct}% off)`);
        console.log(`  📁 Category: ${deal.category}`);
        console.log(`  ⭐ Quality: ${deal.quality_score}/100`);
        console.log(`  🔗 ${deal.product_url}`);
      });
    })
    .catch(console.error);
}

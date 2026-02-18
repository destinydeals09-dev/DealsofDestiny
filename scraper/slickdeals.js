// Slickdeals RSS Scraper
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const SLICKDEALS_RSS = 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1';
const MIN_DISCOUNT_PCT = 50; // Only deals with 50%+ discount

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
 * Scrape Slickdeals frontpage RSS feed
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
  
  try {
    console.log('📡 Fetching Slickdeals RSS feed...');
    const feed = await parser.parseURL(SLICKDEALS_RSS);
    
    const deals = [];
    
    for (const item of feed.items) {
      const title = item.title || '';
      const description = item.description || '';
      const link = item.link || '';
      
      // Extract discount percentage
      const discountPct = extractDiscountPercent(title, description);
      
      // Filter: Only deals with 50%+ discount
      if (!discountPct || discountPct < MIN_DISCOUNT_PCT) {
        continue;
      }
      
      // Extract price
      const price = extractPrice(title, description);
      
      // Extract image from description HTML
      let imageUrl = null;
      try {
        const $ = cheerio.load(description);
        imageUrl = $('img').first().attr('src');
      } catch (err) {
        // No image, that's okay
      }
      
      // Build deal object
      const deal = {
        product_name: title.trim(),
        price: price || 0,
        discount_pct: discountPct,
        product_url: link,
        image_url: imageUrl || null,
        source: 'slickdeals',
        source_url: link,
        category: 'general', // Slickdeals doesn't categorize in RSS
        expires_at: null, // Could parse from description if needed
        quality_score: 100, // Slickdeals frontpage is high quality
        is_active: true
      };
      
      deals.push(deal);
    }
    
    console.log(`✅ Slickdeals: Found ${deals.length} deals with ${MIN_DISCOUNT_PCT}%+ discount`);
    return deals;
    
  } catch (error) {
    console.error('❌ Slickdeals scraper error:', error.message);
    throw error;
  }
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

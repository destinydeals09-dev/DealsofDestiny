// Amazon scraper - improved with API approach
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeAmazon() {
  const deals = [];

  try {
    console.log('🛒 Scraping Amazon...');
    
    // Use Amazon's RSS feed for Gold Box deals (public, no auth needed)
    const response = await axios.get('https://www.amazon.com/gp/goldbox/rss/feed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data, { xmlMode: true });

    $('item').each((i, item) => {
      try {
        if (i >= 50) return false; // Limit to 50 deals

        const title = $(item).find('title').text().trim();
        const link = $(item).find('link').text().trim();
        const description = $(item).find('description').text();

        // Extract price from description
        const priceMatch = description.match(/\$([0-9,.]+)/);
        const wasMatch = description.match(/was \$([0-9,.]+)/i);
        
        if (!priceMatch) return;

        const salePrice = parseFloat(priceMatch[1].replace(/,/g, ''));
        const originalPrice = wasMatch 
          ? parseFloat(wasMatch[1].replace(/,/g, ''))
          : salePrice * 1.2;

        const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

        // Category detection
        let category = 'Electronics';
        const titleLC = title.toLowerCase();
        if (titleLC.includes('laptop')) category = 'Laptops';
        else if (titleLC.includes('headphone') || titleLC.includes('earbuds')) category = 'Audio';
        else if (titleLC.includes('toy') || titleLC.includes('lego')) category = 'Toys';
        else if (titleLC.includes('makeup') || titleLC.includes('beauty')) category = 'Beauty';
        else if (titleLC.includes('tv')) category = 'TVs';

        deals.push({
          product_name: title,
          description: null,
          category: category,
          original_price: originalPrice,
          sale_price: salePrice,
          discount_percent: discount,
          image_url: null,
          product_url: link.split('?')[0], // Remove tracking
          source: 'amazon'
        });
      } catch (err) {
        // Skip invalid items
      }
    });

    console.log(`✅ Amazon: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Amazon scraping failed:', error.message);
  }

  return deals;
}

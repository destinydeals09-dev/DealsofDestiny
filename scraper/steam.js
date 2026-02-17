// Steam scraper
import axios from 'axios';

export async function scrapeSteam() {
  const deals = [];

  try {
    console.log('🎮 Scraping Steam...');

    // Steam specials API endpoint
    const response = await axios.get('https://store.steampowered.com/api/featuredcategories', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const specials = response.data?.specials?.items || [];

    for (const item of specials.slice(0, 50)) { // Limit to top 50 deals
      try {
        const discount = item.discount_percent || 0;
        if (discount === 0) continue; // Skip non-discounted items

        const originalPrice = item.original_price ? (item.original_price / 100) : null;
        const salePrice = item.final_price ? (item.final_price / 100) : null;

        if (!salePrice) continue;

        // Category detection from Steam tags
        let category = 'Games';
        if (item.tags) {
          const tagLC = item.tags.toLowerCase();
          if (tagLC.includes('action')) category = 'Action Games';
          else if (tagLC.includes('rpg') || tagLC.includes('role-playing')) category = 'RPG';
          else if (tagLC.includes('strategy')) category = 'Strategy Games';
          else if (tagLC.includes('simulation')) category = 'Simulation';
          else if (tagLC.includes('indie')) category = 'Indie Games';
        }

        deals.push({
          product_name: item.name,
          description: item.header_image ? null : 'Steam game on sale',
          category: category,
          original_price: originalPrice,
          sale_price: salePrice,
          discount_percent: discount,
          image_url: item.large_capsule_image || item.header_image || null,
          product_url: `https://store.steampowered.com/app/${item.id}`,
          source: 'steam'
        });
      } catch (err) {
        console.error('Error parsing Steam item:', err);
      }
    }

    console.log(`✅ Steam: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Steam scraping failed:', error.message);
    throw error;
  }

  return deals;
}

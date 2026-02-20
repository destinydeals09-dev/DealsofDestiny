import axios from 'axios';

export async function scrapeSteam() {
  const deals = [];

  try {
    console.log('🎮 Scraping Steam...');

    // Try a different Steam API endpoint that lists specials
    const response = await axios.get('https://store.steampowered.com/api/featuredcategories');

    // Parse the specials section
    const specials = response.data?.specials?.items || [];

    for (const item of specials) {
      // Only include if discount is >= 20% (Lowered from 50%)
      if (!item.discount_percent || item.discount_percent < 20) continue;

      const originalPrice = item.original_price ? (item.original_price / 100) : null;
      const salePrice = item.final_price ? (item.final_price / 100) : null;

      // Skip if price is missing or too low ($10+ minimum original price)
      if (!salePrice || (originalPrice && originalPrice < 10)) continue;

      // Strict Image Requirement
      const imageUrl = item.large_capsule_image || item.header_image;
      if (!imageUrl) continue;

      deals.push({
        product_name: item.name,
        original_price: originalPrice,
        sale_price: salePrice,
        discount_percent: item.discount_percent,
        image_url: imageUrl,
        product_url: `https://store.steampowered.com/app/${item.id}`,
        source: 'steam',
        category: 'gaming',
        quality_score: 90,
        is_active: true
      });
    }

    console.log(`✅ Steam: Found ${deals.length} deals`);
    return deals;
  } catch (error) {
    console.error('❌ Steam scraping failed:', error.message);
    return [];
  }
}
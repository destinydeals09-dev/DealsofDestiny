// GameStop scraper
import puppeteer from 'puppeteer';

export async function scrapeGameStop() {
  const deals = [];
  let browser;

  try {
    console.log('🎮 Scraping GameStop...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // GameStop deals page
    await page.goto('https://www.gamestop.com/deals', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('.product-tile, .product, [data-product]', { timeout: 10000 }).catch(() => {
      console.log('GameStop: No products found');
    });

    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('.product-tile, .product, [data-product]');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('.product-name, .pdp-link a, a.name-link');
          const priceEl = card.querySelector('.price-value, .sales .value');
          const originalPriceEl = card.querySelector('.strike-through .value, [data-list-price]');
          const imageEl = card.querySelector('img');
          const linkEl = card.querySelector('a[href*="/product/"]');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.2;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.gamestop.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          let category = 'Gaming';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('xbox') || nameLC.includes('playstation') || nameLC.includes('nintendo')) category = 'Consoles';
          else if (nameLC.includes('controller') || nameLC.includes('headset')) category = 'Accessories';
          else if (nameLC.includes('game') || nameLC.includes('edition')) category = 'Video Games';

          items.push({ name, originalPrice, salePrice, discount, url, image, category });
        } catch (err) {
          // Skip
        }
      });

      return items;
    });

    scrapedDeals.forEach(deal => {
      deals.push({
        product_name: deal.name,
        description: null,
        category: deal.category,
        original_price: deal.originalPrice,
        sale_price: deal.salePrice,
        discount_percent: deal.discount,
        image_url: deal.image,
        product_url: deal.url,
        source: 'gamestop'
      });
    });

    console.log(`✅ GameStop: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ GameStop scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

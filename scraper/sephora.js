// Sephora scraper
import puppeteer from 'puppeteer';

export async function scrapeSephora() {
  const deals = [];
  let browser;

  try {
    console.log('💄 Scraping Sephora...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Sephora sale page
    await page.goto('https://www.sephora.com/sale', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('[data-comp="ProductGrid"], .css-product-tile', { timeout: 10000 }).catch(() => {
      console.log('Sephora: No products found');
    });

    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('[data-comp="ProductTile"], .css-product-tile, [data-at="product_tile"]');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('[data-at="product_name"], .css-product-name');
          const priceEl = card.querySelector('[data-at="price"], .css-price');
          const originalPriceEl = card.querySelector('[data-at="sku_list_price"], .css-original-price');
          const linkEl = card.querySelector('a[href*="/product/"]');
          const imageEl = card.querySelector('img');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.2;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.sephora.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          let category = 'Beauty';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('lipstick') || nameLC.includes('lip')) category = 'Makeup - Lips';
          else if (nameLC.includes('foundation') || nameLC.includes('concealer')) category = 'Makeup - Face';
          else if (nameLC.includes('eyeshadow') || nameLC.includes('mascara')) category = 'Makeup - Eyes';
          else if (nameLC.includes('skincare') || nameLC.includes('serum') || nameLC.includes('moisturizer')) category = 'Skincare';
          else if (nameLC.includes('perfume') || nameLC.includes('fragrance')) category = 'Fragrance';
          else if (nameLC.includes('hair')) category = 'Haircare';

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
        source: 'sephora'
      });
    });

    console.log(`✅ Sephora: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Sephora scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

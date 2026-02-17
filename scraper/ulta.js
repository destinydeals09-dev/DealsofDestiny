// Ulta scraper
import puppeteer from 'puppeteer';

export async function scrapeUlta() {
  const deals = [];
  let browser;

  try {
    console.log('💅 Scraping Ulta...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Ulta sale page
    await page.goto('https://www.ulta.com/sale', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('.ProductCard, [data-product]', { timeout: 10000 }).catch(() => {
      console.log('Ulta: No products found');
    });

    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('.ProductCard, [data-product], .product-tile');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('.ProductCard__title, .product-title a');
          const priceEl = card.querySelector('.ProductPricing__price, .product-price .sr-only');
          const originalPriceEl = card.querySelector('.ProductPricing__listPrice, .product-list-price');
          const linkEl = card.querySelector('a[href*="/p/"]');
          const imageEl = card.querySelector('img');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.2;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.ulta.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          let category = 'Beauty';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('lipstick') || nameLC.includes('lip gloss')) category = 'Makeup - Lips';
          else if (nameLC.includes('foundation') || nameLC.includes('powder')) category = 'Makeup - Face';
          else if (nameLC.includes('eyeshadow') || nameLC.includes('eyeliner') || nameLC.includes('mascara')) category = 'Makeup - Eyes';
          else if (nameLC.includes('skincare') || nameLC.includes('cream') || nameLC.includes('cleanser')) category = 'Skincare';
          else if (nameLC.includes('perfume') || nameLC.includes('cologne')) category = 'Fragrance';
          else if (nameLC.includes('shampoo') || nameLC.includes('conditioner') || nameLC.includes('hair')) category = 'Haircare';
          else if (nameLC.includes('nail')) category = 'Nail Care';

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
        source: 'ulta'
      });
    });

    console.log(`✅ Ulta: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Ulta scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

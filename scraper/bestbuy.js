// Best Buy scraper
import puppeteer from 'puppeteer';

export async function scrapeBestBuy() {
  const deals = [];
  let browser;

  try {
    console.log('🛒 Scraping Best Buy...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Best Buy Deal of the Day page
    await page.goto('https://www.bestbuy.com/site/misc/deal-of-the-day/pcmcat248000050016.c?id=pcmcat248000050016', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for products to load
    await page.waitForSelector('.sku-item', { timeout: 10000 }).catch(() => {
      console.log('No .sku-item found, trying alternative selector...');
    });

    // Extract deal data
    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('.sku-item, .product-card');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('.sku-title a, .sku-header a, h4 a');
          const priceEl = card.querySelector('.priceView-customer-price span, .pricing-price__regular-price');
          const originalPriceEl = card.querySelector('.pricing-price__regular-price, [data-testid="regular-price"]');
          const linkEl = card.querySelector('a[href*="/site/"]');
          const imageEl = card.querySelector('img');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice;
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.bestbuy.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          // Calculate discount
          const discount = originalPrice > salePrice 
            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
            : 0;

          // Basic category detection
          let category = 'Electronics';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('laptop') || nameLC.includes('macbook')) category = 'Laptops';
          else if (nameLC.includes('tv') || nameLC.includes('television')) category = 'TVs';
          else if (nameLC.includes('headphone') || nameLC.includes('earbuds')) category = 'Audio';
          else if (nameLC.includes('gpu') || nameLC.includes('graphics card') || nameLC.includes('rtx') || nameLC.includes('radeon')) category = 'Graphics Cards';
          else if (nameLC.includes('cpu') || nameLC.includes('processor') || nameLC.includes('ryzen') || nameLC.includes('intel')) category = 'Processors';

          items.push({
            name,
            originalPrice,
            salePrice,
            discount,
            url,
            image,
            category
          });
        } catch (err) {
          console.error('Error parsing card:', err);
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
        source: 'bestbuy'
      });
    });

    console.log(`✅ Best Buy: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Best Buy scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

// Walmart scraper
import puppeteer from 'puppeteer';

export async function scrapeWalmart() {
  const deals = [];
  let browser;

  try {
    console.log('🛒 Scraping Walmart...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Walmart rollbacks/deals
    await page.goto('https://www.walmart.com/shop/deals/electronics', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('[data-testid="list-view"], [data-item-id]', { timeout: 10000 }).catch(() => {
      console.log('Walmart: No products found');
    });

    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('[data-item-id], [data-testid="list-item"]');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('[data-automation-id="product-title"], span[data-automation-id="product-title"]');
          const priceEl = card.querySelector('[data-automation-id="product-price"] .w_iUH7');
          const originalPriceEl = card.querySelector('[data-automation-id="product-strikethrough-price"]');
          const linkEl = card.querySelector('a[link-identifier="product"]');
          const imageEl = card.querySelector('img');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.15;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.walmart.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          let category = 'Electronics';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('laptop')) category = 'Laptops';
          else if (nameLC.includes('tv')) category = 'TVs';
          else if (nameLC.includes('tablet')) category = 'Tablets';
          else if (nameLC.includes('headphone') || nameLC.includes('earbuds')) category = 'Audio';

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
        source: 'walmart'
      });
    });

    console.log(`✅ Walmart: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Walmart scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

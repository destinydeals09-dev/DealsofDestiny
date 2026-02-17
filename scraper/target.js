// Target scraper
import puppeteer from 'puppeteer';

export async function scrapeTarget() {
  const deals = [];
  let browser;

  try {
    console.log('🎯 Scraping Target...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Target electronics deals
    await page.goto('https://www.target.com/c/electronics-deals/-/N-5q0g0', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('[data-test="product-grid"], [data-test="@web/ProductCard"]', { timeout: 10000 }).catch(() => {
      console.log('Target: No products found');
    });

    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('[data-test="@web/ProductCard"], .h-display-flex');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('[data-test="product-title"], a[data-test="product-title"]');
          const priceEl = card.querySelector('[data-test="current-price"] span');
          const originalPriceEl = card.querySelector('[data-test="comparison-price"]');
          const linkEl = card.querySelector('a[href*="/p/"]');
          const imageEl = card.querySelector('img');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.15;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.target.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          let category = 'Electronics';
          const nameLC = name.toLowerCase();
          // Toys
          if (nameLC.includes('toy') || nameLC.includes('lego') || nameLC.includes('doll') || nameLC.includes('action figure')) category = 'Toys';
          else if (nameLC.includes('barbie') || nameLC.includes('hot wheels') || nameLC.includes('nerf')) category = 'Toys';
          // Beauty
          else if (nameLC.includes('makeup') || nameLC.includes('lipstick') || nameLC.includes('mascara')) category = 'Makeup';
          else if (nameLC.includes('skincare') || nameLC.includes('lotion')) category = 'Skincare';
          // Electronics
          else if (nameLC.includes('laptop')) category = 'Laptops';
          else if (nameLC.includes('headphone') || nameLC.includes('earbuds')) category = 'Audio';
          else if (nameLC.includes('tablet') || nameLC.includes('ipad')) category = 'Tablets';
          else if (nameLC.includes('tv')) category = 'TVs';
          else if (nameLC.includes('speaker')) category = 'Speakers';

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
        source: 'target'
      });
    });

    console.log(`✅ Target: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Target scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

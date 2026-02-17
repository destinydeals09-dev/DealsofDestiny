// Micro Center scraper
import puppeteer from 'puppeteer';

export async function scrapeMicroCenter() {
  const deals = [];
  let browser;

  try {
    console.log('🛒 Scraping Micro Center...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Micro Center deals page
    await page.goto('https://www.microcenter.com/site/products/pc-components.aspx', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('.product_wrapper, .productBox', { timeout: 10000 }).catch(() => {
      console.log('Micro Center: No products found');
    });

    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('.product_wrapper, .productBox');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('a[data-name], .pDescription a');
          const priceEl = card.querySelector('[data-price], .price span');
          const originalPriceEl = card.querySelector('.was, [data-was]');
          const imageEl = card.querySelector('img');
          const linkEl = nameEl;

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim() || nameEl.getAttribute('data-name');
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.15;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.microcenter.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          let category = 'PC Parts';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('gpu') || nameLC.includes('graphics')) category = 'Graphics Cards';
          else if (nameLC.includes('cpu') || nameLC.includes('processor') || nameLC.includes('ryzen') || nameLC.includes('intel')) category = 'Processors';
          else if (nameLC.includes('motherboard')) category = 'Motherboards';
          else if (nameLC.includes('ram') || nameLC.includes('memory')) category = 'Memory';
          else if (nameLC.includes('ssd') || nameLC.includes('nvme')) category = 'Storage';
          else if (nameLC.includes('case')) category = 'Cases';
          else if (nameLC.includes('psu') || nameLC.includes('power supply')) category = 'Power Supplies';

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
        source: 'microcenter'
      });
    });

    console.log(`✅ Micro Center: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Micro Center scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

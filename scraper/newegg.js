// Newegg scraper
import puppeteer from 'puppeteer';

export async function scrapeNewegg() {
  const deals = [];
  let browser;

  try {
    console.log('🛒 Scraping Newegg...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Newegg Shell Shocker deals
    await page.goto('https://www.newegg.com/promotions/nepro/index.html', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for products
    await page.waitForSelector('.item-cell, .item-container', { timeout: 10000 }).catch(() => {
      console.log('No items found on main page, checking alternative...');
    });

    // Extract deals
    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('.item-cell, .item-container');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('.item-title, a.item-title');
          const priceEl = card.querySelector('.price-current strong, .item-price');
          const linkEl = card.querySelector('a.item-title, a[href*="/p/"]');
          const imageEl = card.querySelector('img');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          let salePrice = priceEl.textContent.replace(/[^0-9.]/g, '');
          
          // Check for cents
          const centsEl = card.querySelector('.price-current sup');
          if (centsEl) {
            salePrice += centsEl.textContent.replace(/[^0-9]/g, '');
          }
          salePrice = parseFloat(salePrice);

          // Try to find original price (was price)
          const wasEl = card.querySelector('.price-was, [data-price-was]');
          let originalPrice = wasEl 
            ? parseFloat(wasEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.2; // Estimate 20% discount if not shown

          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.newegg.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

          // Category detection
          let category = 'PC Parts';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('gpu') || nameLC.includes('graphics card') || nameLC.includes('rtx') || nameLC.includes('radeon')) category = 'Graphics Cards';
          else if (nameLC.includes('cpu') || nameLC.includes('processor') || nameLC.includes('ryzen') || nameLC.includes('intel')) category = 'Processors';
          else if (nameLC.includes('motherboard') || nameLC.includes('mobo')) category = 'Motherboards';
          else if (nameLC.includes('ram') || nameLC.includes('memory')) category = 'Memory';
          else if (nameLC.includes('ssd') || nameLC.includes('hard drive') || nameLC.includes('storage')) category = 'Storage';
          else if (nameLC.includes('monitor')) category = 'Monitors';
          else if (nameLC.includes('keyboard') || nameLC.includes('mouse')) category = 'Peripherals';

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
          console.error('Error parsing Newegg card:', err);
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
        source: 'newegg'
      });
    });

    console.log(`✅ Newegg: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Newegg scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

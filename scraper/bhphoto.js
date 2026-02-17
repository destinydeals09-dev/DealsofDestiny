// B&H Photo scraper
import puppeteer from 'puppeteer';

export async function scrapeBHPhoto() {
  const deals = [];
  let browser;

  try {
    console.log('📷 Scraping B&H Photo...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // B&H deals page
    await page.goto('https://www.bhphotovideo.com/find/HotDeals.jsp', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('[data-selenium="itemSection"], .deal-item', { timeout: 10000 }).catch(() => {
      console.log('B&H Photo: No products found');
    });

    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('[data-selenium="itemSection"], .deal-item, div[itemtype="http://schema.org/Product"]');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('[data-selenium="itemTitle"], h3 a, [itemprop="name"]');
          const priceEl = card.querySelector('[data-selenium="uppedDecimalPriceFirst"], [data-selenium="pricingPrice"]');
          const originalPriceEl = card.querySelector('[data-selenium="wasPriceText"]');
          const linkEl = card.querySelector('a[data-selenium="itemTitle"], a[itemprop="url"]');
          const imageEl = card.querySelector('img[data-selenium="itemImage"], img[itemprop="image"]');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.15;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.bhphotovideo.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? (imageEl.src || imageEl.getAttribute('data-src')) : null;

          let category = 'Electronics';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('camera') || nameLC.includes('lens')) category = 'Cameras';
          else if (nameLC.includes('headphone') || nameLC.includes('mic')) category = 'Audio';
          else if (nameLC.includes('laptop') || nameLC.includes('computer')) category = 'Computers';
          else if (nameLC.includes('monitor') || nameLC.includes('display')) category = 'Monitors';
          else if (nameLC.includes('storage') || nameLC.includes('drive')) category = 'Storage';

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
        source: 'bhphoto'
      });
    });

    console.log(`✅ B&H Photo: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ B&H Photo scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

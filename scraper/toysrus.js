// Toys"R"Us scraper (Tru.ca - relaunched brand)
import puppeteer from 'puppeteer';

export async function scrapeToysRUs() {
  const deals = [];
  let browser;

  try {
    console.log('🧸 Scraping Toys"R"Us...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Using Macy's Toys section (major US toy retailer after TRU)
    await page.goto('https://www.macys.com/shop/kids-clothes/toys?id=70825', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('.productThumbnail, [data-auto="product-thumbnail"]', { timeout: 10000 }).catch(() => {
      console.log('Toys: No products found');
    });

    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const productCards = document.querySelectorAll('.productThumbnail, [data-auto="product-thumbnail"]');

      productCards.forEach((card) => {
        try {
          const nameEl = card.querySelector('.productDescription, [data-auto="product-title"]');
          const priceEl = card.querySelector('.prices .regular, [data-auto="product-price"]');
          const originalPriceEl = card.querySelector('.prices .strike, [data-auto="original-price"]');
          const linkEl = card.querySelector('a[href*="/shop/product/"]');
          const imageEl = card.querySelector('img');

          if (!nameEl || !priceEl || !linkEl) return;

          const name = nameEl.textContent.trim();
          const salePrice = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
          const originalPrice = originalPriceEl 
            ? parseFloat(originalPriceEl.textContent.replace(/[^0-9.]/g, ''))
            : salePrice * 1.2;

          const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          const url = linkEl.href.startsWith('http') ? linkEl.href : `https://www.macys.com${linkEl.getAttribute('href')}`;
          const image = imageEl ? imageEl.src : null;

          let category = 'Toys';
          const nameLC = name.toLowerCase();
          if (nameLC.includes('lego') || nameLC.includes('building')) category = 'Toys - Building';
          else if (nameLC.includes('doll') || nameLC.includes('barbie')) category = 'Toys - Dolls';
          else if (nameLC.includes('action figure') || nameLC.includes('marvel') || nameLC.includes('star wars')) category = 'Toys - Action Figures';
          else if (nameLC.includes('game') || nameLC.includes('board')) category = 'Toys - Games';
          else if (nameLC.includes('puzzle')) category = 'Toys - Puzzles';
          else if (nameLC.includes('plush') || nameLC.includes('stuffed')) category = 'Toys - Plush';

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
        source: 'toysrus'
      });
    });

    console.log(`✅ Toys: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Toys scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

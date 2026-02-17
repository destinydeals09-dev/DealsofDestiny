// Amazon scraper
import puppeteer from 'puppeteer';

export async function scrapeAmazon() {
  const deals = [];
  let browser;

  try {
    console.log('🛒 Scraping Amazon...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    const page = await browser.newPage();
    
    // Mimic real browser to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });
    
    // Amazon Gold Box (Today's Deals)
    await page.goto('https://www.amazon.com/gp/goldbox?ref_=nav_cs_gb', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for deals to load
    await page.waitForSelector('[data-testid="grid-deals-container"], .DealGridItem', { timeout: 10000 }).catch(() => {
      console.log('Amazon: No deals container found, trying alternative...');
    });

    // Extract deals
    const scrapedDeals = await page.evaluate(() => {
      const items = [];
      const dealCards = document.querySelectorAll('[data-testid="grid-deals-container"] > div, .DealGridItem, .DealCard');

      dealCards.forEach((card) => {
        try {
          const linkEl = card.querySelector('a[href*="/dp/"], a[href*="/gp/"]');
          const titleEl = card.querySelector('[data-testid="deal-title"], .DealTitle, .a-size-base-plus');
          const priceEl = card.querySelector('[data-testid="deal-price"], .a-price-whole, .priceBlockDealPriceString');
          const originalPriceEl = card.querySelector('[data-testid="list-price"], .a-text-price .a-offscreen');
          const discountEl = card.querySelector('[data-testid="deal-badge-percentage"], .badge-percentage');
          const imageEl = card.querySelector('img');

          if (!linkEl || !titleEl || !priceEl) return;

          const title = titleEl.textContent.trim();
          const salePriceText = priceEl.textContent.replace(/[^0-9.]/g, '');
          const salePrice = parseFloat(salePriceText);
          
          let originalPrice = salePrice;
          if (originalPriceEl) {
            const origText = originalPriceEl.textContent.replace(/[^0-9.]/g, '');
            originalPrice = parseFloat(origText) || salePrice;
          }

          let discount = 0;
          if (discountEl) {
            discount = parseInt(discountEl.textContent.replace(/[^0-9]/g, ''));
          } else if (originalPrice > salePrice) {
            discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
          }

          const url = linkEl.href.startsWith('http') 
            ? linkEl.href.split('?')[0] // Remove tracking params
            : `https://www.amazon.com${linkEl.getAttribute('href')}`.split('?')[0];
          const image = imageEl ? imageEl.src : null;

          // Category detection
          let category = 'Electronics';
          const titleLC = title.toLowerCase();
          if (titleLC.includes('laptop') || titleLC.includes('macbook')) category = 'Laptops';
          else if (titleLC.includes('headphone') || titleLC.includes('earbuds') || titleLC.includes('airpods')) category = 'Audio';
          else if (titleLC.includes('tablet') || titleLC.includes('ipad')) category = 'Tablets';
          else if (titleLC.includes('watch') || titleLC.includes('smartwatch')) category = 'Wearables';
          else if (titleLC.includes('keyboard') || titleLC.includes('mouse')) category = 'Peripherals';
          else if (titleLC.includes('monitor') || titleLC.includes('display')) category = 'Monitors';
          else if (titleLC.includes('tv') || titleLC.includes('television')) category = 'TVs';

          items.push({
            title,
            originalPrice,
            salePrice,
            discount,
            url,
            image,
            category
          });
        } catch (err) {
          // Skip problematic items
        }
      });

      return items;
    });

    scrapedDeals.forEach(deal => {
      deals.push({
        product_name: deal.title,
        description: null,
        category: deal.category,
        original_price: deal.originalPrice,
        sale_price: deal.salePrice,
        discount_percent: deal.discount,
        image_url: deal.image,
        product_url: deal.url,
        source: 'amazon'
      });
    });

    console.log(`✅ Amazon: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Amazon scraping failed:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

// Best Buy scraper - improved version
import { launchBrowserWithStealth, setupAntiDetection, getRandomUserAgent, delay, cleanPrice, calculateDiscount } from './utils.js';

export async function scrapeBestBuy() {
  const deals = [];
  let browser;

  try {
    console.log('🛒 Scraping Best Buy...');
    
    browser = await launchBrowserWithStealth();
    const page = await browser.newPage();
    
    await setupAntiDetection(page);
    await page.setUserAgent(getRandomUserAgent());
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Try multiple Best Buy deal pages
    const urls = [
      'https://www.bestbuy.com/site/electronics/top-deals/pcmcat1563299784494.c?id=pcmcat1563299784494',
      'https://www.bestbuy.com/site/electronics/deal-of-the-day/pcmcat248000050016.c?id=pcmcat248000050016'
    ];

    for (const url of urls) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await delay(2000);

        // Wait for products
        await page.waitForSelector('.sku-item, .shop-sku-list-item', { timeout: 5000 }).catch(() => {});

        const pageDeals = await page.evaluate(() => {
          const items = [];
          
          // Multiple selectors for Best Buy's changing structure
          const selectors = [
            '.sku-item',
            '.shop-sku-list-item', 
            '[class*="productListing"]',
            '[data-sku-id]'
          ];

          let productCards = [];
          for (const selector of selectors) {
            productCards = document.querySelectorAll(selector);
            if (productCards.length > 0) break;
          }

          productCards.forEach((card) => {
            try {
              const nameEl = card.querySelector('.sku-title, .sku-header, h4.sku-title');
              const priceEl = card.querySelector('.priceView-customer-price span, .priceView-hero-price span, [data-testid="customer-price"]');
              const linkEl = card.querySelector('a.sku-title, a[href*="/site/"]');
              const imageEl = card.querySelector('img');

              if (!nameEl || !linkEl) return;

              const name = nameEl.textContent.trim();
              const priceText = priceEl ? priceEl.textContent : '';
              const salePrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
              
              if (!salePrice || salePrice === 0) return;

              // Look for original price
              const wasEl = card.querySelector('.pricing-price__regular-price, [data-testid="regular-price"]');
              const originalPrice = wasEl ? parseFloat(wasEl.textContent.replace(/[^0-9.]/g, '')) : salePrice * 1.15;

              const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
              const url = linkEl.href;
              const image = imageEl ? imageEl.src : null;

              // Category detection
              let category = 'Electronics';
              const nameLC = name.toLowerCase();
              if (nameLC.includes('laptop') || nameLC.includes('macbook')) category = 'Laptops';
              else if (nameLC.includes('tv')) category = 'TVs';
              else if (nameLC.includes('headphone') || nameLC.includes('earbuds')) category = 'Audio';
              else if (nameLC.includes('gpu') || nameLC.includes('graphics')) category = 'Graphics Cards';
              else if (nameLC.includes('tablet')) category = 'Tablets';

              items.push({ name, originalPrice, salePrice, discount, url, image, category });
            } catch (err) {
              // Skip invalid items
            }
          });

          return items;
        });

        deals.push(...pageDeals.map(deal => ({
          product_name: deal.name,
          description: null,
          category: deal.category,
          original_price: deal.originalPrice,
          sale_price: deal.salePrice,
          discount_percent: deal.discount,
          image_url: deal.image,
          product_url: deal.url,
          source: 'bestbuy'
        })));

        if (deals.length > 0) break; // Stop if we found deals
      } catch (err) {
        console.log(`Best Buy: Skipping ${url}`);
      }
    }

    console.log(`✅ Best Buy: Found ${deals.length} deals`);
  } catch (error) {
    console.error('❌ Best Buy scraping failed:', error.message);
  } finally {
    if (browser) await browser.close();
  }

  return deals;
}

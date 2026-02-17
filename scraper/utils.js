// Scraper utilities for anti-detection

export const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

export function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export async function setupAntiDetection(page) {
  // Override navigator properties to avoid detection
  await page.evaluateOnNewDocument(() => {
    // Webdriver flag
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Chrome runtime
    window.chrome = {
      runtime: {},
    };

    // Permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );

    // Plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // Languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function launchBrowserWithStealth() {
  const puppeteer = (await import('puppeteer')).default;
  
  return await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security',
      '--disable-features=BlockInsecurePrivateNetworkRequests'
    ]
  });
}

export function cleanPrice(text) {
  if (!text) return 0;
  const cleaned = text.toString().replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

export function calculateDiscount(original, sale) {
  if (!original || !sale || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

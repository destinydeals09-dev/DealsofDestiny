import { scrapeMerchantFromSlickdeals } from './merchantFeed.js';

export async function scrapeWalmart() {
  return scrapeMerchantFromSlickdeals({
    source: 'walmart',
    hostMatch: ['walmart.com'],
    minPrice: 20,
    maxDeals: 30,
    category: 'home',
    feedUrls: [
      'https://feeds.feedburner.com/SlickdealsnetFP?format=xml',
      'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=walmart',
      'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=walmart+home'
    ]
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeWalmart().then((deals) => console.log(`Walmart deals: ${deals.length}`)).catch(console.error);
}

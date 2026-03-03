import { scrapeMerchantFromSlickdeals } from './merchantFeed.js';

export async function scrapeNewegg() {
  return scrapeMerchantFromSlickdeals({
    source: 'newegg',
    hostMatch: ['newegg.com'],
    minPrice: 20,
    maxDeals: 30,
    category: 'tech',
    feedUrls: [
      'https://feeds.feedburner.com/SlickdealsnetFP?format=xml',
      'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=newegg',
      'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=newegg+ssd'
    ]
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeNewegg().then((deals) => console.log(`Newegg deals: ${deals.length}`)).catch(console.error);
}

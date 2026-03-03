import { scrapeMerchantFromSlickdeals } from './merchantFeed.js';

export async function scrapeAmazon() {
  return scrapeMerchantFromSlickdeals({
    source: 'amazon',
    hostMatch: ['amazon.com'],
    minPrice: 20,
    maxDeals: 30,
    category: 'tech',
    feedUrls: [
      'https://feeds.feedburner.com/SlickdealsnetFP?format=xml',
      'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=amazon',
      'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1&q=amazon+electronics'
    ]
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeAmazon().then((deals) => console.log(`Amazon deals: ${deals.length}`)).catch(console.error);
}

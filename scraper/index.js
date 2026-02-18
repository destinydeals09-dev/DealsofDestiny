// Main scraper orchestrator
import { scrapeBestBuy } from './bestbuy.js';
import { scrapeNewegg } from './newegg.js';
import { scrapeSteam } from './steam.js';
import { scrapeAmazon } from './amazon.js';
import { scrapeMicroCenter } from './microcenter.js';
import { scrapeGameStop } from './gamestop.js';
import { scrapeTarget } from './target.js';
import { scrapeWalmart } from './walmart.js';
import { scrapeBHPhoto } from './bhphoto.js';
import { scrapeSephora } from './sephora.js';
import { scrapeUlta } from './ulta.js';
import { scrapeToysRUs } from './toysrus.js';
// New v2.0 scrapers (deal aggregation)
import { scrapeSlickdeals } from './slickdeals.js';
import { scrapeReddit } from './reddit.js';
import { upsertDeal, logScraperRun, deactivateOldDeals } from '../database/client.js';

async function runScraper(scraperFn, source) {
  const startTime = Date.now();
  let status = 'success';
  let deals = [];
  let inserted = 0;
  let updated = 0;
  let errorMessage = null;

  try {
    deals = await scraperFn();

    // Upsert each deal
    for (const deal of deals) {
      try {
        const result = await upsertDeal(deal);
        // If result has created_at === updated_at, it was inserted; otherwise updated
        if (result && result.length > 0) {
          const dbDeal = result[0];
          if (new Date(dbDeal.created_at).getTime() === new Date(dbDeal.updated_at).getTime()) {
            inserted++;
          } else {
            updated++;
          }
        }
      } catch (err) {
        console.error(`Failed to upsert deal: ${deal.product_name}`, err.message);
      }
    }

    console.log(`📊 ${source}: ${deals.length} scraped, ${inserted} new, ${updated} updated`);
  } catch (error) {
    status = 'failed';
    errorMessage = error.message;
    console.error(`❌ ${source} failed:`, errorMessage);
  }

  // Log the run
  const runTime = ((Date.now() - startTime) / 1000).toFixed(2);
  await logScraperRun({
    source,
    status,
    deals_scraped: deals.length,
    deals_inserted: inserted,
    deals_updated: updated,
    error_message: errorMessage,
    run_time_seconds: parseFloat(runTime)
  });

  return { source, status, count: deals.length, inserted, updated };
}

async function main() {
  console.log('🚀 Starting Deals of Destiny scraper...\n');

  const startTime = Date.now();

  // Deactivate old deals (older than 7 days)
  try {
    const deactivated = await deactivateOldDeals(7);
    if (deactivated && deactivated.length > 0) {
      console.log(`🗑️  Deactivated ${deactivated.length} old deals\n`);
    }
  } catch (err) {
    console.error('Error deactivating old deals:', err.message);
  }

  // Run all scrapers in parallel
  const results = await Promise.allSettled([
    // v2.0 Deal Aggregators (Priority - these work!)
    runScraper(scrapeSlickdeals, 'slickdeals'),
    runScraper(scrapeReddit, 'reddit'),
    runScraper(scrapeSteam, 'steam'),
    
    // v1.0 Retail scrapers (archived - anti-bot issues)
    // runScraper(scrapeBestBuy, 'bestbuy'),
    // runScraper(scrapeNewegg, 'newegg'),
    // runScraper(scrapeAmazon, 'amazon'),
    // runScraper(scrapeMicroCenter, 'microcenter'),
    // runScraper(scrapeGameStop, 'gamestop'),
    // runScraper(scrapeTarget, 'target'),
    // runScraper(scrapeWalmart, 'walmart'),
    // runScraper(scrapeBHPhoto, 'bhphoto'),
    // runScraper(scrapeSephora, 'sephora'),
    // runScraper(scrapeUlta, 'ulta'),
    // runScraper(scrapeToysRUs, 'toysrus')
  ]);

  // Summary
  console.log('\n📊 Scraping Summary:');
  console.log('─────────────────────────────────');
  
  let totalScraped = 0;
  let totalInserted = 0;
  let totalUpdated = 0;

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const { source, status, count, inserted, updated } = result.value;
      const emoji = status === 'success' ? '✅' : '❌';
      console.log(`${emoji} ${source.padEnd(10)} - ${count} deals (${inserted} new, ${updated} updated)`);
      totalScraped += count;
      totalInserted += inserted;
      totalUpdated += updated;
    } else {
      console.log(`❌ Error: ${result.reason}`);
    }
  });

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('─────────────────────────────────');
  console.log(`📦 Total: ${totalScraped} deals scraped`);
  console.log(`🆕 New: ${totalInserted}`);
  console.log(`🔄 Updated: ${totalUpdated}`);
  console.log(`⏱️  Time: ${totalTime}s`);
  console.log('─────────────────────────────────\n');
  console.log('✨ Scraping complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as runAllScrapers };

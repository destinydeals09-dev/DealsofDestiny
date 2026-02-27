import axios from 'axios';
import { supabase } from '../database/client.js';

const TARGET_CATEGORIES = ['fashion', 'beauty', 'tech', 'home', 'kitchen', 'fitness', 'toys', 'books'];
const MIN_PER_CATEGORY = 10;
const URL_SAMPLE_PER_CATEGORY = 3;
const MIN_RECENT_DEALS_24H = 80;

async function fetchActiveDeals() {
  const { data, error } = await supabase
    .from('hot_deals')
    .select('id,category,product_name,product_url,image_url,scraped_at')
    .limit(1000);

  if (error) throw error;
  return data || [];
}

function categoryCounts(deals) {
  const counts = Object.fromEntries(TARGET_CATEGORIES.map(c => [c, 0]));
  for (const d of deals) {
    const c = (d.category || '').toLowerCase();
    if (counts[c] !== undefined) counts[c] += 1;
  }
  return counts;
}

function sampleDealsByCategory(deals) {
  const byCat = Object.fromEntries(TARGET_CATEGORIES.map(c => [c, []]));
  for (const d of deals) {
    const c = (d.category || '').toLowerCase();
    if (byCat[c] && byCat[c].length < URL_SAMPLE_PER_CATEGORY) byCat[c].push(d);
  }
  return Object.values(byCat).flat();
}

async function urlReachable(url) {
  if (!url) return false;
  try {
    const res = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 5,
      validateStatus: s => (s >= 200 && s < 400) || s === 403 || s === 429,
      headers: { 'User-Agent': 'Mozilla/5.0 (QA Bot)' }
    });
    return (res.status >= 200 && res.status < 400) || res.status === 403 || res.status === 429;
  } catch {
    return false;
  }
}

async function runQACheck() {
  console.log('🧪 Running Grabbit morning QA check...');

  const deals = await fetchActiveDeals();
  const counts = categoryCounts(deals);

  const now = Date.now();
  const recent24h = deals.filter(d => now - new Date(d.scraped_at).getTime() <= 24 * 60 * 60 * 1000).length;

  const coverageFailures = TARGET_CATEGORIES
    .map(c => ({ category: c, count: counts[c] || 0 }))
    .filter(x => x.count < MIN_PER_CATEGORY);

  const urlSamples = sampleDealsByCategory(deals);
  let urlFailures = 0;
  for (const d of urlSamples) {
    const ok = await urlReachable(d.product_url);
    if (!ok) {
      urlFailures += 1;
      console.log(`❌ URL failed: [${d.category}] ${d.product_name} -> ${d.product_url}`);
    }
  }

  console.log('\n📊 QA Summary');
  console.log('─────────────────────────────────');
  for (const c of TARGET_CATEGORIES) {
    const n = counts[c] || 0;
    const icon = n >= MIN_PER_CATEGORY ? '✅' : '⚠️';
    console.log(`${icon} ${c.padEnd(8)} ${String(n).padStart(3)} deals`);
  }
  console.log(`🕒 Fresh (24h): ${recent24h}`);
  console.log(`🔗 URL samples checked: ${urlSamples.length}, failed: ${urlFailures}`);
  console.log('─────────────────────────────────');

  let failed = false;

  if (coverageFailures.length > 0) {
    failed = true;
    console.log('❌ Coverage failures:');
    for (const f of coverageFailures) {
      console.log(`- ${f.category}: ${f.count}/${MIN_PER_CATEGORY}`);
    }
  }

  if (recent24h < MIN_RECENT_DEALS_24H) {
    failed = true;
    console.log(`❌ Freshness failure: ${recent24h} recent deals < ${MIN_RECENT_DEALS_24H}`);
  }

  if (urlFailures > 0) {
    failed = true;
    console.log(`❌ URL health failure: ${urlFailures} sample URLs unreachable`);
  }

  if (failed) {
    console.log('\n🚨 QA CHECK FAILED');
    process.exit(2);
  }

  console.log('\n✅ QA CHECK PASSED');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runQACheck().catch(err => {
    console.error('QA check crashed:', err.message);
    process.exit(1);
  });
}

export { runQACheck };

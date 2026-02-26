import { runAllScrapers } from './index.js';
import { supabase } from '../database/client.js';

const TARGET_CATEGORIES = ['fashion', 'beauty', 'tech', 'home', 'kitchen', 'fitness', 'toys', 'books'];
const MIN_PER_CATEGORY = 10;

async function getCoverageCounts() {
  const { data, error } = await supabase
    .from('deep_discount_deals')
    .select('category');

  if (error) throw error;

  const counts = Object.fromEntries(TARGET_CATEGORIES.map(c => [c, 0]));

  for (const row of data || []) {
    const category = (row.category || '').toLowerCase().trim();
    if (counts[category] !== undefined) counts[category] += 1;
  }

  return counts;
}

function getDeficits(counts) {
  return TARGET_CATEGORIES
    .map(category => ({
      category,
      count: counts[category] || 0,
      missing: Math.max(0, MIN_PER_CATEGORY - (counts[category] || 0))
    }))
    .filter(x => x.missing > 0);
}

function printCounts(title, counts) {
  console.log(`\n${title}`);
  console.log('─────────────────────────────────');
  for (const category of TARGET_CATEGORIES) {
    const n = counts[category] || 0;
    const ok = n >= MIN_PER_CATEGORY ? '✅' : '⚠️';
    console.log(`${ok} ${category.padEnd(8)} ${String(n).padStart(3)} deals`);
  }
  console.log('─────────────────────────────────');
}

async function ensureCategoryCoverage() {
  console.log('🎯 Ensuring category coverage...');
  console.log(`Goal: >= ${MIN_PER_CATEGORY} deals in each target category`);

  const before = await getCoverageCounts();
  printCounts('Before refresh', before);

  let deficits = getDeficits(before);
  if (deficits.length === 0) {
    console.log('\n✅ Coverage already meets target.');
    return;
  }

  console.log('\n🚀 Coverage deficit detected. Running full scraper refresh...');
  await runAllScrapers();

  const after = await getCoverageCounts();
  printCounts('After refresh', after);

  deficits = getDeficits(after);
  if (deficits.length === 0) {
    console.log('\n✅ Coverage target achieved for all categories.');
    return;
  }

  console.log('\n❌ Coverage still below target in:');
  for (const d of deficits) {
    console.log(`- ${d.category}: ${d.count}/${MIN_PER_CATEGORY} (missing ${d.missing})`);
  }

  process.exitCode = 2;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ensureCategoryCoverage().catch(err => {
    console.error('Coverage worker failed:', err.message);
    process.exit(1);
  });
}

export { ensureCategoryCoverage };

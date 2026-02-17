// Test Supabase connection
import { supabase, getActiveDeals, logScraperRun } from './client.js';

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');

  try {
    // Test 1: Query deals table
    console.log('Test 1: Fetching active deals...');
    const deals = await getActiveDeals(10);
    console.log(`✅ Success! Found ${deals.length} active deal(s)`);
    if (deals.length > 0) {
      console.log('Sample deal:', deals[0].product_name);
    }
    console.log('');

    // Test 2: Insert test scraper log
    console.log('Test 2: Inserting test scraper log...');
    const log = await logScraperRun({
      source: 'test',
      status: 'success',
      deals_scraped: 0,
      deals_inserted: 0,
      deals_updated: 0,
      run_time_seconds: 0.1
    });
    console.log('✅ Success! Log inserted:', log[0].id);
    console.log('');

    // Test 3: Query scraper logs
    console.log('Test 3: Fetching recent scraper logs...');
    const { data: logs, error } = await supabase
      .from('scraper_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    console.log(`✅ Success! Found ${logs.length} log entr${logs.length === 1 ? 'y' : 'ies'}`);
    console.log('');

    console.log('🎉 All tests passed! Database is ready.');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();

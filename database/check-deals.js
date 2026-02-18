// Quick check: What deals are in the database?
import { supabase } from './client.js';

async function checkDeals() {
  console.log('📊 Checking DealsofDestiny database...\n');
  
  // Count total deals
  const { count: totalCount } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);
  
  console.log(`Total active deals: ${totalCount}\n`);
  
  // Count by source
  const { data: bySource } = await supabase
    .from('deals')
    .select('source, discount_percent')
    .eq('active', true);
  
  const sourceStats = {};
  bySource.forEach(deal => {
    if (!sourceStats[deal.source]) {
      sourceStats[deal.source] = { count: 0, avgDiscount: 0, totalDiscount: 0 };
    }
    sourceStats[deal.source].count++;
    sourceStats[deal.source].totalDiscount += deal.discount_percent;
  });
  
  console.log('Deals by source:');
  Object.entries(sourceStats).forEach(([source, stats]) => {
    stats.avgDiscount = Math.round(stats.totalDiscount / stats.count);
    console.log(`  ${source.padEnd(25)} - ${stats.count} deals (avg ${stats.avgDiscount}% off)`);
  });
  
  // Top 5 deals
  console.log('\n🔥 Top 5 Deals (by discount):');
  const { data: topDeals } = await supabase
    .from('deals')
    .select('product_name, discount_percent, sale_price, source')
    .eq('active', true)
    .order('discount_percent', { ascending: false })
    .limit(5);
  
  topDeals.forEach((deal, i) => {
    console.log(`\n${i + 1}. ${deal.product_name.slice(0, 80)}`);
    console.log(`   💰 $${deal.sale_price} (${deal.discount_percent}% off) - ${deal.source}`);
  });
  
  console.log('\n✅ Database check complete!');
}

checkDeals().catch(console.error);

// Supabase client for Node.js (scraper usage)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local file.');
}

// Create client with service role key (bypass RLS, for backend only)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper: Insert or update deal (upsert based on product_url)
export async function upsertDeal(deal) {
  // Map v2.0 format to v1.0 schema
  // v2.0 uses: price, discount_pct, is_active, quality_score, expires_at
  // v1.0 uses: sale_price, discount_percent, active, source_url
  
  const dealData = {
    product_name: deal.product_name,
    description: deal.description || null,
    category: deal.category || 'general',
    original_price: deal.original_price || null,
    sale_price: deal.sale_price || deal.price || 0,
    discount_percent: deal.discount_percent || deal.discount_pct || 0,
    image_url: deal.image_url || null,
    product_url: deal.product_url,
    source: deal.source,
    scraped_at: new Date().toISOString(),
    active: deal.active !== undefined ? deal.active : (deal.is_active !== undefined ? deal.is_active : true)
  };

  const { data, error } = await supabase
    .from('deals')
    .upsert(dealData, { onConflict: 'product_url' })
    .select();

  if (error) {
    console.error('Error upserting deal:', error);
    throw error;
  }

  return data;
}

// Helper: Log scraper run
export async function logScraperRun(log) {
  const { data, error } = await supabase
    .from('scraper_logs')
    .insert({
      source: log.source,
      status: log.status,
      deals_scraped: log.deals_scraped || 0,
      deals_inserted: log.deals_inserted || 0,
      deals_updated: log.deals_updated || 0,
      error_message: log.error_message || null,
      run_time_seconds: log.run_time_seconds || 0
    })
    .select();

  if (error) {
    console.error('Error logging scraper run:', error);
    throw error;
  }

  return data;
}

// Helper: Get all active deals
export async function getActiveDeals(limit = 100) {
  const { data, error } = await supabase
    .from('hot_deals')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }

  return data;
}

// Helper: Mark old deals as inactive (older than X days)
export async function deactivateOldDeals(daysOld = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const { data, error } = await supabase
    .from('deals')
    .update({ active: false })
    .lt('scraped_at', cutoffDate.toISOString())
    .eq('active', true)
    .select();

  if (error) {
    console.error('Error deactivating old deals:', error);
    throw error;
  }

  return data;
}

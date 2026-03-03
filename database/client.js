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

const TRACKING_PARAMS = [
  'clickid', 'irgwc', 'afsrc', 'sourceid', 'veh',
  'wmlspartner', 'affiliates_ad_id', 'campaign_id', 'sharedid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'ref', 'ref_', 'tag', 'ascsubtag'
];

const STOPWORDS = new Set(['with', 'and', 'for', 'the', 'from', 'free', 'shipping', 'more', 'plus']);

const BLOCKED_URL_PATTERNS = [
  // Recurring dead/blocked URLs hurting QA reliability
  'walmart.com/ip/18411724651',
  'walmart.com/ip/balancefrom-rubber-encased-hex-dumbbells-35-lbs-pair-black/543158152',
  'walmart.com/ip/5157277001',
  'walmart.com/ip/5-tier-book-shelf-large-wooden-bookcase-with-open-display-shelf-modern-bookshelf-metal-frame-furniture-for-living-room-bedroom-home-office-vintage/17310854797',
  'walmart.com/ip/15914794',
  'walmart.com/ip/5430838726',
  'costco.com/p/-/msi-aegis-gaming-desktop-amd-ryzen-9-9900x-geforce-rtx-5080-windows-11-home-32gb-ram-2tb-ssd/4000355760'
];

function normalizeProductUrl(rawUrl) {
  if (!rawUrl) return '';

  try {
    const url = new URL(rawUrl);

    if (url.hostname.includes('walmart.com') && url.pathname.includes('/ip/seort/')) {
      url.pathname = url.pathname.replace('/ip/seort/', '/ip/');
    }

    TRACKING_PARAMS.forEach(param => url.searchParams.delete(param));
    url.hash = '';

    return url.toString();
  } catch {
    return rawUrl;
  }
}

function normalizeName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleSignature(name = '') {
  const tokens = normalizeName(name)
    .split(' ')
    .filter(Boolean)
    .filter(t => !STOPWORDS.has(t));

  return tokens.slice(0, 8).join(' ');
}

function inferMerchant(productUrl, fallbackSource) {
  try {
    const hostname = new URL(productUrl).hostname.toLowerCase();
    if (hostname.includes('walmart')) return 'walmart';
    if (hostname.includes('amazon')) return 'amazon';
    if (hostname.includes('target')) return 'target';
    if (hostname.includes('bestbuy')) return 'bestbuy';
    if (hostname.includes('newegg')) return 'newegg';
    if (hostname.includes('gamestop')) return 'gamestop';
    if (hostname.includes('bhphotovideo') || hostname.includes('bhphoto')) return 'bhphoto';
    return hostname.replace(/^www\./, '');
  } catch {
    return fallbackSource || 'unknown';
  }
}

function computeQualityScore(dealData) {
  const discount = Number(dealData.discount_percent || 0);
  const salePrice = Number(dealData.sale_price || 0);
  const original = Number(dealData.original_price || 0);
  const savings = original > salePrice ? (original - salePrice) : 0;
  const sourceConfidence = Number(dealData.source_confidence ?? 60);

  let score = 0;
  score += Math.min(60, discount * 1.4);
  score += Math.min(20, savings / 5);
  score += Math.min(15, sourceConfidence / 8);
  if (dealData.image_url) score += 5;

  return Math.round(score);
}

function isSingleProductDeal(name = '') {
  const n = String(name).toLowerCase();

  const sitewidePatterns = [
    /\boutlet\b/, /\bclearance\b/, /\bsitewide\b/, /\bstorewide\b/, /\bup to\b/, /\bsale\b.*\boff\b/,
    /\bdeals?\b/, /\bselect\b.*\b(apparel|items|products)\b/, /\bmembers?\b/, /\bgift card\b/
  ];

  if (sitewidePatterns.some(re => re.test(n))) return false;
  return true;
}

function categoryLooksValid(category = '', name = '') {
  const c = String(category).toLowerCase();
  const n = String(name).toLowerCase();

  const has = (re) => re.test(n);

  const signals = {
    beauty: has(/makeup|lipstick|mascara|eyeliner|foundation|concealer|skincare|serum|moisturizer|cleanser|beauty|sephora|ulta|perfume|cologne|fragrance|shampoo|conditioner|eau de|deodorant/),
    fashion: has(/shirt|pants|jacket|dress|fashion|clothing|apparel|sneaker|shoe|hoodie|jeans|boots/),
    tech: has(/laptop|monitor|ssd|gpu|cpu|keyboard|mouse|headset|computer|electronics|tv|router|charger|battery|pc|usb/),
    home: has(/sofa|chair|table|lamp|bed|furniture|home decor|dresser|bookshelf|cabinet|mattress/),
    kitchen: has(/kitchen|cookware|pan|pot|blender|mixer|knife|air fryer|toaster|coffee maker|instant pot/),
    fitness: has(/fitness|gym|yoga|dumbbell|barbell|treadmill|protein|workout|weights|massage gun|exercise/),
    toys: has(/lego|toy|doll|nerf|board game|puzzle|action figure|playset/),
    books: has(/book|books|novel|kindle|paperback|hardcover|audiobook|ebook/),
    gaming: has(/playstation|ps5|ps4|xbox|switch|nintendo|steam|video game|gaming|ghost of tsushima/)
  };

  // Explicit rejects user called out.
  if (has(/golf cart battery/)) return false;
  if (c === 'beauty' && (signals.gaming || signals.home || has(/dresser|cabinet|bookshelf|furniture|golf cart|battery/))) return false;

  if (c in signals) {
    return !!signals[c];
  }

  return true;
}

function hasCreditCardLikeContent(name = '') {
  const n = String(name).toLowerCase();
  return /\bgift card\b|\bcredit card\b|\bdebit card\b|\bprepaid card\b|\bvisa\b|\bmastercard\b|\bamerican express\b|\bamex\b|\bdiscover card\b/.test(n);
}

function passesQualityGate(dealData) {
  const salePrice = Number(dealData.sale_price || 0);
  const discount = Number(dealData.discount_percent || 0);
  const hasName = !!dealData.product_name && dealData.product_name.trim().length >= 12;
  const hasUrl = !!dealData.product_url;

  if (!hasName || !hasUrl || salePrice <= 0) return false;
  if (hasCreditCardLikeContent(dealData.product_name)) return false;
  if (!isSingleProductDeal(dealData.product_name)) return false;
  if (!categoryLooksValid(dealData.category, dealData.product_name)) return false;

  const lowerUrl = String(dealData.product_url || '').toLowerCase();
  if (BLOCKED_URL_PATTERNS.some(pattern => lowerUrl.includes(pattern))) return false;

  // Light threshold so we keep category coverage while removing obvious junk.
  if (salePrice < 10) return false;
  if (discount < 5) return false;

  return true;
}

async function findNearDuplicateCandidate(dealData) {
  const signature = titleSignature(dealData.product_name);
  if (!signature) return null;

  const minPrice = Math.max(0, Number(dealData.sale_price || 0) - 3);
  const maxPrice = Number(dealData.sale_price || 0) + 3;

  const { data, error } = await supabase
    .from('deals')
    .select('id,product_name,product_url,quality_score,scraped_at,source_confidence')
    .eq('active', true)
    .eq('category', dealData.category)
    .gte('sale_price', minPrice)
    .lte('sale_price', maxPrice)
    .gte('scraped_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
    .limit(80);

  if (error || !data?.length) return null;

  return data.find(row => {
    const existingSig = titleSignature(row.product_name || '');
    if (!existingSig) return false;

    const overlap = existingSig.split(' ').filter(token => signature.includes(token)).length;
    return overlap >= 3;
  }) || null;
}

// Helper: Insert or update deal (upsert based on product_url)
export async function upsertDeal(deal) {
  const canonicalUrl = normalizeProductUrl(deal.product_url);
  const merchant = inferMerchant(canonicalUrl || deal.product_url, deal.source);

  // Map v2.0 format to v1.0+ schema
  const dealData = {
    product_name: deal.product_name,
    description: deal.description || null,
    category: deal.category || 'general',
    original_price: deal.original_price || null,
    sale_price: deal.sale_price || deal.price || 0,
    discount_percent: deal.discount_percent || deal.discount_pct || 0,
    image_url: deal.image_url || null,
    product_url: canonicalUrl,
    source: deal.source,
    source_url: deal.source_url || null,
    scraped_at: new Date().toISOString(),
    active: deal.active !== undefined ? deal.active : (deal.is_active !== undefined ? deal.is_active : true),
    merchant,
    network: deal.network || 'direct',
    source_confidence: deal.source_confidence ?? 70,
    is_verified: deal.is_verified ?? false
  };

  dealData.quality_score = deal.quality_score ?? computeQualityScore(dealData);

  if (!passesQualityGate(dealData)) {
    return [];
  }

  // Guardrail dedupe: if very similar deal exists recently, keep better-quality record.
  const nearDuplicate = await findNearDuplicateCandidate(dealData);
  if (nearDuplicate) {
    const existingScore = Number(nearDuplicate.quality_score || 0);
    if (existingScore >= dealData.quality_score) {
      return [];
    }

    // Replace weaker duplicate with stronger one by deactivating older row.
    await supabase
      .from('deals')
      .update({ active: false })
      .eq('id', nearDuplicate.id);
  }

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

// Helper: Dedupe active deals by semantic signature and keep strongest record.
export async function dedupeActiveDeals(limit = 20000) {
  const rows = [];
  const pageSize = 1000;
  let lastId = 0;

  while (rows.length < limit) {
    const { data, error } = await supabase
      .from('deals')
      .select('id,category,product_name,sale_price,quality_score,scraped_at,active')
      .eq('active', true)
      .gt('id', lastId)
      .order('id', { ascending: true })
      .limit(pageSize);

    if (error) {
      console.error('Error reading deals for dedupe:', error);
      throw error;
    }

    if (!data || data.length === 0) break;

    rows.push(...data);
    lastId = data[data.length - 1].id;

    if (data.length < pageSize) break;
  }

  const groups = new Map();
  for (const d of rows) {
    const key = [
      (d.category || '').toLowerCase().trim(),
      titleSignature(d.product_name || ''),
      Math.round(Number(d.sale_price || 0))
    ].join('|');

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(d);
  }

  const toDeactivate = [];

  for (const list of groups.values()) {
    if (list.length <= 1) continue;

    list.sort((a, b) => {
      const qa = Number(a.quality_score || 0);
      const qb = Number(b.quality_score || 0);
      if (qb !== qa) return qb - qa;

      const ta = new Date(a.scraped_at).getTime();
      const tb = new Date(b.scraped_at).getTime();
      return tb - ta;
    });

    for (let i = 1; i < list.length; i++) {
      toDeactivate.push(list[i].id);
    }
  }

  let deactivated = 0;
  const chunkSize = 200;

  for (let i = 0; i < toDeactivate.length; i += chunkSize) {
    const ids = toDeactivate.slice(i, i + chunkSize);
    const { data: updated, error: updateError } = await supabase
      .from('deals')
      .update({ active: false })
      .in('id', ids)
      .eq('active', true)
      .select('id');

    if (updateError) {
      console.error('Error deactivating duplicate deals:', updateError);
      throw updateError;
    }

    deactivated += (updated || []).length;
  }

  return { groups: groups.size, deactivated };
}

// Helper: Enforce long-lived content policy on active deals so fixes stick over time.
export async function enforceActiveDealPolicy(limit = 20000) {
  const rows = [];
  const pageSize = 1000;
  let lastId = 0;

  while (rows.length < limit) {
    const { data, error } = await supabase
      .from('deals')
      .select('id,product_name,category,sale_price,discount_percent,product_url,active')
      .eq('active', true)
      .gt('id', lastId)
      .order('id', { ascending: true })
      .limit(pageSize);

    if (error) {
      console.error('Error reading deals for policy enforcement:', error);
      throw error;
    }

    if (!data || data.length === 0) break;

    rows.push(...data);
    lastId = data[data.length - 1].id;

    if (data.length < pageSize) break;
  }

  const toDeactivate = [];

  for (const row of rows) {
    const dealLike = {
      product_name: row.product_name,
      category: row.category,
      sale_price: row.sale_price,
      discount_percent: row.discount_percent,
      product_url: row.product_url
    };

    if (!passesQualityGate(dealLike)) {
      toDeactivate.push(row.id);
    }
  }

  let deactivated = 0;
  const chunkSize = 200;

  for (let i = 0; i < toDeactivate.length; i += chunkSize) {
    const ids = toDeactivate.slice(i, i + chunkSize);
    const { data: updated, error: updateError } = await supabase
      .from('deals')
      .update({ active: false })
      .in('id', ids)
      .eq('active', true)
      .select('id');

    if (updateError) {
      console.error('Error deactivating policy-violating deals:', updateError);
      throw updateError;
    }

    deactivated += (updated || []).length;
  }

  return { scanned: rows.length, deactivated };
}

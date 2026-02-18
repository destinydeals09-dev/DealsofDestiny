An-- DealsofDestiny v2.0 Schema Updates
-- Adds support for deal aggregation sources (Slickdeals, Reddit, etc.)

-- 1. Update source constraint to include new aggregators
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_source_check;
-- Note: Reddit sources use format reddit_subredditname (reddit_buildapcsales, reddit_GameDeals, etc.)
-- Source validation removed to allow dynamic subreddits
-- Application layer will validate sources

-- 2. Add quality_score column (community upvotes, engagement)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_deals_quality ON deals(quality_score DESC);

-- 3. Add expires_at column (for time-limited deals)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL;
CREATE INDEX IF NOT EXISTS idx_deals_expires ON deals(expires_at);

-- 4. Add source_url column (link to deal discussion, not product page)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS source_url TEXT NULL;

-- 5. Update hot_deals view to include new columns
DROP VIEW IF EXISTS hot_deals;
CREATE OR REPLACE VIEW hot_deals AS
SELECT 
  id,
  product_name,
  category,
  original_price,
  sale_price,
  discount_percent,
  image_url,
  product_url,
  source,
  source_url,
  quality_score,
  expires_at,
  scraped_at
FROM deals
WHERE active = TRUE 
  AND (expires_at IS NULL OR expires_at > NOW()) -- Exclude expired deals
ORDER BY discount_percent DESC, quality_score DESC, scraped_at DESC;

-- 6. Add view for 50%+ deals only (primary v2.0 focus)
CREATE OR REPLACE VIEW deep_discount_deals AS
SELECT 
  id,
  product_name,
  category,
  original_price,
  sale_price,
  discount_percent,
  image_url,
  product_url,
  source,
  source_url,
  quality_score,
  expires_at,
  scraped_at
FROM deals
WHERE active = TRUE 
  AND discount_percent >= 50
  AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY discount_percent DESC, quality_score DESC, scraped_at DESC;

-- 7. Comment for future reference
COMMENT ON TABLE deals IS 'DealsofDestiny v2.0 - Aggregates deals from multiple sources with focus on 50%+ discounts';

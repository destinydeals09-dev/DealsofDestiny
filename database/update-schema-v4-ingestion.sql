-- v4 ingestion + monetization schema updates
-- Safe additive migration for deal enrichment + coverage operations

ALTER TABLE deals ADD COLUMN IF NOT EXISTS merchant TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS network TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS merchant_sku TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS upc TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS canonical_product_id TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS promo_type TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_starts_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE deals ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS source_confidence INTEGER DEFAULT 50;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS affiliate_url TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS raw_source_url TEXT;

-- Ensure score is bounded
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'deals_source_confidence_check'
  ) THEN
    ALTER TABLE deals
      ADD CONSTRAINT deals_source_confidence_check
      CHECK (source_confidence IS NULL OR (source_confidence >= 0 AND source_confidence <= 100));
  END IF;
END $$;

-- Helpful indexes for coverage and freshness jobs
CREATE INDEX IF NOT EXISTS idx_deals_category_active_scraped
  ON deals(category, active, scraped_at DESC);

CREATE INDEX IF NOT EXISTS idx_deals_merchant_active
  ON deals(merchant, active);

CREATE INDEX IF NOT EXISTS idx_deals_last_verified
  ON deals(last_verified_at DESC);

CREATE INDEX IF NOT EXISTS idx_deals_network
  ON deals(network);

CREATE INDEX IF NOT EXISTS idx_deals_canonical_product
  ON deals(canonical_product_id);

-- Partial index for fast active-coverage reads
CREATE INDEX IF NOT EXISTS idx_deals_active_category
  ON deals(category)
  WHERE active = true;

-- Deals of Destiny Database Schema
-- Target: Supabase PostgreSQL

-- Main deals table
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  original_price DECIMAL(10,2),
  sale_price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER,
  image_url TEXT,
  product_url TEXT NOT NULL UNIQUE, -- Unique to prevent duplicates
  source VARCHAR(20) NOT NULL CHECK (source IN ('bestbuy', 'newegg', 'steam')),
  scraped_at TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_source ON deals(source);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(active);
CREATE INDEX IF NOT EXISTS idx_deals_discount ON deals(discount_percent DESC);
CREATE INDEX IF NOT EXISTS idx_deals_scraped ON deals(scraped_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the function on UPDATE
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for active deals sorted by discount
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
  scraped_at
FROM deals
WHERE active = TRUE
ORDER BY discount_percent DESC, scraped_at DESC;

-- Optional: Scraper log table for monitoring
CREATE TABLE IF NOT EXISTS scraper_logs (
  id SERIAL PRIMARY KEY,
  source VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  deals_scraped INTEGER DEFAULT 0,
  deals_inserted INTEGER DEFAULT 0,
  deals_updated INTEGER DEFAULT 0,
  error_message TEXT,
  run_time_seconds DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraper_logs_source ON scraper_logs(source);
CREATE INDEX IF NOT EXISTS idx_scraper_logs_created ON scraper_logs(created_at DESC);

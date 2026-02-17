-- Seed data for testing
-- Run this after schema.sql to populate with sample deals

INSERT INTO deals (
  product_name, 
  description, 
  category, 
  original_price, 
  sale_price, 
  discount_percent, 
  image_url, 
  product_url, 
  source
) VALUES
  (
    'NVIDIA GeForce RTX 4070 Ti', 
    'High-performance gaming GPU with ray tracing',
    'Graphics Cards',
    799.99,
    649.99,
    19,
    'https://placeholder.com/gpu.jpg',
    'https://www.bestbuy.com/sample-rtx4070ti',
    'bestbuy'
  ),
  (
    'AMD Ryzen 9 7950X',
    '16-core processor for gaming and content creation',
    'Processors',
    699.99,
    549.99,
    21,
    'https://placeholder.com/cpu.jpg',
    'https://www.newegg.com/sample-ryzen9',
    'newegg'
  ),
  (
    'Elden Ring',
    'Epic fantasy action RPG',
    'Games',
    59.99,
    29.99,
    50,
    'https://placeholder.com/eldenring.jpg',
    'https://store.steampowered.com/sample-eldenring',
    'steam'
  );

-- Sample scraper log entry
INSERT INTO scraper_logs (
  source,
  status,
  deals_scraped,
  deals_inserted,
  deals_updated,
  run_time_seconds
) VALUES
  ('bestbuy', 'success', 45, 12, 33, 8.5),
  ('newegg', 'success', 38, 8, 30, 7.2),
  ('steam', 'success', 120, 95, 25, 12.3);

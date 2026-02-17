-- Update source constraint to include beauty and toy retailers
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_source_check;
ALTER TABLE deals ADD CONSTRAINT deals_source_check 
  CHECK (source IN ('bestbuy', 'newegg', 'steam', 'amazon', 'microcenter', 'gamestop', 'target', 'walmart', 'bhphoto', 'sephora', 'ulta', 'toysrus'));

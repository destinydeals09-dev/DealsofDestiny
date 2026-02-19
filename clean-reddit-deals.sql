-- Deactivate all old Reddit deals that link to Reddit
-- This will force a fresh scrape with new direct purchase links

UPDATE deals 
SET active = false 
WHERE source LIKE 'reddit_%' 
  AND (
    product_url LIKE '%reddit.com%' 
    OR product_url LIKE '%redd.it%'
  );

-- Show how many were deactivated
SELECT 'Deactivated old Reddit deals' as status, COUNT(*) as count
FROM deals 
WHERE source LIKE 'reddit_%' 
  AND active = false
  AND (
    product_url LIKE '%reddit.com%' 
    OR product_url LIKE '%redd.it%'
  );

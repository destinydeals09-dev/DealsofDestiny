-- Fix source column to allow longer source names
-- reddit_frugalmalefashion = 24 chars, but limit was 20

ALTER TABLE deals ALTER COLUMN source TYPE VARCHAR(50);

-- Verify
SELECT 'Success! Source column now allows 50 characters.' as status;

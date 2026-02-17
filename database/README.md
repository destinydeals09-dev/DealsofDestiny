# Database Setup

## Supabase PostgreSQL Setup

### 1. Create Project
Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project:
- Name: DealsofDestiny
- Region: West US
- Plan: Free (500MB storage)

### 2. Run Schema
In Supabase Dashboard:
1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy/paste contents of `schema.sql`
4. Click **Run**

### 3. (Optional) Add Seed Data
For testing, run `seed.sql` the same way.

### 4. Get Connection Info
Go to **Project Settings** → **API**:
- Copy **Project URL** (e.g., `https://xxxxx.supabase.co`)
- Copy **anon public** API key
- Copy **service_role** key (for scraper - keep secret!)

### 5. Add to Environment Variables
Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Schema Overview

### `deals` Table
Main table storing all deal information from scrapers.

**Key Fields:**
- `product_url` - UNIQUE constraint prevents duplicates
- `active` - Boolean to soft-delete outdated deals
- `discount_percent` - Calculated from price difference

**Indexes:**
- Category, source, active status, discount (for filtering)
- Scraped timestamp (for freshness queries)

### `hot_deals` View
Pre-filtered view showing only active deals, sorted by discount.

### `scraper_logs` Table
Tracks scraper runs for monitoring and debugging.

## Row Level Security (RLS)

For MVP, we're using:
- **Frontend:** Public read access (anon key)
- **Scraper:** Write access (service_role key)

To enable RLS later (for user features):
```sql
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON deals
  FOR SELECT USING (active = true);
```

## Maintenance

**Mark old deals inactive:**
```sql
UPDATE deals 
SET active = false 
WHERE scraped_at < NOW() - INTERVAL '7 days';
```

**Clean up very old deals:**
```sql
DELETE FROM deals 
WHERE active = false 
AND scraped_at < NOW() - INTERVAL '30 days';
```

(Add these as cron jobs later)

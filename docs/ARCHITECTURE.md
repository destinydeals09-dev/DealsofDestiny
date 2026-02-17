# Deals of Destiny - Architecture

## Overview
Daily-updated deal aggregator for electronics & gaming, competing with Best Buy, Newegg, and Steam.

## System Components

### 1. Web Scraper (Mac mini - Local)
**Tech:** Node.js + Puppeteer  
**Function:** Daily scraping of deal pages  
**Targets:**
- Best Buy deals page
- Newegg daily deals
- Steam specials

**Output:** Structured JSON with:
- Product name
- Original price
- Sale price
- Discount %
- Category
- Image URL
- Product URL
- Source (bestbuy/newegg/steam)
- Scraped timestamp

### 2. Database (Supabase - PostgreSQL)
**Free Tier:** 500MB storage, 2GB bandwidth  
**Schema:**

```sql
CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  original_price DECIMAL(10,2),
  sale_price DECIMAL(10,2) NOT NULL,
  discount_percent INTEGER,
  image_url TEXT,
  product_url TEXT NOT NULL,
  source VARCHAR(20) NOT NULL, -- 'bestbuy', 'newegg', 'steam'
  scraped_at TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_category ON deals(category);
CREATE INDEX idx_source ON deals(source);
CREATE INDEX idx_active ON deals(active);
CREATE INDEX idx_discount ON deals(discount_percent DESC);
```

**Deduplication Strategy:**
- Check if product_url already exists
- If exists: update price, discount, timestamp
- If new: insert

### 3. Frontend (Next.js on Vercel)
**Free Tier:** Unlimited hobby projects, auto-scaling  
**Features:**
- Homepage: Grid view of top deals (sorted by discount %)
- Search bar: Real-time filtering
- Category filters: Electronics, PC Parts, Gaming, Peripherals
- Deal cards: Image, title, price (original + sale), discount badge
- Click-through: Opens product URL in new tab

**Tech Stack:**
- Next.js 14 (App Router)
- TailwindCSS for styling
- Supabase JS client for data fetching
- Vercel for hosting (auto-deploy from main branch)

### 4. Automation (OpenClaw Cron - Local)
**Schedule:** Daily at 6 AM PST  
**Job:**
1. Run scraper for all sources
2. Process and dedupe results
3. Batch insert/update to Supabase
4. Log results to Mission Control
5. Alert on failures

### 5. Mission Control (Next.js - Local Dev Server)
**Purpose:** Internal monitoring dashboard  
**Displays:**
- Last scrape timestamp
- Deal count by source
- Database size
- Error logs
- Monthly cost estimate

## Data Flow

```
┌─────────────┐
│   Scraper   │ (Mac mini, daily cron)
│  Puppeteer  │
└──────┬──────┘
       │ JSON batch
       ▼
┌─────────────┐
│  Supabase   │ (PostgreSQL)
│   Database  │
└──────┬──────┘
       │ REST API
       ▼
┌─────────────┐
│  Next.js    │ (Vercel)
│  Frontend   │
└─────────────┘
```

## Cost Breakdown

| Service | Plan | Cost/mo |
|---------|------|---------|
| Supabase | Free | $0 |
| Vercel | Hobby | $0 |
| Domain | Yearly | ~$1/mo |
| **Total** | | **~$1/mo** |

(Scales: Supabase Pro at $25/mo for 8GB; Vercel Pro at $20/mo for team features)

## MVP Constraints

**Must Have:**
- Scraping 3 sources (Best Buy, Newegg, Steam)
- Database with deduplication
- Clean, responsive frontend
- Daily auto-updates

**Nice to Have (post-MVP):**
- Price history tracking
- User accounts & favorites
- Deal alerts via email/SMS
- More sources (Amazon, GameStop, etc.)

## Security & Compliance

- No user data collected initially (read-only public deals)
- Rate-limit scraping to avoid bans (delay between requests)
- robots.txt compliance (scrape public deal pages only)
- GDPR not applicable (no EU user data)

---

**Next Steps:** See GitHub Issues #1-6 for implementation tasks.

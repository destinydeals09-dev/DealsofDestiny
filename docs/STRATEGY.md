# Deal Aggregator Strategy - v2.0

**Goal:** Aggregate deals from multiple sources, filter for 50%+ discounts, avoid anti-bot headaches.

## The New Approach: Aggregate Deal Sources

Instead of fighting retailer anti-bot systems, we scrape **deal aggregators and communities** that already do the hard work.

### Target Sources (Priority Order)

#### Tier 1: Easy Wins 🎯
1. **Slickdeals Frontpage** — Top community-voted deals
   - URL: `https://slickdeals.net/`
   - RSS: `https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1`
   - Easy to parse, high-quality deals

2. **Reddit r/buildapcsales** — PC/gaming deals
   - RSS: `https://www.reddit.com/r/buildapcsales/.rss`
   - JSON: `https://www.reddit.com/r/buildapcsales.json`
   - Discount % often in titles

3. **Reddit r/GameDeals** — Game deals
   - RSS: `https://www.reddit.com/r/GameDeals/.rss`
   - Similar structure to buildapcsales

4. **Steam Official API** — Already working! ✅
   - Keep this, it's gold

#### Tier 2: Medium Effort 🔧
5. **Slickdeals Search API** (Unofficial)
   - Filter by discount %
   - Category filters

6. **Facebook Marketplace API** — Local deals
   - Requires FB Graph API access
   - May need approval

7. **TechBargains** — Tech-focused deals
   - Similar structure to Slickdeals

#### Tier 3: Future 🚀
8. **CamelCamelCamel** — Amazon price tracking
9. **Honey/Rakuten** — Cashback deals
10. **Official Retailer APIs** — Best Buy, Walmart (if approved)

---

## Technical Architecture

### Data Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      DEAL SOURCES                           │
│  Slickdeals | Reddit | Steam | Facebook | Others            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    SCRAPERS (Node.js)                        │
│  • RSS Parser (for Reddit, Slickdeals)                      │
│  • API Client (for Steam, official APIs)                    │
│  • Puppeteer (fallback for complex sites)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  DEAL PARSER & FILTER                        │
│  • Extract: title, price, discount %, URL, image            │
│  • Filter: >= 50% off only                                  │
│  • Deduplication (same product from multiple sources)       │
│  • Quality score (upvotes, comments, source reputation)     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE DATABASE                          │
│  Table: deals                                                │
│  • id, title, price, discount_pct, url, image_url          │
│  • source, source_url, scraped_at, expires_at              │
│  • upvotes, quality_score                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS FRONTEND                            │
│  • Homepage: Top deals (sorted by discount %)               │
│  • Filters: Category, price range, discount %               │
│  • Deal details page                                        │
│  • "Claim Deal" → Redirect to source                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: MVP (Week 1) 🚀
**Goal:** Get 3 sources live with 50%+ filter

- [x] Steam API (already working)
- [ ] Slickdeals RSS scraper
- [ ] Reddit r/buildapcsales scraper
- [ ] Database schema: deals table with discount_pct
- [ ] Frontend: Basic deal listing
- [ ] Filter: Show only 50%+ discounts
- [ ] Automation: OpenClaw cron job (runs every 6 hours)

### Phase 2: Quality & Scale (Week 2) 📈
- [ ] Add Reddit r/GameDeals
- [ ] Add deduplication logic
- [ ] Add quality scoring (upvotes, comments)
- [ ] Frontend: Filters by category, price
- [ ] Add deal expiration tracking

### Phase 3: Expansion (Week 3+) 🌐
- [ ] Facebook Marketplace integration
- [ ] TechBargains scraper
- [ ] User-submitted deals
- [ ] Deal alerts (email/push notifications)

---

## Tech Stack

**Scrapers:**
- Node.js
- `rss-parser` for RSS feeds
- `axios` for JSON APIs
- `puppeteer` (only if needed)

**Database:**
- Supabase (PostgreSQL)
- Table: `deals` with columns:
  - `discount_pct` (filter >= 50)
  - `quality_score` (calculated)
  - `expires_at` (auto-cleanup)

**Frontend:**
- Next.js 14 (App Router)
- Vercel deployment
- Tailwind CSS

**Automation:**
- OpenClaw cron jobs (every 6 hours)
- Scraper runs on Mac mini

---

## Budget

**Monthly:**
- Supabase: Free tier (500MB, plenty for deals)
- Vercel: Free tier (hobby projects)
- Mac mini: Already owned, electricity ~$5/mo
- APIs: $0 (using RSS/free APIs)

**Total: $5-10/mo** 🎉

---

## Success Metrics

- **Week 1:** 50+ deals live with 50%+ discount
- **Week 2:** 200+ deals, 3+ sources
- **Week 3:** 500+ deals, 5+ sources, frontend launched
- **Month 1:** 1000+ deals, user traffic tracking

---

## Risk Mitigation

**Risk:** RSS feeds get rate-limited
- **Mitigation:** Cache aggressively, run every 6 hours (not hourly)

**Risk:** Deal quality is low (scams, expired deals)
- **Mitigation:** Quality scoring, upvote thresholds, manual curation

**Risk:** Legal issues with scraping
- **Mitigation:** Only scrape public RSS feeds and APIs (legal gray area but common practice)

---

## Next Steps

See **ROADMAP.md** for the kanban board and current priorities.

Built by E & Dezi 📊

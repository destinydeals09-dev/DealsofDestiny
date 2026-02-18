# DealsofDestiny Roadmap

**Last Updated:** 2026-02-18  
**Current Sprint:** MVP - Deal Aggregation v2.0

---

## 🎯 Current Focus: 50%+ Discount Aggregator

**Goal:** Aggregate deals from multiple sources, show only deep discounts (50%+)

---

## 📋 Kanban Board

### 🔴 BLOCKED / ISSUES
_(Nothing blocked right now)_

---

### 🟡 TODO (Prioritized)

#### P0: Critical Path (MVP Week 1)
- [x] **Slickdeals RSS Scraper** ✅ DONE (2026-02-18)
  - Parse Slickdeals frontpage RSS
  - Extract: title, price, discount %, URL, image
  - Filter: >= 50% only
  - **Owner:** Dezi
  - **Time:** 2 hours

- [x] **Reddit r/buildapcsales + GameDeals Scraper** ✅ DONE (2026-02-18)
  - Use Reddit JSON API
  - Parse discount % from title (e.g., "[50% off]")
  - Built for both subreddits
  - Quality scoring based on upvotes/comments
  - **Owner:** Dezi
  - **Time:** 3 hours

- [x] **Database Schema Update (v3)** ✅ DONE (2026-02-18)
  - Added `quality_score` column
  - Added `expires_at` timestamp
  - Added `source_url` column
  - Updated database client for v2.0 compatibility
  - Created deep_discount_deals view (50%+ only)
  - **Owner:** Dezi
  - **Time:** 1 hour

- [ ] **Run Schema Update in Supabase** 🔴 BLOCKED
  - Need to apply update-schema-v3.sql
  - **Owner:** E
  - **Estimate:** 5 minutes

- [ ] **Frontend: Deal Listing with 50% Filter**
  - Update Next.js homepage
  - Query deals WHERE discount_pct >= 50
  - Sort by discount % DESC
  - **Owner:** E (or Dezi)
  - **Estimate:** 3 hours

- [ ] **OpenClaw Cron Job Setup**
  - Run all scrapers every 6 hours
  - Log results to file
  - Alert on failures
  - **Owner:** Dezi
  - **Estimate:** 1 hour

#### P1: Important (MVP Week 1-2)
- [ ] **Reddit r/GameDeals Scraper**
  - Same as buildapcsales structure
  - **Estimate:** 2 hours

- [ ] **Deduplication Logic**
  - Detect duplicate deals from different sources
  - Keep highest quality source
  - **Estimate:** 3 hours

- [ ] **Deal Expiration Tracking**
  - Auto-archive deals older than 48 hours
  - **Estimate:** 2 hours

#### P2: Nice to Have
- [ ] Facebook Marketplace integration
- [ ] User-submitted deals
- [ ] Deal alerts (email/push)
- [ ] Category filters (Electronics, Gaming, Home, etc.)

---

### 🟢 IN PROGRESS

- **Slickdeals RSS Scraper** (Testing - works but needs more real-world data)
  - Built and tested
  - Extracts discounts from RSS
  - Filters for 50%+ only
  - **Status:** Ready for database integration

- **Reddit Scrapers** (Testing - works great!)
  - Built r/buildapcsales + r/GameDeals
  - Found 34 deals with 50%+ discount in test run
  - Quality scoring based on upvotes
  - **Status:** Ready for database integration

---

### ✅ DONE

#### Infrastructure & Planning
- [x] **Steam API Scraper** _(Already working)_
- [x] **Project Architecture** _(ARCHITECTURE.md)_
- [x] **Scraping Reality Check** _(SCRAPING_REALITY.md)_
- [x] **New Strategy Document** _(STRATEGY.md)_ - 2026-02-18
- [x] **Roadmap & Kanban Board** _(This file)_ - 2026-02-18
- [x] **Mac Mini Always-On Setup** _(Caffeinate enabled)_ - 2026-02-18
- [x] **WhatsApp Connection Fixed** _(Re-linked, stable)_ - 2026-02-18
- [x] **Security Posture Added to SOUL.md** - 2026-02-18
- [x] **PROJECT_STATUS.md** _(Autonomy guidelines)_ - 2026-02-18

#### v2.0 Scrapers (2026-02-18)
- [x] **Slickdeals RSS Scraper** - Discount extraction + 50% filter
- [x] **Reddit Scraper** - buildapcsales + GameDeals with quality scoring
- [x] **Database Schema v3** - quality_score, expires_at, source_url
- [x] **Database Client Update** - v1/v2 format compatibility
- [x] **Main Scraper Updated** - Integrated new sources, disabled retail scrapers
- [x] **Git Commit** - All v2.0 code committed

#### Automation Scripts Ready
- [x] **Daily Status Cron Script** - setup-daily-status.sh
- [x] **Scraper Cron Script** - setup-scraper-cron.sh

---

## 📅 Sprint Timeline

### Week 1: MVP (Feb 18-24)
**Goal:** 3 sources live, 50+ deals with 50%+ discounts

| Day | Tasks | Owner | Status |
|-----|-------|-------|--------|
| **Wed 2/18** | Slickdeals scraper | Dezi | ✅ DONE |
| | Reddit buildapcsales + GameDeals scraper | Dezi | ✅ DONE |
| | Database schema update (v3) | Dezi | ✅ DONE |
| | Apply schema to Supabase | E | 🔴 TODO |
| | Test full scraper run | Dezi | ⏸️ BLOCKED (needs schema) |
| **Thu 2/19** | Frontend 50% filter | E/Dezi | 🔴 TODO |
| | OpenClaw cron setup | Dezi | 🔴 TODO |
| **Fri 2/20** | Testing & debugging | E + Dezi | 🔴 TODO |
| | Add Reddit GameDeals | Dezi | 🔴 TODO |
| **Sat-Sun 2/21-22** | Deduplication logic | Dezi | 🔴 TODO |
| | Frontend polish | E | 🔴 TODO |
| **Mon 2/23** | Deploy to Vercel | E/Dezi | 🔴 TODO |
| | Announce MVP! 🎉 | E | 🔴 TODO |

### Week 2: Quality & Scale (Feb 25-Mar 3)
- Expand to 5+ sources
- Quality scoring system
- Deal expiration tracking
- Category filters

### Week 3+: Expansion
- Facebook Marketplace
- User submissions
- Deal alerts
- Mobile app (stretch goal)

---

## 🎯 Success Criteria

**Week 1 MVP:**
- ✅ 50+ deals live
- ✅ All deals >= 50% discount
- ✅ 3+ sources (Steam, Slickdeals, Reddit)
- ✅ Frontend deployed to Vercel
- ✅ Automated daily updates

**Week 2:**
- ✅ 200+ deals
- ✅ 5+ sources
- ✅ Quality scoring live
- ✅ No duplicate deals

**Month 1:**
- ✅ 1000+ deals
- ✅ User traffic tracking
- ✅ Social sharing functional

---

## 🚀 Quick Start Commands

```bash
# Run all scrapers manually
cd /Users/destiny/.openclaw/workspace/DealsofDestiny
node scraper/index.js

# Run specific scraper
node scraper/slickdeals.js

# Check database
# (Supabase dashboard or SQL client)

# Deploy frontend
cd frontend
npm run build
vercel deploy
```

---

## 📊 Metrics Dashboard

_(Will add once MVP is live)_

- Total deals in database
- Deals added in last 24h
- Average discount %
- Top performing sources
- Frontend traffic (Vercel Analytics)

---

## 🐛 Known Issues

1. **Steam scraper** — Works but needs discount % extraction
2. **Retail scrapers** — Blocked by anti-bot (archived, not deleted)

---

## 📝 Notes

- All dates in PST (America/Los_Angeles)
- Priority: P0 (critical) > P1 (important) > P2 (nice to have)
- Update this file daily during active development
- Move cards from TODO → IN PROGRESS → DONE as work progresses

---

**Questions? Ask E or Dezi.**

Built with ❤️ by E & Dezi 📊

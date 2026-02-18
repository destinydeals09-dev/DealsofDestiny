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
- [ ] **Slickdeals RSS Scraper**
  - Parse Slickdeals frontpage RSS
  - Extract: title, price, discount %, URL, image
  - Filter: >= 50% only
  - **Owner:** Dezi
  - **Estimate:** 4 hours

- [ ] **Reddit r/buildapcsales Scraper**
  - Use Reddit JSON API
  - Parse discount % from title (e.g., "[50% off]")
  - Store in database
  - **Owner:** Dezi
  - **Estimate:** 3 hours

- [ ] **Database Schema Update**
  - Add `discount_pct` column (integer)
  - Add `quality_score` column (integer)
  - Add `expires_at` timestamp
  - **Owner:** Dezi
  - **Estimate:** 1 hour

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

- **None** (starting fresh with new strategy)

---

### ✅ DONE

- [x] **Steam API Scraper** _(Already working)_
- [x] **Project Architecture** _(ARCHITECTURE.md)_
- [x] **Scraping Reality Check** _(SCRAPING_REALITY.md)_
- [x] **New Strategy Document** _(STRATEGY.md)_
- [x] **Roadmap & Kanban Board** _(This file)_
- [x] **Mac Mini Always-On Setup** _(Caffeinate enabled)_
- [x] **WhatsApp Connection Fixed** _(Re-linked, stable)_

---

## 📅 Sprint Timeline

### Week 1: MVP (Feb 18-24)
**Goal:** 3 sources live, 50+ deals with 50%+ discounts

| Day | Tasks | Owner | Status |
|-----|-------|-------|--------|
| **Wed 2/18** | Slickdeals scraper | Dezi | 🔴 TODO |
| | Reddit buildapcsales scraper | Dezi | 🔴 TODO |
| | Database schema update | Dezi | 🔴 TODO |
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

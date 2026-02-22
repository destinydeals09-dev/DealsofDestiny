# Grabbit / Deals of Destiny — Notion Workspace Packet

Use this packet to create a clean, executive-friendly Notion workspace quickly.

---

## 0) Workspace Structure (Top-Level Pages)

1. **🏢 Grabbit HQ (Home)**
2. **📌 Project Overview**
3. **🧱 Architecture & Stack**
4. **🗺️ Roadmap & Sprint Board**
5. **⚙️ Scraping Operations**
6. **🗄️ Data Model (Supabase)**
7. **🚀 Deployment & Infra**
8. **📊 Metrics & KPIs**
9. **🧪 Risks / Issues / Decisions**
10. **📚 Docs Library**

---

## 1) 🏢 Grabbit HQ (Home)

### Purpose
Single command center for E + Dezi to run Deals of Destiny/Grabbit.

### Quick Links
- Project Overview
- Roadmap & Sprint Board
- Scraping Operations
- Deployment & Infra
- Metrics & KPIs

### Current Objective
Build a high-trust deal platform focused on deep discounts (50%+) for deal seekers and family/kid-relevant categories.

### Current Stack
- Frontend: Next.js (Vercel)
- Database: Supabase PostgreSQL
- Scrapers: Node.js
- Automation: OpenClaw cron

### Priority Today
1) Retention loop MVP
2) Source quality scorecard
3) Family deals landing page

---

## 2) 📌 Project Overview

### Product
**Deals of Destiny (Grabbit)** — Deal aggregator surfacing high-value electronics, gaming, and family/kid deals.

### Vision
A fast, trusted destination for meaningful discounts with easy filtering, save/alert loops, and repeat visit habits.

### Strategy Shift (v2)
Instead of fighting anti-bot on retailers, prioritize aggregator/community sources:
- Slickdeals
- Reddit deal communities
- Steam API

### Why this works
- Faster source coverage
- Better signal from community votes/comments
- Lower scrape fragility
- Lower operating cost

---

## 3) 🧱 Architecture & Stack

### Components
1. **Scraper Layer**
   - RSS/API-first scraping approach
   - Sources include Slickdeals, Reddit communities, Steam

2. **Parser + Filter Layer**
   - Extract title/price/discount/source/image/url
   - Filter deep discounts (50%+)
   - Deduplication + quality scoring

3. **Data Layer (Supabase)**
   - PostgreSQL deals table
   - Indexes on category/source/discount/activity

4. **Frontend (Next.js + Vercel)**
   - Deal feed sorted by discount
   - Search + category filtering
   - Click-through to source merchant

5. **Automation (OpenClaw cron)**
   - Recurring scraper runs
   - Result logging + failure alerts

---

## 4) 🗺️ Roadmap & Sprint Board

### Current Sprint Goal
MVP: reliable multi-source intake + 50%+ deep discount feed.

### P0 (Critical)
- Apply Supabase schema update v3
- Complete frontend listing with 50% filter
- Configure/verify recurring scraper runs

### P1 (Important)
- Deduplication logic
- Deal expiration/archival
- Quality score tuning

### P2 (Expansion)
- Additional sources
- User alerts
- User accounts/favorites

---

## 5) ⚙️ Scraping Operations

### Current Source Set
- Steam
- Slickdeals
- Reddit deal communities
- (Retail scrapers archived where anti-bot made ROI poor)

### Operational Principles
- Prefer RSS/API over browser automation
- Batch writes to database
- Keep scrape cadence stable
- Add source quality scorecard (depth, freshness, stock reliability)

### Run Command
```bash
cd /Users/destiny/.openclaw/workspace/DealsofDestiny && npm run scrape
```

---

## 6) 🗄️ Data Model (Supabase)

### Core Entity: deals
Typical fields include:
- product_name/title
- original_price
- sale_price
- discount_percent
- source + source_url
- category
- image_url
- product_url
- quality_score
- expires_at
- scraped_at / updated_at

### Views
- Deep-discount view for 50%+ offers

### Data Rules
- Dedupe by URL/product signature
- Update existing rows when price/discount changes
- Archive stale deals by expiration window

---

## 7) 🚀 Deployment & Infra

### Runtime
- Scrapers: Mac mini
- Frontend: Vercel
- DB: Supabase

### Cost Profile
- Current infra designed to stay very low-cost while validating traction

### Reliability
- Must-have: successful scrape confirmations + failure alerts + run logs

---

## 8) 📊 Metrics & KPIs

### Funnel Metrics
- Deals ingested/day
- Valid deep-discount rate (>=50%)
- Duplicate rate
- Expired deal rate

### Product Metrics
- Daily active users
- Return visit rate (D1/D7)
- Save rate
- Alert signup rate
- Click-through rate to merchant

### Source Metrics
- Source freshness score
- Conversion-to-click by source
- % of bad/expired entries by source

---

## 9) 🧪 Risks / Issues / Decisions

### Key Risks
- Feed instability / source policy changes
- Deal quality variance
- User trust erosion if stale deals surface

### Active Decisions
- Prioritize trust and relevance over volume
- Keep monetization behind quality threshold
- Build retention loops early (save + alerts + daily hero deal)

---

## 10) 📚 Docs Library (linked)

- README.md
- docs/ARCHITECTURE.md
- docs/STRATEGY.md
- docs/ROADMAP.md
- docs/DEPLOYMENT.md
- docs/SCRAPING_REALITY.md
- database/README.md

---

## Suggested Notion Databases

1. **Tasks**
   - Fields: Task, Owner, Priority (P0/P1/P2), Status, ETA, Blocked By, Notes

2. **Sources**
   - Fields: Source, Type (RSS/API/Scrape), Reliability, Freshness, Quality Score, Last Run, Issues

3. **Scraper Runs**
   - Fields: Run Time, Success/Fail, Total Scraped, New, Updated, Errors, Duration

4. **Decisions Log**
   - Fields: Date, Decision, Why, Owner, Revisit Date

5. **KPIs Weekly**
   - Fields: Week, DAU, Return Rate, Save Rate, Alert Signups, CTR, Notes

---

## 7-Day Execution Snapshot

### Day 1-2
- Apply schema update
- Verify end-to-end scraper run
- Ship frontend 50%+ feed

### Day 3-4
- Add dedup + expiry logic
- Launch source scorecard v1

### Day 5-7
- Ship retention loop basics (save + alerts)
- Launch Family Deals landing page
- Start KPI tracking baseline

---

Prepared for easy paste/import into Notion by Dezi 📊

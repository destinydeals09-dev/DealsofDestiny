# Ingestion Plan: Fresh, Reliable, Monetizable Deal Coverage

_Last updated: 2026-02-26_

## Objective
Build a stable ingestion system that:
- Keeps each key category populated with **at least 10 active deals**
- Prioritizes top retailers (Target, Walmart, Best Buy, etc.) through scalable sources
- Supports affiliate monetization and verifiable freshness

Target categories:
- fashion
- beauty
- tech
- home
- kitchen
- fitness
- toys
- books

---

## Source Strategy (Hybrid)

### Tier 1 — Structured affiliate/product feeds (primary)
Use 2-3 networks first:
- Impact
- CJ Affiliate
- Awin (or Rakuten)

Why: stable formats, higher legal/compliance confidence, easier monetization attribution.

### Tier 2 — Discovery sources (secondary)
Keep and expand:
- Slickdeals RSS/search feeds
- Steam (already integrated)

Why: catches fast-moving opportunities and fills long-tail categories.

### Tier 3 — Headless scraping (fallback only)
Use browser automation for specific gaps where structured feeds are unavailable.

Why: expensive and brittle; should not be primary ingestion path.

---

## Data Model Requirements
A migration is included at `database/update-schema-v4-ingestion.sql` to add:

- merchant (text)
- network (text)
- merchant_sku (text)
- upc (text)
- canonical_product_id (text)
- promo_type (text)
- coupon_code (text)
- deal_starts_at (timestamptz)
- fetched_at (timestamptz)
- last_verified_at (timestamptz)
- source_confidence (int 0-100)
- is_verified (bool)
- affiliate_url (text)
- raw_source_url (text)

And indexes for category/freshness/merchant lookups.

---

## Category Floor Enforcement
Worker script: `scraper/ensureCategoryCoverage.js`

Workflow:
1. Read active deal counts for each target category
2. Identify deficits (<10)
3. Trigger a full scrape (`runAllScrapers`) to refresh inventory
4. Re-check counts
5. Print deficit report + pass/fail

Notes:
- This is a practical first pass that uses existing scrapers.
- As affiliate feeds are added, this worker should call targeted pullers per missing category.

---

## Rollout Plan

### Phase 1 (2–3 days)
- Apply v4 schema migration
- Add coverage worker to scheduled operations
- Keep Slickdeals + Steam active
- Add category coverage reporting to daily checks

### Phase 2 (3–5 days)
- Integrate first affiliate network feed
- Normalize merchant/network/canonical identifiers
- Improve dedupe confidence using SKU/UPC/title matching

### Phase 3 (1–2 weeks)
- Add additional affiliate networks
- Add verification loop for top deals per category
- Surface freshness and confidence badges in UI

---

## Operational Metrics (minimum)
- active_count by category (alert if <10)
- source contribution (% from each source/network)
- stale ratio (% not verified in last 24h)
- scrape failure rates
- duplicate suppression rate

---

## Immediate Next Actions
1. Run `database/update-schema-v4-ingestion.sql`
2. Run `node scraper/ensureCategoryCoverage.js`
3. Review deficit categories and tune source/category mappings
4. Integrate affiliate feed #1

# Execution Checklist — 2026-03-01

## Objective
Improve reliability + repeat usage for Deals of Destiny while keeping morning QA green.

## Today’s Top 3 Priorities

### 1) URL Health Reliability (IN PROGRESS)
- [x] Run morning QA baseline
- [x] Refresh scrape + re-run QA
- [x] Deploy latest frontend build to production
- [x] Add QA URL normalization for Walmart affiliate links (`/ip/seort/` -> `/ip/`)
- [x] Strip known tracking params before reachability check
- [x] Add URL failure-by-category breakdown to QA output
- [ ] Re-run QA and confirm failure reduction
- [ ] Add merchant-specific fallback checker (Walmart, Amazon, Target)

### 2) Source Resilience (NEXT)
- [ ] Add/enable at least 2 non-Slickdeals sources for beauty/kids segments
- [ ] Instrument source health metrics (new/day, dead-link %, dup rate)
- [ ] Alert if source outputs zero for 2+ consecutive runs

### 3) Retention UX Loop (NEXT)
- [ ] Ship "Fresh in 24h" module
- [ ] Ship "Price Drop" indicator
- [ ] Define quick follow/save spec for category alerts

## Deployment
- Latest production alias: https://frontend-beta-umber-htzy2a5f2c.vercel.app
- Current deployment URL: https://frontend-q97eh7chh-destinydeals09-devs-projects.vercel.app

## Notes
- Main blocker remains merchant URL reliability (esp. affiliate-form Walmart links).
- QA now reports failures by category for faster triage.

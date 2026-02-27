# Deals of Destiny

**Electronics & Gaming Deal Aggregator**

Competing with Best Buy, Newegg, and Steam by aggregating the best tech deals daily.

## Vision
A tech-forward platform that scrapes and aggregates top electronics and gaming deals, updated daily, with a clean browsing experience.

## MVP Timeline
**Target:** Live by end of week (Sunday 2026-02-17)

## Tech Stack
- **Frontend:** Next.js (Vercel)
- **Database:** Supabase (PostgreSQL)
- **Scraper:** Node.js + Puppeteer (runs on Mac mini)
- **Automation:** OpenClaw cron jobs
- **Budget:** ~$500/month target

## Project Structure
```
/scraper       - Web scraping logic (Best Buy, Newegg, Steam)
/frontend      - Next.js application
/database      - Schema, migrations, seed data
/mission-control - Internal dashboard for monitoring
/docs          - Architecture, planning, decisions
```

## AI Context (new)
To improve agent quality and consistency (inspired by context-first AI workflows), use:

- `docs/AI_CONTEXT/about-project.md`
- `docs/AI_CONTEXT/brand-voice.md`
- `docs/AI_CONTEXT/working-style.md`
- `docs/AI_CONTEXT/task-intake-template.md`

Recommended workflow for AI-assisted tasks:
1. Load the three context files first
2. Use the task intake template for ambiguous requests
3. Validate with build/test/QA before shipping

## Getting Started
Coming soon...

---

Built with ❤️ by E & Dezi 📊

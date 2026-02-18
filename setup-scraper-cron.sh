#!/bin/bash
# Setup automated deal scraping (every 6 hours)

echo "Setting up deal scraper cron job..."

# Get the workspace path
WORKSPACE="/Users/destiny/.openclaw/workspace/DealsofDestiny"

# Create the cron job
# Runs every 6 hours (0, 6, 12, 18)
openclaw cron add \
  --name "DealsofDestiny Scraper" \
  --schedule "0 */6 * * *" \
  --tz "America/Los_Angeles" \
  --session-target main \
  --task "🕷️ Running DealsofDestiny scrapers...

Execute:
cd $WORKSPACE && npm run scrape

Then report:
- How many deals scraped
- Any errors
- Total deals in database now

Keep it brief unless there are problems."

echo "✅ Scraper cron job created!"
echo ""
echo "Jobs created:"
echo "  - DealsofDestiny Scraper (every 6 hours)"
echo ""
echo "View with: openclaw cron list"
echo "Test with: openclaw cron run <job-id>"

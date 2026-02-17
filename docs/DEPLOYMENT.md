# Deployment Guide

## ✅ Completed Steps

1. ✅ Database (Supabase) - Live and connected
2. ✅ Scrapers - Built and tested (Steam working)
3. ✅ Frontend - Built with Next.js + TailwindCSS
4. ✅ GitHub - All code pushed

## 🚀 Vercel Deployment

### Step 1: Import Project to Vercel

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `destinydeals09-dev/DealsofDestiny`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Step 2: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://vtcdjxvhxguxfkadxsrn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y2RqeHZoeGd1eGZrYWR4c3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE5NTYsImV4cCI6MjA4NjkzNzk1Nn0.1jdGsPCbUzO6YJEWG-0i-LAPsHulqdZpZJroijmP7R4
```

### Step 3: Deploy

Click **"Deploy"** - Vercel will build and deploy automatically.

You'll get a URL like: `https://dealsofdestiny.vercel.app`

### Step 4: Automatic Deployments

Every `git push` to `main` will trigger a new deployment automatically.

---

## ⏰ Daily Scraping (Mac Mini)

### Option A: macOS Launchd (Recommended)

Create a launchd plist file:

```bash
# Create the plist
cat > ~/Library/LaunchAgents/com.dealsofdestiny.scraper.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.dealsofdestiny.scraper</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/npm</string>
        <string>run</string>
        <string>scrape</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/destiny/.openclaw/workspace/DealsofDestiny</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>6</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/dealsofdestiny-scraper.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/dealsofdestiny-scraper-error.log</string>
</dict>
</plist>
EOF

# Load the job
launchctl load ~/Library/LaunchAgents/com.dealsofdestiny.scraper.plist

# Check status
launchctl list | grep dealsofdestiny
```

### Option B: Cron

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 6 AM):
0 6 * * * cd /Users/destiny/.openclaw/workspace/DealsofDestiny && /usr/local/bin/npm run scrape >> /tmp/scraper.log 2>&1
```

### Test Manually

```bash
cd /Users/destiny/.openclaw/workspace/DealsofDestiny
npm run scrape
```

---

## 🎯 What's Live

- ✅ Database: Supabase (free tier)
- ✅ Scraper: Mac mini (manual/scheduled)
- ⏳ Frontend: Vercel (deploy now)

## 💰 Current Costs

- Supabase: $0/month
- Vercel: $0/month
- **Total: $0/month** 🎉

---

## 📊 Next Steps (Post-MVP)

1. Improve Best Buy & Newegg scrapers (they need selector fixes)
2. Add search & filter to frontend
3. Add more sources (Amazon, GameStop, etc.)
4. Build Mission Control dashboard
5. Add price history tracking
6. Domain name (optional, ~$12/year)

# 🔧 How to Apply Schema v3 Migration

**Time required:** 5 minutes

---

## Step 1: Open Supabase SQL Editor

Click this link (opens in browser):
👉 **https://supabase.com/dashboard/project/vtcdjxvhxguxfkadxsrn/editor**

Or:
1. Go to https://supabase.com/dashboard
2. Open project: **vtcdjxvhxguxfkadxsrn**
3. Click **SQL Editor** in left sidebar

---

## Step 2: Open the Migration File

On your Mac, open this file:
```
/Users/destiny/.openclaw/workspace/DealsofDestiny/database/update-schema-v3.sql
```

Or run this command:
```bash
open -a TextEdit /Users/destiny/.openclaw/workspace/DealsofDestiny/database/update-schema-v3.sql
```

---

## Step 3: Copy the SQL

Select all the SQL in the file (⌘+A) and copy it (⌘+C).

---

## Step 4: Paste & Run

1. In the Supabase SQL Editor, click **"+ New query"**
2. Paste the SQL (⌘+V)
3. Click **"Run"** button (or press ⌘+Enter)
4. Wait for ✅ "Success. No rows returned"

---

## Step 5: Verify

Run this query to verify the new columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deals' 
  AND column_name IN ('quality_score', 'expires_at', 'source_url');
```

You should see 3 rows returned.

---

## ✅ Done!

Once you see success, come back and tell me. Then I'll run the first scraper test!

---

## 🆘 If You Get Errors

Paste the error message to me and I'll help debug.

Common issues:
- Columns already exist → Safe to ignore
- Permission denied → Make sure you're logged in as project owner
- Syntax error → Let me know, might be a copy/paste issue

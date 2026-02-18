#!/bin/bash

# Get Vercel token
TOKEN=$(cat ~/.config/vercel/auth.json 2>/dev/null | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error: Could not find Vercel token"
  exit 1
fi

# Get project ID
PROJECT_ID="prj_NGsGl2IcXyn6SiuPP7yNskQaY6Id"

# Add NEXT_PUBLIC_SUPABASE_URL
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXT_PUBLIC_SUPABASE_URL",
    "value": "https://vtcdjxvhxguxfkadxsrn.supabase.co",
    "type": "plain",
    "target": ["production", "preview", "development"]
  }'

echo ""

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY  
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y2RqeHZoeGd1eGZrYWR4c3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE5NTYsImV4cCI6MjA4NjkzNzk1Nn0.1jdGsPCbUzO6YJEWG-0i-LAPsHulqdZpZJroijmP7R4",
    "type": "plain",
    "target": ["production", "preview", "development"]
  }'

echo ""
echo "Environment variables added!"

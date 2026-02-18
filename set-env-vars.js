#!/usr/bin/env node

// Set Vercel environment variables via API
const { execSync } = require('child_process');

const projectId = 'prj_NGsGl2IcXyn6SiuPP7yNskQaY6Id';

const envVars = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://vtcdjxvhxguxfkadxsrn.supabase.co'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y2RqeHZoeGd1eGZrYWR4c3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjE5NTYsImV4cCI6MjA4NjkzNzk1Nn0.1jdGsPCbUzO6YJEWG-0i-LAPsHulqdZpZJroijmP7R4'
  }
];

console.log('Adding environment variables to Vercel...\n');

envVars.forEach(({ key, value }) => {
  console.log(`Adding ${key}...`);
  
  const cmd = `echo "${value}" | vercel env add ${key} production preview development --yes`;
  
  try {
    execSync(cmd, { 
      stdio: 'inherit',
      cwd: __dirname + '/frontend'
    });
    console.log(`✓ ${key} added\n`);
  } catch (error) {
    console.log(`⚠ Error adding ${key}: ${error.message}\n`);
  }
});

console.log('Done! Now redeploying...');

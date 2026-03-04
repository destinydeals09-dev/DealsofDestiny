import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['app', 'components'];
const bannedPattern = /text-\[10px\]/g;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(entry)) files.push(full);
  }
  return files;
}

const violations = [];
for (const root of roots) {
  for (const file of walk(root)) {
    const content = readFileSync(file, 'utf8');
    if (bannedPattern.test(content)) violations.push(file);
  }
}

if (violations.length) {
  console.error('❌ Font legibility check failed. Found text-[10px] in:');
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log('✅ Font legibility check passed (no text-[10px] found).');

// Run database migration - update-schema-v3.sql
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create client with service role (can execute DDL)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running DealsofDestiny Schema v3 Migration...\n');
  
  try {
    // Read the migration file
    const sqlFile = join(__dirname, 'update-schema-v3.sql');
    const sql = readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL statements...\n');
    
    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Extract a short description from the statement
      const firstLine = statement.split('\n')[0].slice(0, 60);
      console.log(`[${i + 1}/${statements.length}] ${firstLine}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct query as fallback
          const { error: queryError } = await supabase.from('_sql').select('*').limit(0);
          
          // For schema changes, we need to use the REST API directly
          // But Supabase doesn't expose DDL via REST, so we'll use a workaround
          console.log('⚠️  Could not execute via RPC, trying alternative...');
          
          // This is a limitation - we may need manual execution
          throw new Error('DDL statements require direct database access or Supabase CLI');
        }
        
        console.log('  ✅ Success\n');
        successCount++;
        
      } catch (err) {
        console.log(`  ⚠️  ${err.message}\n`);
        errorCount++;
      }
    }
    
    console.log('─────────────────────────────────');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️  Errors: ${errorCount}`);
    console.log('─────────────────────────────────\n');
    
    if (errorCount > 0) {
      console.log('⚠️  Some statements failed.');
      console.log('💡 Solution: Run the SQL manually in Supabase dashboard:\n');
      console.log('   1. Go to: https://supabase.com/dashboard/project/vtcdjxvhxguxfkadxsrn/editor');
      console.log('   2. Open SQL Editor');
      console.log(`   3. Copy/paste: ${sqlFile}`);
      console.log('   4. Click "Run"\n');
    } else {
      console.log('🎉 Migration complete!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n💡 Manual migration required:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/vtcdjxvhxguxfkadxsrn/editor');
    console.log('   2. Open SQL Editor');
    console.log('   3. Copy/paste: database/update-schema-v3.sql');
    console.log('   4. Click "Run"\n');
    process.exit(1);
  }
}

runMigration();

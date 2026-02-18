// Apply schema migration using direct PostgreSQL connection
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase connection details
const connectionString = 'postgresql://postgres.vtcdjxvhxguxfkadxsrn:Bangerangcuts67@db.vtcdjxvhxguxfkadxsrn.supabase.co:5432/postgres';

async function applyMigration() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    // Read migration file
    const sqlFile = join(__dirname, 'update-schema-v3.sql');
    const sql = readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Executing migration...\n');
    
    // Execute the entire SQL file
    await client.query(sql);
    
    console.log('✅ Migration applied successfully!\n');
    
    // Verify new columns exist
    console.log('🔍 Verifying new columns...');
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'deals' 
        AND column_name IN ('quality_score', 'expires_at', 'source_url')
      ORDER BY column_name;
    `);
    
    console.log('\nNew columns:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name} (${row.data_type})`);
    });
    
    console.log('\n🎉 Schema v3 migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();

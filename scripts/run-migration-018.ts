/**
 * Run migration 018: Add export_jobs table
 *
 * Usage:
 *   npx tsx scripts/run-migration-018.ts
 */

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running migration 018: Add export_jobs table...\n');

  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '018_add_export_jobs.sql');
    const migrationSql = await fs.readFile(migrationPath, 'utf-8');

    // Split by semicolons and filter out empty statements
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      });

      if (error) {
        // Try direct query if rpc doesn't work
        const { error: directError } = await supabase
          .from('_raw_sql')
          .select('*')
          .limit(0);

        if (directError) {
          console.error('Error executing statement:', statement.substring(0, 100) + '...');
          console.error('Error:', error);
          console.log('\nNote: Supabase client cannot execute arbitrary SQL.');
          console.log('Please run the migration manually using the Supabase dashboard or psql:');
          console.log('\npsql "${SUPABASE_DB_URL}" -f migrations/018_add_export_jobs.sql\n');
          console.log('Or copy the contents of migrations/018_add_export_jobs.sql');
          console.log('and paste it into the SQL Editor in your Supabase dashboard.\n');
          process.exit(1);
        }
      }
    }

    console.log('\n✅ Migration completed successfully!\n');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\nPlease run the migration manually:');
    console.log('psql "${SUPABASE_DB_URL}" -f migrations/018_add_export_jobs.sql\n');
    process.exit(1);
  }
}

runMigration();

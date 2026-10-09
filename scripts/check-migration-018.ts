/**
 * Check if migration 018 (export_jobs table) has been applied
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Verify test project
if (!supabaseUrl.includes('lbjtwbpnlruykqgsaiwy')) {
  console.error('❌ Wrong project! Expected memorypop-test (lbjtwbpnlruykqgsaiwy)');
  console.error(`   Got: ${supabaseUrl}`);
  process.exit(1);
}

console.log('✅ Confirmed targeting memorypop-test (lbjtwbpnlruykqgsaiwy)\n');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function checkMigration() {
  console.log('Checking if export_jobs table exists...\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('export_jobs')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Table does not exist
        console.log('❌ Migration 018 NOT applied');
        console.log('   export_jobs table does not exist\n');
        console.log('📋 To apply migration:');
        console.log('   1. Go to: https://supabase.com/dashboard/project/lbjtwbpnlruykqgsaiwy/sql/new');
        console.log('   2. Copy entire contents of: migrations/018_add_export_jobs.sql');
        console.log('   3. Paste and click Run\n');
        return false;
      } else {
        console.error('❌ Unexpected error:', error.message);
        return false;
      }
    }

    console.log('✅ Migration 018 APPLIED');
    console.log('   export_jobs table exists\n');
    return true;

  } catch (error: any) {
    console.error('❌ Check failed:', error.message);
    return false;
  }
}

checkMigration().then(applied => {
  process.exit(applied ? 0 : 1);
});

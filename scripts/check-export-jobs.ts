/**
 * Check export_jobs table contents
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkJobs() {
  console.log('Querying export_jobs table...\n');

  try {
    const { data, error } = await supabase
      .from('export_jobs')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`✅ Found ${data?.length || 0} jobs`);
    if (data && data.length > 0) {
      console.log('\nJobs:');
      data.forEach((job: any) => {
        console.log(`  - ${job.id}: ${job.status} (memorypop: ${job.memorypop_id})`);
      });
    }
  } catch (error: any) {
    console.error('❌ Check failed:', error.message);
  }
}

checkJobs();

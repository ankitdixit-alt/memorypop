import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl.includes('lbjtwbpnlruykqgsaiwy')) {
  console.error('❌ ABORT: Not using test database!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('Checking available columns in memorypops table...\n');

  const shareCode = 'test-sharing-1790756204563';

  // Select everything to see what columns exist
  const { data, error } = await supabase
    .from('memorypops')
    .select('*')
    .eq('share_code', shareCode)
    .single();

  if (error) {
    console.error('❌ Query error:', error);
  } else if (!data) {
    console.log('❌ No data returned');
  } else {
    console.log('✅ Gift found');
    console.log('Available columns:', Object.keys(data).sort());
    console.log('\nValues:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkColumns();

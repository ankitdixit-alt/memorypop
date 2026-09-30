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

async function testQuery() {
  console.log('Testing contribute page query...\n');

  const shareCode = 'test-sharing-1790756204563';

  const { data, error } = await supabase
    .from('memorypops')
    .select('recipient_name, occasion, celebration_date, cover_style, tone, is_premium')
    .eq('share_code', shareCode)
    .single();

  if (error) {
    console.error('❌ Query error:', error);
  } else if (!data) {
    console.log('❌ No data returned');
  } else {
    console.log('✅ Query successful');
    console.log('Data:', JSON.stringify(data, null, 2));
  }
}

testQuery();

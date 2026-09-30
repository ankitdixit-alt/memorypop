import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Database safety check
if (!supabaseUrl.includes('lbjtwbpnlruykqgsaiwy')) {
  console.error('❌ ABORT: Not using test database!');
  process.exit(1);
}

console.log('✅ Using memorypop-test database');

const supabase = createClient(supabaseUrl, supabaseKey);

const SHARE_CODE = 'test-sharing-1790756204563';

const CONTRIBUTIONS = [
  {
    contributor_name: 'Sarah Chen',
    message: 'Happy Birthday! I still remember when we met in college and you helped me through that impossible calculus exam. Your kindness and patience changed my life. Here\'s to many more years of friendship and adventures! 🎉',
    photos: [
      { url: 'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 },
      { url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 }
    ]
  },
  {
    contributor_name: 'Mike Rodriguez',
    message: 'Wishing you the happiest of birthdays! You make the office a better place every single day. Thanks for always being there with great advice and even better coffee runs.',
    photos: [
      { url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 }
    ]
  },
  {
    contributor_name: 'Emily Watson',
    message: 'Remember when we used to spend entire summers at the lake? Those were the best days. You\'ve always been an amazing friend and I\'m so grateful we stayed close all these years. Happy Birthday! 🎂',
    photos: [
      { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 },
      { url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 },
      { url: 'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 }
    ]
  },
  {
    contributor_name: 'James Kim',
    message: 'Happy Birthday to the best sibling anyone could ask for! Thanks for teaching me everything from tying my shoes to navigating life. Love you tons! 🎈',
    photos: [
      { url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 }
    ]
  },
  {
    contributor_name: 'Lisa Thompson',
    message: 'You light up our entire neighborhood with your smile and kindness. Thank you for being such a wonderful person and friend. Wishing you a beautiful birthday filled with joy and laughter!',
    photos: [
      { url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 },
      { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', uploaded_at: new Date().toISOString(), file_size_bytes: 0 }
    ]
  }
];

async function seedContributions() {
  // Get the gift
  const { data: gift, error: giftError } = await supabase
    .from('memorypops')
    .select('id, share_code, recipient_name')
    .eq('share_code', SHARE_CODE)
    .single();

  if (giftError || !gift) {
    console.error('Gift not found:', giftError?.message);
    process.exit(1);
  }

  console.log(`\nGift found: ${gift.share_code}`);
  console.log(`Recipient: ${gift.recipient_name}`);

  // Check existing contributions
  const { data: existing } = await supabase
    .from('memories')
    .select('contributor_name')
    .eq('memorypop_id', gift.id);

  const existingNames = new Set(existing?.map(m => m.contributor_name) || []);
  console.log(`\nExisting contributions: ${existingNames.size}`);
  if (existingNames.size > 0) {
    console.log('Names:', Array.from(existingNames).join(', '));
  }

  // Filter out duplicates
  const newContributions = CONTRIBUTIONS.filter(c => !existingNames.has(c.contributor_name));

  if (newContributions.length === 0) {
    console.log('\n✅ All contributions already exist. Nothing to add.');
    return;
  }

  console.log(`\nAdding ${newContributions.length} new contributions...`);

  // Insert new contributions
  for (const contrib of newContributions) {
    const { error } = await supabase
      .from('memories')
      .insert({
        memorypop_id: gift.id,
        contributor_name: contrib.contributor_name,
        message: contrib.message,
        photos: contrib.photos,
        gifs: []
      });

    if (error) {
      console.error(`❌ Failed to add ${contrib.contributor_name}:`, error.message);
    } else {
      console.log(`✅ Added ${contrib.contributor_name}`);
    }
  }

  // Final count
  const { data: finalMemories } = await supabase
    .from('memories')
    .select('id')
    .eq('memorypop_id', gift.id);

  console.log(`\n✅ Total contributions: ${finalMemories?.length || 0}`);
}

seedContributions().catch(console.error);

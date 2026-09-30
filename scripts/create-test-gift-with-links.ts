/**
 * Create Test Gift with Full Access Links
 *
 * Creates a new test gift with memories and returns all three access links:
 * - Contributor link (public)
 * - Reveal link (public)
 * - Creator management link (with token)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import crypto from 'crypto';

// Load .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.test');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateManagementToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('base64url');
  return { token, tokenHash };
}

async function createTestGift() {
  const shareCode = 'test-sharing-' + Date.now();
  const { token: managementToken, tokenHash: managementTokenHash } = generateManagementToken();

  // Create MemoryPop
  const { data: memorypop, error: mpError } = await supabase
    .from('memorypops')
    .insert({
      recipient_name: 'Sharing Test User',
      occasion: 'birthday',
      status: 'collecting',
      share_code: shareCode,
      management_token_hash: managementTokenHash,
      cover_style: 'warm',
      is_premium: true,
    })
    .select('id, share_code')
    .single();

  if (mpError || !memorypop) {
    console.error('Failed to create MemoryPop:', mpError);
    process.exit(1);
  }

  // Add test memories
  const memories = [
    { contributor_name: 'Alice', content: 'Happy birthday! Remember that amazing trip we took?' },
    { contributor_name: 'Bob', content: 'You\'re the best! Thanks for being such a great friend.' },
    { contributor_name: 'Carol', content: 'Wishing you all the happiness in the world!' },
  ];

  for (const memory of memories) {
    await supabase
      .from('memories')
      .insert({
        memorypop_id: memorypop.id,
        contributor_name: memory.contributor_name,
        content: memory.content,
      });
  }

  console.log('=== Test Gift Created ===\n');
  console.log(`Share Code: ${memorypop.share_code}`);
  console.log(`Recipient: Sharing Test User`);
  console.log(`Tier: Plus`);
  console.log(`Memories: ${memories.length} contributions\n`);

  console.log('=== Test Links (http://localhost:3000) ===\n');
  console.log(`Contributor (public):`);
  console.log(`  http://localhost:3000/m/${memorypop.share_code}/contribute\n`);

  console.log(`Reveal (public):`);
  console.log(`  http://localhost:3000/m/${memorypop.share_code}/reveal\n`);

  console.log(`Creator Management (requires token):`);
  console.log(`  http://localhost:3000/manage/${managementToken}\n`);

  console.log('=== Manual Testing Checklist ===\n');
  console.log('[ ] Open contributor link, test all sharing buttons');
  console.log('[ ] Verify WhatsApp opens with correct message');
  console.log('[ ] Verify Email opens with correct subject/body');
  console.log('[ ] Open ShareMenu, test Telegram/Facebook/X/LinkedIn/Reddit');
  console.log('[ ] Test Copy Link and Copy Message');
  console.log('[ ] Test Native Share (mobile)');
  console.log('[ ] Try clipboard failure: open DevTools Console, run:');
  console.log('    Object.defineProperty(navigator, "clipboard", {value: {writeText: () => Promise.reject()}})');
  console.log('[ ] Verify fallback UI shows selectable text\n');
  console.log('[ ] Open reveal link, complete playback');
  console.log('[ ] Verify product sharing appears at end without reaction');
  console.log('[ ] Test product mode sharing (no recipient name, no "Add memory")');
}

createTestGift().catch(console.error);

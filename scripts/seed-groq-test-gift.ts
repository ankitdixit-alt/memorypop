/**
 * Seed One Fictional Plus Gift for Live Groq Testing
 *
 * Creates a single Plus gift with fictional minimal-text memories.
 * No photos, videos, media URLs, or credentials.
 * For controlled live Groq integration testing only.
 */

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

function hashManagementToken(token: string): string {
  return createHash('sha256')
    .update(token)
    .digest('base64url')
}

function verifyTestDatabase(url: string, expectedRef: string | undefined): void {
  const productionUrl = 'gvfpgawbvuttglfscngg.supabase.co'
  if (url.includes(productionUrl)) {
    console.error('❌ BLOCKED: Cannot run against production')
    process.exit(1)
  }

  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1')
  const hasTestRef = expectedRef && url.includes(expectedRef)

  if (!isLocalhost && !hasTestRef) {
    console.error('❌ BLOCKED: Must target test project')
    process.exit(1)
  }

  console.log('✅ Targeting test project:', expectedRef)
}

async function seedGroqTestGift() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const testProjectRef = process.env.TEST_PROJECT_REF
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  verifyTestDatabase(supabaseUrl, testProjectRef)

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('\n🧪 Creating fictional Plus gift for Groq testing...')

  const shareCode = `groq-test-${Date.now()}`
  const rawToken = `groq-token-${Date.now()}`
  const tokenHash = hashManagementToken(rawToken)

  // Create Plus gift
  const { data: gift, error: giftError } = await supabase
    .from('memorypops')
    .insert({
      recipient_name: 'Casey Fictional',
      occasion: 'birthday',
      is_premium: true,
      upgraded_at: new Date().toISOString(),
      share_code: shareCode,
      management_token_hash: tokenHash,
      celebration_message: 'A fictional celebration for live Groq testing',
      cover_style: 'elegant'
    })
    .select()
    .single()

  if (giftError || !gift) {
    console.error('❌ Failed to create gift:', giftError)
    process.exit(1)
  }

  console.log(`✅ Created Plus gift: ${gift.id}`)

  // Add 5 fictional minimal-text memories
  const memories = [
    {
      memorypop_id: gift.id,
      contributor_name: 'Alex',
      message: 'Happy birthday Casey! Wishing you an amazing year ahead.',
      photo_url: null
    },
    {
      memorypop_id: gift.id,
      contributor_name: 'Jordan',
      message: 'So grateful to know you. Have the best birthday ever!',
      photo_url: null
    },
    {
      memorypop_id: gift.id,
      contributor_name: 'Taylor',
      message: 'Another year wiser! Hope your day is filled with joy.',
      photo_url: null
    },
    {
      memorypop_id: gift.id,
      contributor_name: 'Morgan',
      message: 'You make the world brighter. Enjoy your special day!',
      photo_url: null
    },
    {
      memorypop_id: gift.id,
      contributor_name: 'Riley',
      message: 'Cheers to you on your birthday! May all your dreams come true.',
      photo_url: null
    }
  ]

  const { error: memoriesError } = await supabase
    .from('memories')
    .insert(memories)

  if (memoriesError) {
    console.error('❌ Failed to add memories:', memoriesError)
    process.exit(1)
  }

  console.log(`✅ Added ${memories.length} fictional memories`)

  console.log('\n========================================')
  console.log('✅ Groq Test Gift Created')
  console.log('========================================\n')
  console.log(`Share Code: ${shareCode}`)
  console.log(`Management URL: ${baseUrl}/manage/${rawToken}`)
  console.log(`Reveal URL: ${baseUrl}/m/${shareCode}/reveal`)
  console.log('\nNext steps:')
  console.log('1. Enable AI Director in .env.test')
  console.log('2. Open Management URL')
  console.log('3. Mark gift as "Ready"')
  console.log('4. Verify live Groq generation')
  console.log('5. Check reveal playback\n')
}

seedGroqTestGift()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Failed:', err)
    process.exit(1)
  })

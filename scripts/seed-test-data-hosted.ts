/**
 * Synthetic Test Data Seed Script - Hosted Test Database
 *
 * Creates representative Standard and Plus gifts for hosted test database testing.
 * Verifies target is the designated test project before inserting data.
 *
 * Usage:
 *   npm run test:seed
 *   or
 *   NODE_ENV=test npx tsx scripts/seed-test-data-hosted.ts
 *
 * Environment (.env.test):
 *   NEXT_PUBLIC_SUPABASE_URL - Test project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Test service role key
 *   TEST_PROJECT_REF - Test project reference (e.g., 'abc123xyz')
 */

import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

// Hash management token using SHA-256 (matches application logic)
function hashManagementToken(token: string): string {
  return createHash('sha256')
    .update(token)
    .digest('base64url')
}

// Safety check: verify test project
function verifyTestDatabase(url: string, expectedRef: string | undefined): void {
  // Check 1: Not production
  const productionUrl = 'gvfpgawbvuttglfscngg.supabase.co'
  if (url.includes(productionUrl)) {
    console.error('❌ SAFETY CHECK FAILED')
    console.error('This appears to be the PRODUCTION database!')
    console.error('URL:', url)
    console.error('This script MUST NOT run against production.')
    process.exit(1)
  }

  // Check 2: Localhost OR designated test project
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1')
  const hasTestRef = expectedRef && url.includes(expectedRef)

  if (!isLocalhost && !hasTestRef) {
    console.error('❌ SAFETY CHECK FAILED')
    console.error('Database URL must be either:')
    console.error('  1. Localhost (127.0.0.1 or localhost)')
    console.error('  2. Test project matching TEST_PROJECT_REF')
    console.error('')
    console.error('Current URL:', url)
    console.error('Expected test ref:', expectedRef || '(not set)')
    console.error('')
    console.error('To use a hosted test database:')
    console.error('  1. Set TEST_PROJECT_REF in .env.test')
    console.error('  2. Ensure NEXT_PUBLIC_SUPABASE_URL matches the test project')
    process.exit(1)
  }

  if (isLocalhost) {
    console.log('✅ Safety check passed - targeting localhost database')
  } else {
    console.log('✅ Safety check passed - targeting test project:', expectedRef)
  }
}

interface SeedResult {
  standardGift: {
    id: string
    shareCode: string
    creatorToken: string
    revealUrl: string
    dashboardUrl: string
  }
  plusGift: {
    id: string
    shareCode: string
    creatorToken: string
    revealUrl: string
    dashboardUrl: string
  }
}

async function seedTestData(): Promise<SeedResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const testProjectRef = process.env.TEST_PROJECT_REF
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables')
    console.error('Required:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL')
    console.error('  SUPABASE_SERVICE_ROLE_KEY')
    console.error('')
    console.error('Optional but recommended for hosted test:')
    console.error('  TEST_PROJECT_REF')
    process.exit(1)
  }

  verifyTestDatabase(supabaseUrl, testProjectRef)

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('\n🌱 Seeding test data...')
  console.log('Target:', supabaseUrl)

  // Create Standard gift
  console.log('\n📦 Creating Standard gift...')

  const standardShareCode = `test-standard-${Date.now()}`
  const standardRawToken = `token-standard-${Date.now()}`
  const standardTokenHash = hashManagementToken(standardRawToken)

  const { data: standardGift, error: standardError } = await supabase
    .from('memorypops')
    .insert({
      recipient_name: 'Alex Standard',
      occasion: 'birthday',
      is_premium: false,
      share_code: standardShareCode,
      management_token_hash: standardTokenHash,
      celebration_message: 'A standard birthday celebration',
      cover_style: 'simple'
    })
    .select()
    .single()

  if (standardError || !standardGift) {
    console.error('❌ Failed to create Standard gift:', standardError)
    process.exit(1)
  }

  console.log(`✅ Created Standard gift: ${standardGift.id}`)

  // Add memories to Standard gift
  const standardMemories = [
    {
      memorypop_id: standardGift.id,
      contributor_name: 'Sarah',
      message: 'Happy birthday Alex! Hope this year brings you joy and adventure.',
      photo_url: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800'
    },
    {
      memorypop_id: standardGift.id,
      contributor_name: 'Mike',
      message: 'Wishing you the best birthday ever! You deserve all the happiness.',
      photo_url: null
    },
    {
      memorypop_id: standardGift.id,
      contributor_name: 'Emma',
      message: 'Another year older, another year wiser! Have an amazing day!',
      photo_url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800'
    }
  ]

  const { error: standardMemoriesError } = await supabase
    .from('memories')
    .insert(standardMemories)

  if (standardMemoriesError) {
    console.error('❌ Failed to add Standard memories:', standardMemoriesError)
    process.exit(1)
  }

  console.log(`✅ Added ${standardMemories.length} memories to Standard gift`)

  // Create Plus gift
  console.log('\n✨ Creating Plus gift...')

  const plusShareCode = `test-plus-${Date.now()}`
  const plusRawToken = `token-plus-${Date.now()}`
  const plusTokenHash = hashManagementToken(plusRawToken)

  const { data: plusGift, error: plusError } = await supabase
    .from('memorypops')
    .insert({
      recipient_name: 'Jordan Plus',
      occasion: 'birthday',
      is_premium: true,
      upgraded_at: new Date().toISOString(),
      share_code: plusShareCode,
      management_token_hash: plusTokenHash,
      celebration_message: 'A premium birthday celebration with AI-powered reveal',
      cover_style: 'elegant'
    })
    .select()
    .single()

  if (plusError || !plusGift) {
    console.error('❌ Failed to create Plus gift:', plusError)
    process.exit(1)
  }

  console.log(`✅ Created Plus gift: ${plusGift.id}`)

  // Add memories to Plus gift
  const plusMemories = [
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Lisa',
      message: 'Jordan, you light up every room! Wishing you the happiest birthday!',
      photo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Tom',
      message: 'Happy birthday to my favorite person! Here\'s to another year of adventures.',
      photo_url: null
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Rachel',
      message: 'You make the world a better place. Have the most amazing birthday!',
      photo_url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800'
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'David',
      message: 'Another trip around the sun! Grateful for your friendship.',
      photo_url: null
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Maria',
      message: 'Jordan, your kindness and humor make every day brighter. Happy birthday!',
      photo_url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800'
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Chris',
      message: 'Cheers to you on your special day! May this year be filled with joy.',
      photo_url: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800'
    }
  ]

  const { error: plusMemoriesError } = await supabase
    .from('memories')
    .insert(plusMemories)

  if (plusMemoriesError) {
    console.error('❌ Failed to add Plus memories:', plusMemoriesError)
    process.exit(1)
  }

  console.log(`✅ Added ${plusMemories.length} memories to Plus gift`)

  // Return results
  return {
    standardGift: {
      id: standardGift.id,
      shareCode: standardShareCode,
      creatorToken: standardRawToken,
      revealUrl: `${baseUrl}/m/${standardShareCode}/reveal`,
      dashboardUrl: `${baseUrl}/manage/${standardRawToken}`
    },
    plusGift: {
      id: plusGift.id,
      shareCode: plusShareCode,
      creatorToken: plusRawToken,
      revealUrl: `${baseUrl}/m/${plusShareCode}/reveal`,
      dashboardUrl: `${baseUrl}/manage/${plusRawToken}`
    }
  }
}

// Run seeding
seedTestData()
  .then((result) => {
    console.log('\n========================================')
    console.log('✅ Test Data Seeded Successfully')
    console.log('========================================\n')

    console.log('📦 Standard Gift:')
    console.log(`   ID: ${result.standardGift.id}`)
    console.log(`   Share Code: ${result.standardGift.shareCode}`)
    console.log(`   Creator Token: ${result.standardGift.creatorToken}`)
    console.log(`   Reveal: ${result.standardGift.revealUrl}`)
    console.log(`   Dashboard: ${result.standardGift.dashboardUrl}`)

    console.log('\n✨ Plus Gift:')
    console.log(`   ID: ${result.plusGift.id}`)
    console.log(`   Share Code: ${result.plusGift.shareCode}`)
    console.log(`   Creator Token: ${result.plusGift.creatorToken}`)
    console.log(`   Reveal: ${result.plusGift.revealUrl}`)
    console.log(`   Dashboard: ${result.plusGift.dashboardUrl}`)

    console.log('\n========================================')
    console.log('Next Steps:')
    console.log('========================================')
    console.log('1. Start dev server: npm run test:dev')
    console.log('2. Open Standard reveal to verify experience')
    console.log('3. Open Plus Dashboard URL (authenticates and redirects to dashboard)')
    console.log('4. Mark Plus gift as "Ready" to trigger preparation')
    console.log('5. Open Plus reveal to verify cached playback')
    console.log('\n')
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  })

/**
 * Synthetic Test Data Seed Script
 *
 * Creates representative Standard and Plus gifts for local testing.
 * Verifies target is local database before inserting data.
 *
 * Usage:
 *   npx tsx scripts/seed-test-data.ts
 *
 * Environment:
 *   SUPABASE_URL - Must contain 'localhost' or '127.0.0.1' for safety
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for local Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Safety check: only allow localhost
function verifyLocalDatabase(url: string): void {
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('local')

  if (!isLocal) {
    console.error('❌ SAFETY CHECK FAILED')
    console.error('Database URL does not appear to be local:', url)
    console.error('This script only runs against local databases.')
    console.error('Set SUPABASE_URL to a localhost URL.')
    process.exit(1)
  }

  console.log('✅ Safety check passed - targeting local database')
}

interface SeedResult {
  standardGift: {
    id: string
    shareCode: string
    revealUrl: string
  }
  plusGift: {
    id: string
    shareCode: string
    revealUrl: string
  }
}

async function seedTestData(): Promise<SeedResult> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables')
    console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  verifyLocalDatabase(supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('\\n🌱 Seeding test data...')

  // Create Standard gift
  console.log('\\n📦 Creating Standard gift...')

  const { data: standardGift, error: standardError } = await supabase
    .from('memorypops')
    .insert({
      recipient_name: 'Alex Standard',
      occasion: 'birthday',
      is_premium: false,
      status: 'ready',
      share_code: `test-standard-${Date.now()}`,
      creator_token: `token-standard-${Date.now()}`,
      mood: 'warm_heartfelt'
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
      message: 'Another year older and wiser! Celebrate big today!',
      photo_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'
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
  console.log('\\n✨ Creating Plus gift...')

  const { data: plusGift, error: plusError } = await supabase
    .from('memorypops')
    .insert({
      recipient_name: 'Jordan Plus',
      occasion: 'birthday',
      is_premium: true,
      status: 'ready',
      share_code: `test-plus-${Date.now()}`,
      creator_token: `token-plus-${Date.now()}`,
      mood: 'warm_heartfelt',
      story: 'Celebrating an amazing friend and colleague'
    })
    .select()
    .single()

  if (plusError || !plusGift) {
    console.error('❌ Failed to create Plus gift:', plusError)
    process.exit(1)
  }

  console.log(`✅ Created Plus gift: ${plusGift.id}`)

  // Add memories to Plus gift (more varied)
  const plusMemories = [
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Taylor',
      message: 'Jordan, your kindness and creativity inspire everyone around you. Happy birthday!',
      photo_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800'
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Casey',
      message: 'Remember that road trip last summer? Best memories ever! Here\'s to many more adventures.',
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      ])
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Morgan',
      message: 'You light up every room you enter. Wishing you endless joy today!',
      photo_url: null
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Riley',
      message: 'From college days to now - you\'ve been an incredible friend. Happy birthday!',
      photo_url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800'
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Quinn',
      message: 'Here\'s to another year of laughter, growth, and making the world a better place!',
      photo_url: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800'
    },
    {
      memorypop_id: plusGift.id,
      contributor_name: 'Alex',
      message: 'Your positive energy is contagious. Thank you for being you. Happy birthday!',
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
      ])
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

  // Return gift details
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return {
    standardGift: {
      id: standardGift.id,
      shareCode: standardGift.share_code,
      revealUrl: `${baseUrl}/m/${standardGift.share_code}/reveal`
    },
    plusGift: {
      id: plusGift.id,
      shareCode: plusGift.share_code,
      revealUrl: `${baseUrl}/m/${plusGift.share_code}/reveal`
    }
  }
}

// Run seeding
seedTestData()
  .then((result) => {
    console.log('\\n🎉 Seeding complete!')
    console.log('\\n📋 Test Gifts Created:')
    console.log('\\nStandard Gift:')
    console.log(`  ID: ${result.standardGift.id}`)
    console.log(`  Share Code: ${result.standardGift.shareCode}`)
    console.log(`  Reveal URL: ${result.standardGift.revealUrl}`)
    console.log('\\nPlus Gift:')
    console.log(`  ID: ${result.plusGift.id}`)
    console.log(`  Share Code: ${result.plusGift.shareCode}`)
    console.log(`  Reveal URL: ${result.plusGift.revealUrl}`)
    console.log('\\n✅ Open these URLs in your browser to test')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\\n❌ Seeding failed:', error)
    process.exit(1)
  })

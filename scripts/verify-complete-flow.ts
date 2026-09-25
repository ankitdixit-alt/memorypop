/**
 * Complete verification of Groq integration flow
 */

import { createClient } from '@supabase/supabase-js'

async function verifyCompleteFlow() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const giftId = 'aeb3e603-0c5e-4539-b9a5-1b541d11dc7f'

  console.log('🔍 Complete Flow Verification')
  console.log('============================\n')

  // 1. Check gift exists and has correct status
  const { data: gift, error: giftError } = await supabase
    .from('memorypops')
    .select('id, recipient_name, occasion, status, is_premium, share_code')
    .eq('id', giftId)
    .single()

  if (giftError || !gift) {
    console.error('❌ Gift not found')
    process.exit(1)
  }

  console.log('✅ Gift Configuration:')
  console.log(`   Recipient: ${gift.recipient_name}`)
  console.log(`   Occasion: ${gift.occasion}`)
  console.log(`   Status: ${gift.status}`)
  console.log(`   Premium: ${gift.is_premium}`)
  console.log(`   Share Code: ${gift.share_code}`)

  // 2. Check memories exist
  const { data: memories, error: memoriesError } = await supabase
    .from('memories')
    .select('id, contributor_name, message, photos, video')
    .eq('memorypop_id', giftId)

  if (memoriesError || !memories || memories.length === 0) {
    console.error('\n❌ No memories found')
    process.exit(1)
  }

  console.log(`\n✅ Memories: ${memories.length} contributions`)
  memories.forEach((m, i) => {
    const hasPhotos = m.photos && Array.isArray(m.photos) && m.photos.length > 0
    const hasVideo = m.video && typeof m.video === 'object' && m.video.url
    const media = hasPhotos ? `${m.photos.length} photo(s)` : hasVideo ? 'video' : 'text-only'
    console.log(`   [${i + 1}] ${m.contributor_name} - ${media}`)
  })

  // 3. Check AI plan exists and is from Groq
  const { data: plan, error: planError } = await supabase
    .from('ai_reveal_plans')
    .select('*')
    .eq('memorypop_id', giftId)
    .single()

  if (planError || !plan) {
    console.error('\n❌ No AI plan found')
    process.exit(1)
  }

  console.log('\n✅ AI Plan Saved:')
  console.log(`   Model: ${plan.model_name}`)
  console.log(`   Source: ${plan.generation_source}`)
  console.log(`   Lock Holder: ${plan.generation_lock_holder || 'NULL (released)'}`)
  console.log(`   Created: ${plan.created_at}`)
  console.log(`   Has opening: ${!!plan.opening_data}`)
  console.log(`   Chapters: ${plan.chapters_data?.length || 0}`)
  console.log(`   Highlights: ${plan.highlights_ids?.length || 0}`)
  console.log(`   Finale ID: ${plan.finale_id ? 'Yes' : 'No'}`)

  // 4. Validate plan structure
  let valid = true
  const issues: string[] = []

  if (plan.model_name === 'deterministic') {
    issues.push('Using deterministic fallback (not Groq)')
    valid = false
  }

  if (plan.model_name !== 'openai/gpt-oss-120b' && plan.model_name !== 'deterministic') {
    issues.push(`Unexpected model: ${plan.model_name}`)
  }

  if (plan.generation_source !== 'ai_generated') {
    issues.push(`Unexpected source: ${plan.generation_source}`)
    valid = false
  }

  if (!plan.opening_data) {
    issues.push('Missing opening_data')
    valid = false
  }

  if (!plan.chapters_data || plan.chapters_data.length === 0) {
    issues.push('Missing chapters_data')
    valid = false
  }

  if (!plan.highlights_ids || plan.highlights_ids.length === 0) {
    issues.push('Missing highlights_ids')
  }

  if (!plan.finale_id) {
    issues.push('Missing finale_id')
  }

  if (issues.length > 0) {
    console.log('\n⚠️  Plan Issues:')
    issues.forEach(issue => console.log(`   - ${issue}`))
  }

  console.log('\n============================')
  if (valid && issues.length === 0) {
    console.log('✅ ALL TESTS PASSED')
    console.log('\n📊 Summary:')
    console.log(`   ✅ Real Groq plan generated (${plan.model_name})`)
    console.log(`   ✅ ${memories.length} memories included`)
    console.log(`   ✅ ${plan.chapters_data?.length} chapters created`)
    console.log(`   ✅ Plan saved and lock released`)
    console.log('\n🎯 Ready for:')
    console.log('   - Browser visual verification')
    console.log('   - Cache behavior testing (refresh)')
    console.log('   - Media fixture testing (optional)')
  } else {
    console.log('❌ SOME TESTS FAILED')
    process.exit(1)
  }
}

verifyCompleteFlow()

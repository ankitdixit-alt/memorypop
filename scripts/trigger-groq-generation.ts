/**
 * Trigger Live Groq Generation for Test Gift
 *
 * Calls the status API to mark gift as "ready" and trigger AI generation.
 * Uses the actual authorized creator flow with management token.
 */

import { createHash } from 'crypto'

function hashManagementToken(token: string): string {
  return createHash('sha256')
    .update(token)
    .digest('base64url')
}

async function triggerGeneration() {
  const gifId = 'aeb3e603-0c5e-4539-b9a5-1b541d11dc7f'
  const rawToken = 'groq-token-1790196239253'
  const tokenHash = hashManagementToken(rawToken)

  console.log('🚀 Triggering live Groq generation...\n')
  console.log('Gift ID:', gifId)
  console.log('Using hashed management token for authorization\n')

  try {
    const response = await fetch(`http://localhost:3000/api/memorypops/${gifId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'ready',
        creatorToken: tokenHash,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', response.status)
      console.error('Response:', errorText)
      process.exit(1)
    }

    const result = await response.json()
    console.log('✅ Status updated successfully')
    console.log('Response:', JSON.stringify(result, null, 2))

    console.log('\n⏳ Waiting for AI generation to complete (30s timeout)...')

    // Wait a moment for generation to complete
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Check database for saved plan
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: plan, error: planError } = await supabase
      .from('ai_reveal_plans')
      .select('*')
      .eq('memorypop_id', gifId)
      .single()

    if (planError && planError.code !== 'PGRST116') {
      console.error('❌ Error checking plan:', planError)
      process.exit(1)
    }

    if (!plan) {
      console.log('\n⚠️  No plan saved yet - check server logs')
      console.log('Plan may be generating or may have failed')
      process.exit(1)
    }

    console.log('\n✅ AI plan saved successfully!')
    console.log('Plan ID:', plan.id)
    console.log('Model:', plan.model_name || 'N/A')
    console.log('Provider:', plan.provider_name || 'N/A')
    console.log('Chapters:', plan.chapters_data?.length || 0)
    console.log('Source:', plan.generation_source || 'N/A')

    if (plan.model_name && plan.model_name !== 'deterministic' && plan.model_name !== 'pending') {
      console.log('\n🎉 Live Groq generation confirmed!')
      console.log('Model:', plan.model_name)
    } else {
      console.log('\n⚠️  Plan source:', plan.generation_source)
      console.log('May be fallback or pending')
    }

    console.log('\n✅ Ready for reveal playback testing')
    console.log('Reveal URL: http://localhost:3000/m/groq-test-1790196239253/reveal\n')

  } catch (error) {
    console.error('❌ Failed:', error)
    process.exit(1)
  }
}

triggerGeneration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err)
    process.exit(1)
  })

/**
 * Check if Groq plan was saved successfully
 */

import { createClient } from '@supabase/supabase-js'

async function checkSavedPlan() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('ai_reveal_plans')
    .select('memorypop_id, model_name, generation_source, generation_lock_holder, created_at')
    .eq('memorypop_id', 'aeb3e603-0c5e-4539-b9a5-1b541d11dc7f')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Query failed:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.error('❌ No plans found for this gift')
    console.error('   Gift may not have been prepared yet')
    process.exit(1)
  }

  console.log(`✅ Found ${data.length} plan(s):`)
  data.forEach((plan, i) => {
    console.log(`\n[${i + 1}] Model: ${plan.model_name}`)
    console.log(`    Source: ${plan.generation_source}`)
    console.log(`    Lock: ${plan.generation_lock_holder || 'NULL (released)'}`)
    console.log(`    Created: ${plan.created_at}`)
  })

  const latest = data[0]
  console.log('\n--- Latest Plan ---')
  if (latest.model_name === 'deterministic') {
    console.log('⚠️  Using deterministic fallback (not Groq)')
    console.log('   Check server logs for Groq API errors')
  } else {
    console.log('✅ Real AI-generated plan from:', latest.model_name)
  }

  process.exit(0)
}

checkSavedPlan()

/**
 * Check available columns in memorypops table
 */

import { createClient } from '@supabase/supabase-js'

async function checkColumns() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('memorypops')
    .select('*')
    .eq('id', 'aeb3e603-0c5e-4539-b9a5-1b541d11dc7f')
    .single()

  if (error) {
    console.error('❌ Query failed:', error.message)
    process.exit(1)
  }

  console.log('✅ Available columns in memorypops:')
  console.log(Object.keys(data).sort().join(', '))

  console.log('\n✅ Gift data:')
  console.log('   ID:', data.id)
  console.log('   Recipient:', data.recipient_name)
  console.log('   Occasion:', data.occasion)
  console.log('   Premium:', data.is_premium)
  console.log('   Status:', data.status)
  console.log('   Has mood column:', 'mood' in data)
}

checkColumns()

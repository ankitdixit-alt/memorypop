#!/bin/bash
# Complete Groq Integration Test
# Run after status column is added to database

set -e

echo "🧪 Complete Groq Integration Test"
echo "=================================="
echo ""

# Check status column exists
echo "1. Verifying status column exists..."
./scripts/run-with-test-env.sh "node -e \"
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

supabase.from('memorypops').select('id, status').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('❌ Status column missing:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Status column exists');
    process.exit(0);
  }
});
\"" || {
  echo ""
  echo "❌ BLOCKER: Status column still missing"
  echo "Run this SQL in Supabase SQL Editor (memorypop-test):"
  echo ""
  echo "ALTER TABLE public.memorypops"
  echo "ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'collecting' NOT NULL;"
  echo ""
  exit 1
}

echo ""
echo "2. Checking test gift exists..."
GIFT_ID="aeb3e603-0c5e-4539-b9a5-1b541d11dc7f"
SHARE_CODE="groq-test-1790196239253"
RAW_TOKEN="groq-token-1790196239253"

echo "   Gift ID: $GIFT_ID"
echo "   Share Code: $SHARE_CODE"
echo ""

echo "3. Browser Test Instructions:"
echo "   a. Open: http://localhost:3000/manage/$RAW_TOKEN"
echo "   b. Click 'Prepare the Reveal' button"
echo "   c. Wait for generation to complete (~30 seconds)"
echo ""

read -p "Press Enter when you have completed step 3..."

echo ""
echo "4. Verifying saved plan..."
./scripts/run-with-test-env.sh "node -e \"
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

supabase
  .from('ai_reveal_plans')
  .select('*')
  .eq('memorypop_id', '$GIFT_ID')
  .single()
  .then(({ data, error }) => {
    if (error || !data) {
      console.error('❌ No plan found');
      console.error('Check server logs for generation errors');
      process.exit(1);
    }

    console.log('✅ Plan saved successfully');
    console.log('   Model:', data.model_name);
    console.log('   Source:', data.generation_source);
    console.log('   Chapters:', data.chapters_data?.length || 0);
    console.log('   Input Hash:', data.input_hash?.substring(0, 16) + '...');

    if (data.model_name === 'openai/gpt-oss-120b' && data.generation_source === 'ai_generated') {
      console.log('');
      console.log('🎉 LIVE GROQ GENERATION CONFIRMED');
    } else if (data.model_name === 'deterministic') {
      console.log('');
      console.log('⚠️  Using deterministic fallback (not Groq)');
      console.log('Check server logs for generation errors');
    }

    process.exit(0);
  });
\""

echo ""
echo "5. Testing reveal playback:"
echo "   Open: http://localhost:3000/m/$SHARE_CODE/reveal"
echo ""
read -p "Verify the reveal displays properly, then press Enter..."

echo ""
echo "6. Testing cache behavior:"
echo "   Refresh the reveal page in your browser"
echo "   The plan should be reused (no new generation)"
echo ""
read -p "After refreshing, press Enter..."

echo ""
echo "✅ Groq Integration Test Complete"
echo ""
echo "Final checks:"
echo "- Recipient name visible: Casey Fictional"
echo "- Contributor names readable (improved contrast)"
echo "- Text-only memories use letter layout (no empty space)"
echo "- Chapters, transitions, decorations present"
echo "- Refresh reuses same plan (cached)"

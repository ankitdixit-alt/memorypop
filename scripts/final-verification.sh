#!/bin/bash
# Final Production Verification for Groq Integration
# Run before production deployment

set -e

echo "🔍 Final Production Verification"
echo "================================="
echo ""

# Track overall success
VERIFICATION_FAILED=0

# =====================================================
# 1. TypeScript Type Check
# =====================================================
echo "1️⃣  TypeScript Type Check..."
if npm run typecheck > /tmp/typecheck.log 2>&1; then
  echo "✅ TypeScript: PASS"
else
  echo "❌ TypeScript: FAIL (see /tmp/typecheck.log)"
  VERIFICATION_FAILED=1
fi

# =====================================================
# 2. Build Test
# =====================================================
echo ""
echo "2️⃣  Production Build Test..."
if npm run build > /tmp/build.log 2>&1; then
  echo "✅ Build: PASS"
else
  echo "❌ Build: FAIL (see /tmp/build.log)"
  VERIFICATION_FAILED=1
fi

# =====================================================
# 3. Unit Tests
# =====================================================
echo ""
echo "3️⃣  AI Director Unit Tests..."
if npm test -- --testPathPattern="prepareRevealPlan|concurrent|timeout|revealPlanService|mockProvider" --passWithNoTests > /tmp/tests.log 2>&1; then
  TEST_COUNT=$(grep -o "[0-9]* tests* passed" /tmp/tests.log | head -1 || echo "0 tests passed")
  echo "✅ Tests: PASS ($TEST_COUNT)"
else
  echo "❌ Tests: FAIL (see /tmp/tests.log)"
  VERIFICATION_FAILED=1
fi

# =====================================================
# 4. Mock Provider Security Check
# =====================================================
echo ""
echo "4️⃣  Mock Provider Security..."
if grep -q "INTEGRATION_TEST === 'true' || process.env.NODE_ENV === 'test'" src/lib/ai/__mocks__/mockAIProvider.ts; then
  echo "✅ Mock security: PASS (requires test environment)"
else
  echo "❌ Mock security: FAIL (insufficient guards)"
  VERIFICATION_FAILED=1
fi

# =====================================================
# 5. Environment Variable Check
# =====================================================
echo ""
echo "5️⃣  Environment Configuration..."
if [ -f ".env.local" ]; then
  echo "✅ .env.local exists"

  if grep -q "GROQ_API_KEY=" .env.local; then
    echo "✅ GROQ_API_KEY configured"
  else
    echo "⚠️  GROQ_API_KEY not found in .env.local"
  fi

  if grep -q "TEST_AI_PROVIDER" .env.local; then
    echo "⚠️  Warning: TEST_AI_PROVIDER in .env.local (should only be in .env.test)"
  fi

  if grep -q "INTEGRATION_TEST" .env.local; then
    echo "⚠️  Warning: INTEGRATION_TEST in .env.local (should only be in .env.test)"
  fi
else
  echo "❌ .env.local missing"
  VERIFICATION_FAILED=1
fi

# =====================================================
# 6. Fallback Behavior Check
# =====================================================
echo ""
echo "6️⃣  Deterministic Plus Fallback..."
if grep -q "generation_source: 'deterministic_fallback'" src/lib/ai/prepareRevealPlan.ts; then
  echo "✅ Deterministic fallback: PASS (available on errors)"
else
  echo "❌ Deterministic fallback: Missing"
  VERIFICATION_FAILED=1
fi

# =====================================================
# 7. Standard Reveal Unchanged
# =====================================================
echo ""
echo "7️⃣  Standard Reveal Protection..."
if grep -q "if (!memoryPop.is_premium)" src/app/m/[shareCode]/reveal/page.tsx; then
  echo "✅ Standard reveal: PASS (separate code path)"
else
  echo "⚠️  Standard reveal: Review needed"
fi

# =====================================================
# 8. Production Safety Checks
# =====================================================
echo ""
echo "8️⃣  Production Safety..."

# Check no hardcoded test URLs
if grep -r "localhost:3000" src/ --exclude-dir=__tests__ 2>/dev/null | grep -v "// " | grep -v "example" | grep -q "localhost"; then
  echo "⚠️  Warning: Found localhost references in src/"
else
  echo "✅ No hardcoded test URLs"
fi

# Check no console.log in production code (warnings are OK)
CONSOLE_COUNT=$(grep -r "console\.log" src/ --exclude-dir=__tests__ --exclude-dir=__mocks__ 2>/dev/null | wc -l || echo 0)
if [ "$CONSOLE_COUNT" -gt 10 ]; then
  echo "⚠️  Warning: $CONSOLE_COUNT console.log statements found"
else
  echo "✅ Console logging: acceptable ($CONSOLE_COUNT statements)"
fi

# =====================================================
# Summary
# =====================================================
echo ""
echo "================================="
if [ $VERIFICATION_FAILED -eq 0 ]; then
  echo "✅ ALL VERIFICATIONS PASSED"
  echo ""
  echo "Ready for production deployment:"
  echo "1. Apply database migration (PRODUCTION_AI_DIRECTOR_MIGRATION.sql)"
  echo "2. Set ENABLE_AI_DIRECTOR=true in Vercel environment"
  echo "3. Deploy to production"
  echo "4. Verify with smoke test"
  exit 0
else
  echo "❌ SOME VERIFICATIONS FAILED"
  echo ""
  echo "Review failures above before deploying"
  exit 1
fi

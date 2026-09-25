#!/bin/bash
# Test Environment Launcher Verification
# Tests launcher script with various configurations
# Does not require database connection - uses dummy config

set -e

echo "========================================="
echo "Testing Test Environment Launcher"
echo "========================================="
echo ""

LAUNCHER="./scripts/run-with-test-env.sh"
TEST_ENV=".env.test"
BACKUP_ENV=".env.test.backup"

# Backup existing .env.test if it exists
if [ -f "$TEST_ENV" ]; then
  echo "📦 Backing up existing $TEST_ENV"
  cp "$TEST_ENV" "$BACKUP_ENV"
fi

cleanup() {
  # Restore backup
  if [ -f "$BACKUP_ENV" ]; then
    echo "📦 Restoring $TEST_ENV"
    mv "$BACKUP_ENV" "$TEST_ENV"
  fi
}

trap cleanup EXIT

# Test 1: Missing .env.test file
echo "🧪 Test 1: Missing .env.test file"
rm -f "$TEST_ENV"
if $LAUNCHER "echo test" 2>&1 | grep -q "❌ .env.test not found"; then
  echo "   ✅ Correctly rejects missing config"
else
  echo "   ❌ Should reject missing config"
  exit 1
fi
echo ""

# Test 2: Missing required variables
echo "🧪 Test 2: Missing required variables"
cat > "$TEST_ENV" <<EOF
# Incomplete config
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EOF
if $LAUNCHER "echo test" 2>&1 | grep -q "❌ Missing required environment variables"; then
  echo "   ✅ Correctly rejects incomplete config"
else
  echo "   ❌ Should reject incomplete config"
  exit 1
fi
echo ""

# Test 3: Production URL rejected
echo "🧪 Test 3: Production URL rejected"
cat > "$TEST_ENV" <<EOF
NEXT_PUBLIC_SUPABASE_URL=https://gvfpgawbvuttglfscngg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=test_key
TEST_PROJECT_REF=test
EOF
if $LAUNCHER "echo test" 2>&1 | grep -q "❌ SAFETY CHECK FAILED"; then
  echo "   ✅ Correctly rejects production URL"
else
  echo "   ❌ Should reject production URL"
  exit 1
fi
echo ""

# Test 4: Valid localhost config
echo "🧪 Test 4: Valid localhost config"
cat > "$TEST_ENV" <<EOF
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=test_service_role_key
TEST_PROJECT_REF=local
EOF
if $LAUNCHER "echo 'Command executed'" 2>&1 | grep -q "Command executed"; then
  echo "   ✅ Accepts localhost config"
else
  echo "   ❌ Should accept localhost config"
  exit 1
fi
echo ""

# Test 5: Valid test project config
echo "🧪 Test 5: Valid test project config"
cat > "$TEST_ENV" <<EOF
NEXT_PUBLIC_SUPABASE_URL=https://test123xyz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=test_service_role_key
TEST_PROJECT_REF=test123xyz
EOF
if $LAUNCHER "echo 'Test project OK'" 2>&1 | grep -q "Test project OK"; then
  echo "   ✅ Accepts test project config"
else
  echo "   ❌ Should accept test project config"
  exit 1
fi
echo ""

# Test 6: Command with arguments
echo "🧪 Test 6: Command execution with arguments"
cat > "$TEST_ENV" <<EOF
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=test_key
TEST_PROJECT_REF=local
EOF
OUTPUT=$($LAUNCHER "echo arg1 arg2 arg3" 2>&1)
if echo "$OUTPUT" | grep -q "arg1 arg2 arg3"; then
  echo "   ✅ Correctly passes arguments"
else
  echo "   ❌ Should pass arguments correctly"
  exit 1
fi
echo ""

# Test 7: Environment variables available in command
echo "🧪 Test 7: Environment variables available"
cat > "$TEST_ENV" <<EOF
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=test_secret_key
TEST_PROJECT_REF=local
TEST_CUSTOM_VAR=custom_value
EOF
OUTPUT=$($LAUNCHER "echo \$NEXT_PUBLIC_SUPABASE_URL \$TEST_CUSTOM_VAR" 2>&1)
if echo "$OUTPUT" | grep -q "localhost" && echo "$OUTPUT" | grep -q "custom_value"; then
  echo "   ✅ Environment variables loaded"
else
  echo "   ❌ Environment variables not loaded correctly"
  exit 1
fi
echo ""

echo "========================================="
echo "Launcher Verification Complete"
echo "========================================="
echo "✅ All 7 tests passed"
echo ""

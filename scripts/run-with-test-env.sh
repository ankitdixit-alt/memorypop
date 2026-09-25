#!/bin/bash
# Test Environment Launcher
# Loads test database configuration without overwriting .env.local
# Usage: ./scripts/run-with-test-env.sh <command>
# Example: ./scripts/run-with-test-env.sh "npm run dev"

set -e

# Check if .env.test exists
if [ ! -f .env.test ]; then
  echo "❌ .env.test not found"
  echo "   Create it first: cp .env.test.template .env.test"
  exit 1
fi

# Load test environment variables
echo "📦 Loading test environment from .env.test..."

# Export each line from .env.test
set -a
source .env.test
set +a

# Verify critical variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$TEST_PROJECT_REF" ]; then
  echo "❌ Missing required environment variables in .env.test"
  echo "   NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:-(not set)}"
  echo "   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:+(set)}"
  echo "   TEST_PROJECT_REF: ${TEST_PROJECT_REF:-(not set)}"
  exit 1
fi

# Extract hostname from URL for validation
HOSTNAME=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's|^https?://([^/:]+).*|\1|')

if [ -z "$HOSTNAME" ]; then
  echo "❌ MALFORMED URL"
  echo "   Cannot extract hostname from: $NEXT_PUBLIC_SUPABASE_URL"
  exit 1
fi

# Check for localhost (exact match)
if [ "$HOSTNAME" = "localhost" ] || [ "$HOSTNAME" = "127.0.0.1" ]; then
  echo "✅ Test environment loaded (localhost)"
  echo "   URL: $NEXT_PUBLIC_SUPABASE_URL"
  echo ""
elif [ "$HOSTNAME" = "${TEST_PROJECT_REF}.supabase.co" ]; then
  echo "✅ Test environment loaded (test project)"
  echo "   URL: $NEXT_PUBLIC_SUPABASE_URL"
  echo "   Ref: $TEST_PROJECT_REF"
  echo ""
else
  echo "❌ HOSTNAME MISMATCH"
  echo "   Expected: localhost or ${TEST_PROJECT_REF}.supabase.co"
  echo "   Got: $HOSTNAME"
  exit 1
fi

# Block known production hostnames
if [ "$HOSTNAME" = "gvfpgawbvuttglfscngg.supabase.co" ]; then
  echo "❌ PRODUCTION DATABASE BLOCKED"
  echo "   This script MUST NOT run against production."
  echo "   Hostname: $HOSTNAME"
  exit 1
fi

# Confirm test project
echo "✅ Test environment loaded"
echo "   URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "   Ref: ${TEST_PROJECT_REF:-(not set)}"
echo ""

# Execute the provided command
if [ $# -eq 0 ]; then
  echo "Usage: $0 <command>"
  echo "Examples:"
  echo "  $0 \"npm run dev\""
  echo "  $0 \"npm test\""
  echo "  $0 \"npm run build\""
  exit 1
fi

echo "🚀 Running: $@"
echo ""

# Execute command with test environment
exec bash -c "$@"

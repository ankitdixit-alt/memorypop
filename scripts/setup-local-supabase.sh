#!/bin/bash
set -e

# Local Supabase Setup Script
# Prerequisites: Docker Desktop running, Supabase CLI installed

echo "=========================================="
echo "Memory Pop - Local Supabase Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop:"
    echo "   brew install --cask docker"
    echo "   Then start Docker Desktop and run this script again."
    exit 1
fi

if ! docker info &> /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Docker running"
echo "✅ Supabase CLI installed"
echo ""

# Initialize Supabase project (if not already initialized)
if [ ! -d "supabase" ]; then
    echo "Initializing Supabase project..."
    supabase init
    echo "✅ Supabase project initialized"
else
    echo "✅ Supabase project already initialized"
fi

# Check if Supabase is already running
if supabase status 2>/dev/null | grep -q "supabase local development setup is running"; then
    echo "✅ Supabase already running"
else
    echo "Starting Supabase (this may take 1-2 minutes on first run)..."
    supabase start
    echo "✅ Supabase started"
fi

echo ""
echo "=========================================="
echo "Applying Migrations"
echo "=========================================="

# Copy migrations to supabase/migrations if they're not already there
if [ -d "migrations" ] && [ -d "supabase/migrations" ]; then
    echo "Copying AI Director migrations..."
    cp migrations/012_add_ai_reveal_plans.sql supabase/migrations/ 2>/dev/null || true
    cp migrations/013_add_concurrency_protection.sql supabase/migrations/ 2>/dev/null || true
    cp migrations/014_allow_null_pending_plans.sql supabase/migrations/ 2>/dev/null || true
    cp migrations/015_add_publish_function.sql supabase/migrations/ 2>/dev/null || true
fi

# Apply migrations
echo "Applying migrations 012-015..."
supabase db reset --local

echo ""
echo "=========================================="
echo "Configuration"
echo "=========================================="

# Get connection details
echo "Local Supabase Details:"
echo ""
supabase status --output env

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "1. Copy keys from above to .env.local.supabase.template"
echo "2. Backup your current .env.local:"
echo "   cp .env.local .env.local.production"
echo "3. Use local config:"
echo "   cp .env.local.supabase.template .env.local"
echo "4. Fill in the Supabase keys in .env.local"
echo "5. Start dev server:"
echo "   npm run dev"
echo "6. Run seed script:"
echo "   npx tsx scripts/seed-test-data.ts"
echo ""
echo "To stop Supabase:"
echo "   supabase stop"
echo ""
echo "To restore production config:"
echo "   cp .env.local.production .env.local"
echo ""
echo "=========================================="

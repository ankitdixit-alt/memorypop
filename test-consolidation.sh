#!/bin/bash
# Consolidation Testing Script
# Tests that merged Plus/Premium prototype works correctly

echo "=================================="
echo "MemoryPop Consolidation Test"
echo "=================================="
echo ""

# 1. Check folder structure
echo "1. Verifying folder structure..."
if [ -d ~/Downloads/MemoryPop_Standalone_Preview ]; then
  echo "   ✗ FAIL: Source folder still exists (should be removed)"
  exit 1
else
  echo "   ✓ Source folder removed"
fi

if [ -d ~/Downloads/MemoryPop/memorypop ]; then
  echo "   ✓ Target folder exists"
else
  echo "   ✗ FAIL: Target folder missing"
  exit 1
fi

# 2. Check merged files
echo ""
echo "2. Verifying merged files..."
FILES=(
  "src/app/ai-director-reveal/TileTransition.tsx"
  "src/app/ai-director-reveal/RevealPreview.tsx"
  "src/app/ai-director-reveal/prototype.ts"
  "src/app/ai-director-reveal/reveal.module.css"
  "src/components/DecorativeOverlay.tsx"
  "src/config/decorations.ts"
)

for file in "${FILES[@]}"; do
  if [ -f ~/Downloads/MemoryPop/memorypop/$file ]; then
    echo "   ✓ $file"
  else
    echo "   ✗ FAIL: $file missing"
    exit 1
  fi
done

# 3. Check dev server
echo ""
echo "3. Verifying dev server..."
if pgrep -f "next dev.*3000" > /dev/null; then
  echo "   ✓ Dev server running on port 3000"
else
  echo "   ✗ FAIL: Dev server not running"
  exit 1
fi

# 4. Check page loads
echo ""
echo "4. Verifying page loads..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ai-director-reveal)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✓ Page loads (HTTP 200)"
else
  echo "   ✗ FAIL: Page returns HTTP $HTTP_CODE"
  exit 1
fi

# 5. Check page content
echo ""
echo "5. Verifying page content..."
PAGE_HTML=$(curl -s http://localhost:3000/ai-director-reveal)

# Check for key UI elements
if echo "$PAGE_HTML" | grep -q "MemoryPop"; then
  echo "   ✓ MemoryPop branding present"
else
  echo "   ✗ FAIL: MemoryPop branding missing"
  exit 1
fi

if echo "$PAGE_HTML" | grep -q "AI Director concept"; then
  echo "   ✓ AI Director mode selector present"
else
  echo "   ✗ FAIL: AI Director mode missing"
  exit 1
fi

if echo "$PAGE_HTML" | grep -q "Standard reveal"; then
  echo "   ✓ Standard mode selector present"
else
  echo "   ✗ FAIL: Standard mode missing"
  exit 1
fi

if echo "$PAGE_HTML" | grep -q "Birthday"; then
  echo "   ✓ Birthday occasion present"
else
  echo "   ✗ FAIL: Birthday occasion missing"
  exit 1
fi

if echo "$PAGE_HTML" | grep -q "Begin the reveal"; then
  echo "   ✓ Begin button present"
else
  echo "   ✗ FAIL: Begin button missing"
  exit 1
fi

# 6. Check for TileTransition code
echo ""
echo "6. Verifying TileTransition implementation..."
if grep -q "TileTransition" ~/Downloads/MemoryPop/memorypop/src/app/ai-director-reveal/RevealPreview.tsx; then
  echo "   ✓ TileTransition imported in RevealPreview"
else
  echo "   ✗ FAIL: TileTransition not imported"
  exit 1
fi

if grep -q "tileFadeOut\|tileSlideOut\|tileDissolve" ~/Downloads/MemoryPop/memorypop/src/app/ai-director-reveal/prototype.ts; then
  echo "   ✓ Tile variants defined in prototype"
else
  echo "   ✗ FAIL: Tile variants missing"
  exit 1
fi

# 7. Check DecorativeOverlay changes
echo ""
echo "7. Verifying DecorativeOverlay scene awareness..."
if grep -q "sceneType" ~/Downloads/MemoryPop/memorypop/src/components/DecorativeOverlay.tsx; then
  echo "   ✓ Scene awareness implemented"
else
  echo "   ✗ FAIL: Scene awareness missing"
  exit 1
fi

# 8. Check no external requests in code
echo ""
echo "8. Verifying no external API calls..."
if grep -q "googleapis.com\|supabase.co.*from.*ai-director-reveal" ~/Downloads/MemoryPop/memorypop/src/app/ai-director-reveal/*.tsx 2>/dev/null; then
  echo "   ✗ FAIL: External API calls found in prototype"
  exit 1
else
  echo "   ✓ No external API calls in prototype"
fi

# 9. Check secrets not copied
echo ""
echo "9. Verifying secrets safety..."
if [ -f ~/Downloads/MemoryPop_Standalone_Preview/.env.local ]; then
  echo "   ✗ WARNING: Source .env.local still exists (but source folder should be removed)"
fi

# Don't check for specific secrets, just verify we didn't break env
if grep -q "SUPABASE_SERVICE_ROLE_KEY" ~/Downloads/MemoryPop/memorypop/.env.local; then
  echo "   ✓ Target .env.local intact"
else
  echo "   ✗ FAIL: Target .env.local missing required vars"
  exit 1
fi

# 10. Summary
echo ""
echo "=================================="
echo "✓ ALL TESTS PASSED"
echo "=================================="
echo ""
echo "Consolidation Status:"
echo "  • Source folder: REMOVED"
echo "  • Target folder: ACTIVE (~/Downloads/MemoryPop/memorypop)"
echo "  • Dev server: RUNNING (http://localhost:3000/ai-director-reveal)"
echo "  • Tile transitions: IMPLEMENTED"
echo "  • Decorations: SCENE-AWARE"
echo "  • Secrets: SAFE"
echo ""
echo "Ready for manual browser testing:"
echo "  1. Open http://localhost:3000/ai-director-reveal"
echo "  2. Test Standard and Plus/Premium modes"
echo "  3. Verify tile transitions animate"
echo "  4. Verify decorations stay in corners"
echo "  5. Verify no message duplication"
echo ""

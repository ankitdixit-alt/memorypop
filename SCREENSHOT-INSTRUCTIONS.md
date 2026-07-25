# Screenshot Instructions for Mockup Routes

## Quick Start (Automated - Recommended)

### 1. Install Playwright
```bash
npm install -D @playwright/test
```

### 2. Ensure dev server is running
```bash
# In one terminal:
npm run dev

# Should see: ▲ Next.js 16.2.9 (Turbopack)
#            - Local: http://localhost:3000
```

### 3. Run screenshot script
```bash
# In another terminal:
npm run screenshot:mockups
```

**Expected Output:**
```
🎨 MemoryPop Mockup Screenshot Script

Checking dev server...
✅ Dev server is running

Launching browser...
[1/12] Capturing Birthday cover (16:10)...
    ✅ Saved: birthday-cover.png
[2/12] Capturing Birthday message card (4:5)...
    ✅ Saved: birthday-message.png
...
[12/12] Capturing Farewell demo preview (16:9)...
    ✅ Saved: farewell-demo-preview.png

==================================================
📊 Screenshot Summary
==================================================
✅ Successful: 12/12
📁 Output directory: /public/images/mockups
==================================================

🎉 All screenshots captured successfully!
```

### 4. Verify screenshots
```bash
ls -lh public/images/mockups/
```

You should see 12 PNG files:
- birthday-cover.png
- birthday-message.png
- birthday-photo-grid.png
- birthday-demo-preview.png
- retirement-cover.png
- retirement-message.png
- retirement-timeline.png
- retirement-demo-preview.png
- farewell-cover.png
- farewell-message.png
- farewell-memory-collection.png
- farewell-demo-preview.png

---

## Manual Approach (Alternative)

If you prefer to screenshot manually:

### 1. Open browser to each route

**Birthday routes:**
- http://localhost:3000/mockups/birthday-cover (1600×1000px)
- http://localhost:3000/mockups/birthday-message (800×1000px)
- http://localhost:3000/mockups/birthday-photo-grid (800×1000px)
- http://localhost:3000/mockups/birthday-demo-preview (1920×1080px)

**Retirement routes:**
- http://localhost:3000/mockups/retirement-cover (1600×1000px)
- http://localhost:3000/mockups/retirement-message (800×1000px)
- http://localhost:3000/mockups/retirement-timeline (800×1000px)
- http://localhost:3000/mockups/retirement-demo-preview (1920×1080px)

**Farewell routes:**
- http://localhost:3000/mockups/farewell-cover (1600×1000px)
- http://localhost:3000/mockups/farewell-message (800×1000px)
- http://localhost:3000/mockups/farewell-memory-collection (800×1000px)
- http://localhost:3000/mockups/farewell-demo-preview (1920×1080px)

### 2. Set viewport in browser DevTools

1. Open DevTools (F12 or Cmd+Option+I)
2. Click device toolbar icon (Cmd+Shift+M)
3. Select "Responsive" mode
4. Enter exact width×height from list above
5. Ensure zoom is 100%

### 3. Capture screenshot

**Using Chrome DevTools:**
1. Open Command Palette (Cmd+Shift+P)
2. Type "screenshot"
3. Select "Capture screenshot"
4. Save with exact filename from list above

**Using macOS:**
1. Press Cmd+Shift+4
2. Press Space to capture window (or drag to select area)
3. Save with exact filename from list above

### 4. Save to correct location
```bash
/public/images/mockups/birthday-cover.png
/public/images/mockups/birthday-message.png
# ... etc
```

---

## After Screenshots: Integration

Once all 12 screenshots are saved, replace placeholder divs in landing pages.

### Birthday Page Integration
File: `src/app/birthday-memory-book/page.tsx`

**Find placeholder (Line ~98-100):**
```tsx
<div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-primary/10"></div>
```

**Replace with:**
```tsx
<Image
  src="/images/mockups/birthday-cover.png"
  alt="Birthday MemoryPop showing recipient name, contributor count, and celebration stats"
  width={1600}
  height={1000}
  className="w-full h-auto"
  priority
/>
```

**Don't forget the import at the top:**
```tsx
import Image from 'next/image';
```

### Repeat for All Placeholders

**Birthday page needs 4 images:**
1. birthday-cover.png (hero section)
2. birthday-message.png (message card example)
3. birthday-photo-grid.png (photo grid example)
4. birthday-demo-preview.png (interactive demo section)

**Retirement page needs 4 images:**
1. retirement-cover.png
2. retirement-message.png
3. retirement-timeline.png
4. retirement-demo-preview.png

**Farewell page needs 4 images:**
1. farewell-cover.png
2. farewell-message.png
3. farewell-memory-collection.png
4. farewell-demo-preview.png

### Complete Integration Guide
See `.pipeline/mockup-screenshot-guide.md` for:
- Exact line numbers for each placeholder
- Complete Image component code for all 12 replacements
- Verification checklist

---

## Troubleshooting

### "Dev server not running"
**Solution:**
```bash
npm run dev
```

If port 3000 is in use:
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use the port that's available (check terminal output)
# Update BASE_URL in scripts/screenshot-mockups.js if needed
```

### "Cannot find module @playwright/test"
**Solution:**
```bash
npm install -D @playwright/test
```

### Screenshots are blank or look wrong
**Solution:**
1. Increase wait time in script: change `WAIT_FOR_LOAD = 2000` to `5000`
2. Clear browser cache and hard refresh (Cmd+Shift+R)
3. Check browser console for errors (F12)
4. Verify fonts loaded by checking inspector

### Screenshots are low resolution
**Solution:**
- Automated script uses 2x device scale factor (retina quality)
- For manual screenshots on macOS, save as PNG (not JPG)
- Ensure browser zoom is 100%

---

## Verification Checklist

After completing screenshots and integration:

- [ ] All 12 PNG files exist in `/public/images/mockups/`
- [ ] File sizes reasonable (100-300KB each)
- [ ] Images display correctly on all 3 landing pages
- [ ] Aspect ratios maintained (no stretching)
- [ ] Images load quickly (< 1s on good connection)
- [ ] Alt text provides context for accessibility
- [ ] No placeholder divs remain
- [ ] `npm run build` succeeds
- [ ] Landing pages pass visual review

---

## Next Steps

After integration complete:
1. Run Testing stage: `.pipeline/tests.md`
2. Run Judge stage: `.pipeline/judge.md`
3. Run Reviewer stage: `.pipeline/review.md`
4. Founder production validation
5. Production deployment

---

**Created:** 2026-07-25
**For:** Phase 2C - Landing Page Mockup Integration
**Status:** Ready for execution

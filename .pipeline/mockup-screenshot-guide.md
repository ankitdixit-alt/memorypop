# MemoryPop Mockup Screenshot Guide

## Completion Summary

✅ **Status:** 12 screenshot-ready preview routes completed
✅ **Implementation:** Real MemoryPop UI with authentic design system
✅ **Noindex:** All routes blocked from search indexing
✅ **Aspect Ratios:** Exact specifications (16:10, 4:5, 16:9)
✅ **Content:** Realistic names, dates, messages, and stats

---

## Preview Routes

### Birthday Preview Routes

#### 1. `/mockups/birthday-cover` (16:10 aspect ratio)
- **Content:** Sarah's 30th Birthday
- **Stats:** 15 contributors, 42 memories, 86 photos
- **Viewport:** 1600×1000px recommended
- **Save as:** `birthday-cover.png`

#### 2. `/mockups/birthday-message` (4:5 aspect ratio)
- **Content:** Emma K., Paris memory message
- **Photo:** Eiffel Tower emoji placeholder
- **Viewport:** 800×1000px recommended
- **Save as:** `birthday-message.png`

#### 3. `/mockups/birthday-photo-grid` (4:5 aspect ratio)
- **Content:** 6 celebration moment placeholders
- **Total:** 86 photos indicated
- **Viewport:** 800×1000px recommended
- **Save as:** `birthday-photo-grid.png`

#### 4. `/mockups/birthday-demo-preview` (16:9 aspect ratio)
- **Content:** Browser frame showing MemoryPop interface
- **Viewport:** 1920×1080px recommended
- **Save as:** `birthday-demo-preview.png`

---

### Retirement Preview Routes

#### 5. `/mockups/retirement-cover` (16:10 aspect ratio)
- **Content:** David's Retirement - 30 Years of Leadership & Impact
- **Stats:** 18 contributors, 67 memories, 120 photos
- **Viewport:** 1600×1000px recommended
- **Save as:** `retirement-cover.png`

#### 6. `/mockups/retirement-message` (4:5 aspect ratio)
- **Content:** Jennifer S., mentorship message
- **Date:** Dec 20, 2024
- **Viewport:** 800×1000px recommended
- **Save as:** `retirement-message.png`

#### 7. `/mockups/retirement-timeline` (4:5 aspect ratio)
- **Content:** Career milestones 1994-2024
- **Milestones:** Started, Senior Manager, Director, Retirement
- **Viewport:** 800×1000px recommended
- **Save as:** `retirement-timeline.png`

#### 8. `/mockups/retirement-demo-preview` (16:9 aspect ratio)
- **Content:** Browser frame showing MemoryPop interface
- **Viewport:** 1920×1080px recommended
- **Save as:** `retirement-demo-preview.png`

---

### Farewell Preview Routes

#### 9. `/mockups/farewell-cover` (16:10 aspect ratio)
- **Content:** We'll Miss You, Alex
- **Stats:** 24 contributors, 58 memories, 94 photos
- **Viewport:** 1600×1000px recommended
- **Save as:** `farewell-cover.png`

#### 10. `/mockups/farewell-message` (4:5 aspect ratio)
- **Content:** Michael T., goodbye message
- **Date:** Nov 8, 2024
- **Viewport:** 800×1000px recommended
- **Save as:** `farewell-message.png`

#### 11. `/mockups/farewell-memory-collection` (4:5 aspect ratio)
- **Content:** 6 shared moments with authors
- **Total:** 58 memories indicated
- **Viewport:** 800×1000px recommended
- **Save as:** `farewell-memory-collection.png`

#### 12. `/mockups/farewell-demo-preview` (16:9 aspect ratio)
- **Content:** Browser frame showing MemoryPop interface
- **Viewport:** 1920×1080px recommended
- **Save as:** `farewell-demo-preview.png`

---

## Screenshot Instructions

### Option 1: Manual Browser Screenshots

1. **Dev server is already running** at `http://localhost:3000`
   - If not, run: `npm run dev`

2. **Open each route in browser:**
   - Birthday: `http://localhost:3000/mockups/birthday-cover`
   - etc.

3. **Set viewport to recommended size** (browser DevTools)

4. **Capture clean screenshot** (no browser chrome)
   - Mac: `Cmd + Shift + 4` → Select area
   - Windows: Snipping Tool
   - Chrome DevTools: `Cmd + Shift + P` → "Capture screenshot"

5. **Save with exact filename** from table above

### Option 2: Automated Screenshots (Recommended)

```bash
# Install Playwright
npm install -D @playwright/test

# Create screenshot script
# (See implementation suggestion below)
```

**Playwright Script Suggestion:**
```javascript
// scripts/screenshot-mockups.js
import { chromium } from '@playwright/test';

const mockups = [
  { path: '/mockups/birthday-cover', filename: 'birthday-cover.png', width: 1600, height: 1000 },
  { path: '/mockups/birthday-message', filename: 'birthday-message.png', width: 800, height: 1000 },
  // ... add all 12 mockups
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const mockup of mockups) {
  await page.setViewportSize({ width: mockup.width, height: mockup.height });
  await page.goto(`http://localhost:3000${mockup.path}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `public/images/mockups/${mockup.filename}`, fullPage: false });
  console.log(`✅ ${mockup.filename}`);
}

await browser.close();
```

---

## Integration After Screenshots

Once screenshots are captured and saved to `/public/images/mockups/`:

### Update Birthday Page
File: `src/app/birthday-memory-book/page.tsx`

Replace placeholder divs with:
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

Repeat for all 4 birthday screenshots.

### Update Retirement Page
File: `src/app/retirement-memory-book/page.tsx`

Same pattern with retirement screenshot filenames.

### Update Farewell Page
File: `src/app/farewell-memory-book/page.tsx`

Same pattern with farewell screenshot filenames.

---

## Verification Checklist

After integrating screenshots:

- [ ] All 12 screenshots display correctly on landing pages
- [ ] Aspect ratios maintained (no stretching)
- [ ] Images load quickly (< 1s on 3G)
- [ ] Alt text provides context
- [ ] No placeholder divs remain
- [ ] Landing pages pass visual review
- [ ] Re-run Tester agent
- [ ] Re-run Judge agent
- [ ] Re-run Reviewer agent

---

## Technical Details

**Noindex Metadata:**
All mockup routes include `robots: { index: false, follow: false }` to prevent search indexing.

**Design System:**
- Colors: Warm palette (#FFF8F2 bg, #2B1E18 text, #FF6B57 primary)
- Typography: Geist Sans for body, Georgia for headings
- Components: Real MemoryPop cards, gradients, and layouts
- Cover styles: 'balloons' (birthday), 'elegant' (retirement), 'grateful' (farewell)

**Content Authenticity:**
- All names, dates, and messages are realistic examples
- Stats chosen to show meaningful engagement
- Messages demonstrate actual user value propositions

---

## Questions?

If screenshots don't render correctly:
1. Verify dev server running (`npm run dev`)
2. Check browser console for errors
3. Confirm viewport matches recommended size
4. Try hard refresh (Cmd + Shift + R)

If aspect ratios look wrong:
- Container divs enforce exact ratios via inline styles
- Content scales responsively within containers
- No manual cropping needed

---

**Created:** 2026-07-25
**Status:** Ready for Founder screenshots
**Next Step:** Capture 12 screenshots → Integrate → Re-test

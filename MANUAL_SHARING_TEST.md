# Manual Sharing Test - Focused Checklist

**Environment**: memorypop-test (lbjtwbpnlruykqgsaiwy)
**Server**: http://localhost:3000
**Date**: September 29, 2026

---

## Prerequisites

1. **Start local server**:
   ```bash
   npm run dev
   ```

2. **Create test gift** (if needed):
   - Share code: `test-sharing-verification`
   - Recipient: Sarah
   - Occasion: Birthday
   - Add 2-3 fictional memories

---

## Test 1: Contributor Mode Sharing

**URL**: http://localhost:3000/m/test-sharing-verification/contribute

### A. Copy Link
- [ ] Click "Copy Link" button
- [ ] Verify "Copied! ✓" feedback appears
- [ ] Paste in browser address bar
- [ ] Verify URL is: `http://localhost:3000/m/test-sharing-verification/contribute`

### B. WhatsApp
- [ ] Click "Share on WhatsApp"
- [ ] Verify WhatsApp Web opens (or desktop app)
- [ ] Verify message starts with: "Help us celebrate Sarah's birthday!"
- [ ] Verify link ends with: `/contribute`
- [ ] **PASS CRITERIA**: Occasion-specific message + contribution link

### C. Email
- [ ] Click "📧 Email"
- [ ] Verify email client opens
- [ ] Verify subject: "Help celebrate Sarah"
- [ ] Verify body contains occasion message + contribution link
- [ ] **PASS CRITERIA**: Appropriate subject + contribution request

### D. More Sharing Options
- [ ] Click "More sharing options"
- [ ] Verify dropdown menu opens
- [ ] Click outside menu
- [ ] Verify menu closes
- [ ] **PASS CRITERIA**: Click-outside pattern works

### E. Telegram (from dropdown)
- [ ] Click "More sharing options" → "Telegram"
- [ ] Verify new tab opens
- [ ] Verify URL starts with: `https://t.me/share/url`
- [ ] Verify `text` parameter contains occasion message
- [ ] Verify `url` parameter contains contribution link
- [ ] **PASS CRITERIA**: Opens web.telegram.org without requiring app

### F. Copy Message (from dropdown)
- [ ] Click "More sharing options" → "Copy message"
- [ ] Verify "Message copied! ✓" feedback
- [ ] Paste in text editor
- [ ] Verify contains: occasion message + contribution link
- [ ] **PASS CRITERIA**: Full invitation text copied

---

## Test 2: Reveal Mode - Product Sharing

**URL**: http://localhost:3000/m/test-sharing-verification/reveal

### A. Navigate to FinalScreen
- [ ] Click "Open My MemoryPop" (welcome screen)
- [ ] Wait for cinematic to complete (or skip if testing)
- [ ] Verify "Final celebration" screen appears
- [ ] **IMPORTANT**: Do NOT click "Continue" yet

### B. Verify Product Sharing Appears
- [ ] Scroll down on FinalScreen
- [ ] Verify "Loved this experience?" section appears
- [ ] Verify section is BELOW "Continue" button
- [ ] Verify section has border separator at top
- [ ] **PASS CRITERIA**: Product sharing visible WITHOUT clicking Continue

### C. Copy Link (Product Mode)
- [ ] Click "Copy Link" button in product sharing section
- [ ] Paste in browser address bar
- [ ] Verify URL is: `http://localhost:3000` (homepage)
- [ ] **PASS CRITERIA**: Links to homepage, NOT gift-specific URL

### D. WhatsApp (Product Mode)
- [ ] Click "Share on WhatsApp" in product sharing section
- [ ] Verify WhatsApp opens
- [ ] Verify message: "Create beautiful collaborative gifts with MemoryPop - the perfect way to celebrate someone special. http://localhost:3000"
- [ ] **CRITICAL CHECK**: Does message mention Sarah? (should be NO)
- [ ] **CRITICAL CHECK**: Does message say "add a memory"? (should be NO)
- [ ] **PASS CRITERIA**: Generic product message + homepage link

### E. Email (Product Mode)
- [ ] Click "📧 Email" in product sharing section
- [ ] Verify subject: "Create beautiful gift memories with MemoryPop"
- [ ] Verify body talks about MemoryPop as a product
- [ ] **CRITICAL CHECK**: Does body mention Sarah? (should be NO)
- [ ] **CRITICAL CHECK**: Does body say "add a memory" or "contribute"? (should be NO)
- [ ] **PASS CRITERIA**: Product recommendation + homepage link

### F. ShareMenu (Product Mode)
- [ ] Click "More sharing options" in product sharing section
- [ ] Click "Telegram"
- [ ] Verify `text` parameter is product message (not contribution request)
- [ ] Verify `url` parameter is homepage
- [ ] **PASS CRITERIA**: Generic product message, not contribution invite

---

## Test 3: Post-Contribution Growth Action

**URL**: http://localhost:3000/m/test-sharing-verification/contribute

### A. Submit Fictional Contribution
- [ ] Enter name: "Test Contributor"
- [ ] Enter message: "This is a test memory"
- [ ] Click "Add Memory" button
- [ ] Wait for success screen

### B. Verify Growth Action
- [ ] Scroll down on success screen
- [ ] Verify "Want to create your own MemoryPop?" text appears
- [ ] Verify "Create Your Own MemoryPop" link appears
- [ ] Click link
- [ ] Verify redirects to: `http://localhost:3000/` (homepage)
- [ ] **PASS CRITERIA**: Discreet link to homepage after contribution

---

## Test 4: Mobile/Keyboard Behavior

### A. Keyboard Navigation
- [ ] Tab through ShareButtons component
- [ ] Verify focus visible on each button
- [ ] Press Enter on "More sharing options"
- [ ] Verify dropdown opens
- [ ] Press Escape
- [ ] Verify dropdown closes (if implemented)

### B. Touch Targets (Mobile Device or Dev Tools Mobile View)
- [ ] Open in mobile viewport (375px wide)
- [ ] Verify buttons stack vertically on small screens
- [ ] Verify touch targets feel large enough
- [ ] Verify dropdown doesn't overflow screen
- [ ] **PASS CRITERIA**: Usable on mobile viewport

---

## Test 5: Edge Cases

### A. Clipboard Fallback
- [ ] Open browser DevTools → Console
- [ ] Run: `delete navigator.clipboard`
- [ ] Click "Copy Link"
- [ ] Verify still shows "Copied! ✓" (graceful degradation)

### B. Native Share Detection
- [ ] Open browser DevTools → Console
- [ ] Run: `console.log('share' in navigator)`
- [ ] If false: Verify "Share via device" button does NOT appear
- [ ] If true: Verify button appears in dropdown

### C. Special Characters
- [ ] Create gift with recipient name: "José María"
- [ ] Share via WhatsApp
- [ ] Verify special characters encode correctly
- [ ] **PASS CRITERIA**: No broken characters in URL

---

## Critical Validation

### Product Mode Must Pass These Checks:
1. ✅ NO specific recipient name in shareable text
   - Check: WhatsApp message, Email body, Telegram text, Copy message
   - Should say: "someone special" (internal only) or no recipient mention
   - Should NOT say: "Sarah" or actual recipient name

2. ✅ NO contribution request in product sharing
   - Check: All sharing channels in product mode
   - Should NOT say: "add a memory", "contribute", "help celebrate Sarah"
   - Should say: "create beautiful gifts", "share MemoryPop", product-focused

3. ✅ Links to homepage, not specific gift
   - Check: All URLs generated in product mode
   - Should be: `http://localhost:3000`
   - Should NOT be: `/m/test-sharing-verification/contribute` or `/reveal`

---

## Pass/Fail Criteria

### ✅ PASS if:
- All sharing modes generate correct messages
- Product mode has NO placeholder/contribution wording
- Web composers open without requiring apps
- Click-outside and keyboard patterns work
- Product sharing appears in FinalScreen without requiring reaction
- Post-contribution growth action appears and links to homepage

### ❌ FAIL if:
- Product mode mentions specific recipient in shareable text
- Product mode contains contribution request
- Product mode links to gift-specific URLs
- WhatsApp or Email don't open
- Dropdown menu doesn't close on click-outside
- Product sharing requires submitting a reaction

---

## Test Results Template

**Date**: ___________
**Tester**: ___________
**Browser**: ___________
**OS**: ___________

### Summary
- Contributor Mode: [ ] PASS [ ] FAIL
- Product Mode: [ ] PASS [ ] FAIL
- Post-Contribution: [ ] PASS [ ] FAIL
- Mobile/Keyboard: [ ] PASS [ ] FAIL
- Edge Cases: [ ] PASS [ ] FAIL

### Critical Issues Found
```
1.

2.

3.
```

### Notes
```
```

---

**Testing Complete**: ___________
**Overall Result**: [ ] PASS [ ] FAIL

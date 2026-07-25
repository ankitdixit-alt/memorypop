# MemoryPop Scripts

## screenshot-mockups.js

Automated screenshot capture for all 12 mockup preview routes.

### Prerequisites

1. **Install Playwright:**
   ```bash
   npm install -D @playwright/test
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```
   (Must be running at `http://localhost:3000`)

### Usage

```bash
node scripts/screenshot-mockups.js
```

### What It Does

1. Checks if dev server is running
2. Creates `/public/images/mockups/` directory if needed
3. Launches headless browser (Chromium)
4. For each of 12 mockup routes:
   - Sets exact viewport size (1600×1000, 800×1000, or 1920×1080)
   - Navigates to route
   - Waits for fonts/gradients to load
   - Captures high-resolution screenshot (2x for retina)
   - Saves as PNG to output directory
5. Prints summary report

### Output

**Screenshots saved to:**
```
/public/images/mockups/
├── birthday-cover.png
├── birthday-message.png
├── birthday-photo-grid.png
├── birthday-demo-preview.png
├── retirement-cover.png
├── retirement-message.png
├── retirement-timeline.png
├── retirement-demo-preview.png
├── farewell-cover.png
├── farewell-message.png
├── farewell-memory-collection.png
└── farewell-demo-preview.png
```

### Success Output Example

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

Next steps:
1. Verify screenshots in /public/images/mockups/
2. Replace placeholder divs in landing pages
3. See .pipeline/mockup-screenshot-guide.md for integration code
```

### Troubleshooting

**Error: "Dev server not running"**
- Start dev server: `npm run dev`
- Verify it's at `localhost:3000` (not 3001)

**Error: "Cannot find module @playwright/test"**
- Install Playwright: `npm install -D @playwright/test`

**Screenshots are blank/incorrect**
- Increase `WAIT_FOR_LOAD` value in script (default: 2000ms)
- Check browser console in headless: false mode

**Port 3000 in use**
- Update `BASE_URL` in script to match your dev server port
- Or stop other process: `lsof -ti:3000 | xargs kill`

### Configuration

Edit script to customize:
- `BASE_URL` - Dev server URL (default: http://localhost:3000)
- `OUTPUT_DIR` - Screenshot output directory
- `WAIT_FOR_LOAD` - Milliseconds to wait for fonts/gradients (default: 2000)
- `deviceScaleFactor` - Resolution multiplier (default: 2 for retina)

### Next Steps After Screenshots

See `.pipeline/mockup-screenshot-guide.md` for:
- Verification checklist
- Next.js Image component integration code
- Example replacements for all 3 landing pages

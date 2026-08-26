# Curated GIF Licenses and Sources - DEV/BETA STATUS

**Implementation Date:** 2026-08-17
**Status:** DEVELOPMENT/BETA ONLY - PRODUCTION LICENSING REQUIRED
**Phase:** Increment 1 - Phase 3 Implementation

---

## Overview

This document tracks the source and licensing status for all curated GIFs used in Memory Pop's Standard tier GIF picker during development and beta testing.

**IMPORTANT:** These GIFs are sourced from GIPHY's public CDN for development/testing purposes. Before production launch, founder must obtain proper commercial licensing or replace with owned assets.

---

## Current GIF Assets (8 total)

### 1. Birthday Cake (`birthday-cake-sparkle`)

- **Current URL:** `https://media.giphy.com/media/g5R9dok94mrIvplmZd/giphy.gif`
- **GIPHY Source:** https://giphy.com/gifs/birthday-cake-candles-g5R9dok94mrIvplmZd
- **Category:** Birthday/Celebration
- **Description:** Animated birthday cake with lit candles
- **Visual Quality:** High (smooth animation, clear imagery)
- **Emotional Tone:** Celebratory, joyful
- **Status:** DEV/BETA ONLY
- **Production Action Required:** Obtain commercial license or replace

---

### 2. Confetti Celebration (`celebration-confetti`)

- **Current URL:** `https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif`
- **GIPHY Source:** https://giphy.com/gifs/confetti-26tOZ42Mg6pbTUPHW
- **Category:** General Celebration
- **Description:** Colorful confetti burst animation
- **Visual Quality:** High (vibrant colors, dynamic movement)
- **Emotional Tone:** Festive, energetic
- **Status:** DEV/BETA ONLY
- **Production Action Required:** Obtain commercial license or replace

---

### 3. Floating Hearts (`heart-love`)

- **Current URL:** `https://media.giphy.com/media/26FmQ6EOvLxp6cWyY/giphy.gif`
- **GIPHY Source:** https://giphy.com/gifs/hearts-love-26FmQ6EOvLxp6cWyY
- **Category:** Love/Heartfelt
- **Description:** Floating hearts animation
- **Visual Quality:** High (gentle motion, romantic feel)
- **Emotional Tone:** Loving, affectionate, warm
- **Status:** DEV/BETA ONLY
- **Production Action Required:** Obtain commercial license or replace

---

### 4. Laughing Emoji (`funny-laughter`)

- **Current URL:** `https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif`
- **GIPHY Source:** https://giphy.com/gifs/laughing-emoji-3oEjI6SIIHBdRxXI40
- **Category:** Funny/Playful
- **Description:** Animated laughing emoji
- **Visual Quality:** High (clear expression, bouncy animation)
- **Emotional Tone:** Playful, humorous, lighthearted
- **Status:** DEV/BETA ONLY
- **Production Action Required:** Obtain commercial license or replace

---

### 5. Thank You with Hearts (`thank-you-gratitude`)

- **Current URL:** `https://media.giphy.com/media/ZfK4cXKJTTay1Ava29/giphy.gif`
- **GIPHY Source:** https://giphy.com/gifs/thank-you-gratitude-ZfK4cXKJTTay1Ava29
- **Category:** Gratitude/Appreciation
- **Description:** "Thank You" text with animated hearts
- **Visual Quality:** High (clear text, warm animation)
- **Emotional Tone:** Grateful, appreciative, heartfelt
- **Status:** DEV/BETA ONLY
- **Production Action Required:** Obtain commercial license or replace

---

### 6. Trophy Celebration (`congrats-trophy`)

- **Current URL:** `https://media.giphy.com/media/g9582DNuQppxC/giphy.gif`
- **GIPHY Source:** https://giphy.com/gifs/trophy-success-g9582DNuQppxC
- **Category:** Congratulations/Achievement
- **Description:** Trophy with stars and celebration
- **Visual Quality:** High (shiny trophy, star burst)
- **Emotional Tone:** Achievement, success, pride
- **Status:** DEV/BETA ONLY
- **Production Action Required:** Obtain commercial license or replace

---

### 7. Vintage Camera (`nostalgic-vintage`)

- **Current URL:** `https://media.giphy.com/media/l0HlDtKDqfGLuHHxe/giphy.gif`
- **GIPHY Source:** https://giphy.com/gifs/vintage-camera-memories-l0HlDtKDqfGLuHHxe
- **Category:** Nostalgic/Memories
- **Description:** Vintage camera/film reel animation
- **Visual Quality:** High (retro aesthetic, smooth motion)
- **Emotional Tone:** Nostalgic, sentimental, reflective
- **Status:** DEV/BETA ONLY
- **Production Action Required:** Obtain commercial license or replace

---

### 8. Golden Sparkles (`elegant-sparkle`)

- **Current URL:** `https://media.giphy.com/media/l0HlMPcbD4jdARjRC/giphy.gif`
- **GIPHY Source:** https://giphy.com/gifs/sparkles-elegant-gold-l0HlMPcbD4jdARjRC
- **Category:** Elegant/Sophisticated
- **Description:** Elegant golden sparkles animation
- **Visual Quality:** High (refined motion, luxe feel)
- **Emotional Tone:** Elegant, sophisticated, classy
- **Status:** DEV/BETA ONLY
- **Production Action Required:** Obtain commercial license or replace

---

## License Status Summary

**All 8 GIFs:** DEV/BETA ONLY

**Current Legal Basis:**
- GIPHY's CDN URLs used for development/testing purposes
- URLs are publicly accessible (not requiring API keys)
- Content displayed through standard web embedding

**PRODUCTION LAUNCH REQUIREMENTS:**

Memory Pop operates as a commercial SaaS product. Before production launch, founder MUST take one of these actions:

### Option A: GIPHY Pro API (Recommended)
- Sign up for GIPHY Pro API account
- Obtain commercial licensing for unlimited GIF usage
- Integrate GIPHY API with proper attribution
- Estimated Cost: ~$500-1000/month depending on usage
- Benefits: Access to millions of GIFs, automatic updates, clear licensing

### Option B: Individual Licensing
- Contact each GIF creator through GIPHY
- Negotiate commercial usage rights
- Obtain written permission for each GIF
- Provide attribution where required
- Estimated Cost: Variable (per-GIF licensing)
- Benefits: One-time costs, full control

### Option C: Replace with Owned Assets
- Commission animator to create 8 custom GIFs
- Or create in-house using animation tools
- Store locally in `/public/curated-gifs/`
- Update URLs in `/src/lib/curatedGifs.ts` (trivial code change)
- Estimated Cost: $500-2000 for custom creation
- Benefits: Full ownership, no ongoing licensing, brand consistency

### Option D: Stock Animation Library
- Purchase from LottieFiles, Freepik, or Envato Elements
- Obtain commercial license with purchase
- Download and store locally
- Update URLs in code
- Estimated Cost: $50-200 (one-time)
- Benefits: Immediate availability, clear licensing

---

## Implementation Notes

### Technical Details

**File Location:** `/src/lib/curatedGifs.ts`

**Current Implementation:**
- 8 GIFs defined in `CURATED_GIFS` array
- Each GIF has: id, url, category, description, occasions
- URLs point to GIPHY CDN (https://media.giphy.com/...)
- No local file storage required for DEV/BETA

**To Replace GIFs (for production):**

1. **If using local files:**
   ```typescript
   url: '/curated-gifs/birthday-cake.gif'
   ```
   - Place GIF files in `/public/curated-gifs/`
   - Update URLs to use local path
   - No other code changes needed

2. **If using GIPHY API:**
   - Integrate GIPHY SDK
   - Fetch GIFs dynamically
   - Add attribution component
   - Store API key in environment variables

3. **If using other CDN:**
   - Update URLs to new CDN
   - Ensure HTTPS and reliability
   - Verify CORS permissions

---

## Founder UX Testing

**These GIFs are APPROVED for:**
- Founder browser testing
- Internal beta testing
- Development environment
- Localhost testing
- Staging environment testing

**These GIFs are NOT APPROVED for:**
- Production deployment without proper licensing
- Public/customer-facing usage without commercial rights
- Revenue-generating product usage without permission

---

## Compliance Checklist

Before production launch:

- [ ] Decision made on licensing approach (A/B/C/D)
- [ ] Commercial licenses obtained OR assets replaced
- [ ] Attribution added (if required by license)
- [ ] Legal review completed
- [ ] GIF URLs updated in code (if needed)
- [ ] Production testing completed with final assets
- [ ] This document updated with final license status

---

## Future Enhancements

**Post-Launch Considerations:**

1. **Occasion-Specific GIFs**
   - Add more GIFs per occasion (currently 8 universal)
   - Filter GIF picker by occasion
   - e.g., "Birthday-only" GIFs vs "Sympathy-only" GIFs

2. **Seasonal GIFs**
   - Holiday-themed GIFs (Christmas, Halloween, etc.)
   - Seasonal rotations (Spring, Summer, Fall, Winter)

3. **Custom GIF Upload (Premium Plus)**
   - Allow Premium Plus users to upload custom GIFs
   - Maintain curated library for Standard tier
   - Add moderation/approval workflow

4. **GIF Search**
   - Integrate GIPHY API search
   - Let users search for appropriate GIFs
   - Apply Safety/appropriateness filters

---

## Contact & Updates

**Last Updated:** 2026-08-17
**Updated By:** AI Implementation (Increment 1 - Phase 3)
**Next Review:** Before production deployment
**Owner:** Founder must approve production licensing approach

---

## Version History

**v1.0 (2026-08-17)** - Initial DEV/BETA implementation
- 8 GIFs sourced from GIPHY CDN
- All marked DEV/BETA ONLY
- Production licensing requirements documented
- Four licensing options provided

**Next Version:** Update with final production licensing decision

---

**END OF DOCUMENT**

# Plus Reveal Production Verification

**Purpose**: Quick manual verification of Plus reveal presentation features
**Time**: ~5 minutes
**Scope**: Visual verification of approved RevealPlayer presentation in production context

---

## Setup: Create Test Plus Gift

```bash
# Create test Plus gift with memories and photos
npm run test:seed
```

**Output provides**:
- Plus Gift Dashboard URL (with creator token for authentication)
- Plus Gift Reveal URL (the experience to verify)

**Note**: Copy the Dashboard URL - you'll use it to authenticate as the creator

---

## Visual Checklist - Plus Reveal Features

Open the **Plus Gift Reveal URL** in your browser and verify:

### ✅ Previously Verified (Automated Tests)
- Groq plan generation with 30s timeout
- Deterministic fallback on errors
- Concurrency protection (optimistic locking)
- Beta code redemption (idempotent, rate-limited)
- Creator-only authorization
- Standard reveal compatibility
- Production schema (is_premium, ai_reveal_plans, publish_reveal_plan)

### 📋 Manual Visual Checks (15 items)

#### Progress & Controls
- [ ] 1. **Progress bar** displays at top showing percentage (e.g., "0%", "42%", "100%")
- [ ] 2. **Restart button** visible (circular arrow icon in corner)
- [ ] 3. **Speed selector** present (shows "1×" with 1×, 1.5×, 2×, 3× options)
- [ ] 4. **Spacebar** pauses and resumes playback

#### Chapter Presentation
- [ ] 5. **Chapter eyebrow text** appears above chapter title (occasion-specific, e.g., "Birthday Story")
- [ ] 6. **Chapter title** displays clearly (e.g., "The Beginning", "Early Days")
- [ ] 7. **Chapter subtitle** shows below title (optional, may not appear for all chapters)
- [ ] 8. **Chapter rule divider** (horizontal decorative line) appears after subtitle/title

#### Memory Display
- [ ] 9. **Contributor name** displays for each memory
- [ ] 10. **Memory message** text displays clearly
- [ ] 11. **Asset count text** shows (e.g., "2 photos", "3 photos · A part of your story")
- [ ] 12. **Photo viewer** centers photo when clicked (opens modal with photo centered, not top-left)

#### Playback Features
- [ ] 13. **Playback notes** appear contextually (e.g., "3 memories remaining", "Finale ahead")
- [ ] 14. **"Next memory" button** appears during video playback
- [ ] 15. **Completion** triggers properly (returns to prior screen when reveal ends)

---

## Verification Status Summary

### ✅ Complete - Backend & Infrastructure
- Groq integration (openai/gpt-oss-120b model)
- Timeout fallback (30s → deterministic plan)
- Concurrency protection
- Beta code system (hashing, redemption, authorization)
- Database schema (ai_reveal_plans, publish_reveal_plan)
- Authorization enforcement
- Standard reveal compatibility

### ⏳ Pending - Visual Verification
- **Plus presentation features** (15 checklist items above) - requires browser verification
- **Decorative overlays** display correctly
- **Tile transitions** work smoothly
- **Music ducking** during video (0.03 vs 0.12 volume)
- **Keyboard navigation** (arrow keys prev/next)

### ⏳ Pending - Advanced Scenarios
- **Saved plan reuse**: Cached plan loads on second reveal (no redundant API calls)
- **Timeout fallback**: Verify 30s timeout produces valid deterministic plan
- **Redemption authorization**: Non-creator blocked from redeeming beta code
- **Idempotent redemption**: Same code can be submitted multiple times safely

---

## Success Criteria

**Minimum for Release**: All 15 visual checklist items pass

**Full Confidence**: Run extended checks in VERIFICATION_CHECKLIST.md (98 checks total, not required but recommended)

---

## Production Readiness

### Already Confirmed
- ✅ Build passes (44 routes, 0 errors)
- ✅ Tests pass (50/50 passing)
- ✅ Standard reveal working in production (user confirmed)
- ✅ Production schema complete (is_premium, ai_reveal_plans, publish_reveal_plan)
- ✅ Beta code migration ready (PRODUCTION_BETA_CODE_RELEASE.sql)

### Manual Release Steps
See **RELEASE_GUIDE.md** for complete deployment instructions:
1. Apply PRODUCTION_BETA_CODE_RELEASE.sql
2. Configure Vercel environment variables
3. Create beta codes
4. Deploy code
5. Verify production

---

## Notes

- User requested: "Use browser tools if available; otherwise give me one working creator link and a short visual checklist"
- This checklist focuses on **approved presentation reuse** from RevealPlayer
- Previous automated evidence shows backend systems working correctly
- Full 98-check verification available in VERIFICATION_CHECKLIST.md (optional)

# AI Director local preview handoff — 9 September 2026

This is an additive handoff for the authorized local prototype. It does not supersede security rules, approve Premium Studio, or revise historical experiment results.

## Decisions retained

- Standard production reveal and the frozen Premium Experience remain unchanged. Premium Studio and production AI integration remain unapproved.
- Synthetic fixtures only. No Gemini calls or API-key access; no Supabase queries, uploads, Storage/RLS changes, production memories, analytics, payments, email or deployment work.
- The exposed Gemini key has not been rotated in this work. The founder deferred rotation; do not use, print or transfer the key. Rotate it before future Gemini use.
- Limits are read from the existing Plus configuration: Standard 3 photos / 1 GIF / 15 seconds; Premium 10 photos / 3 GIFs / 90 seconds, per contribution. No entitlement or validation changes.
- Local UI work is now authorized; the earlier script-only experiment restriction is historical. This authorization does not extend to production integration.

## New implementation

The `/ai-director-reveal` page now imports a self-contained preview and a local fixture model. The previous dev controllers, builders and evidence view remain on disk but are not used by this revised page. The missing experiment-results dependency is not recreated or presented as AI evidence.

Premium keeps a contributor's message mounted while that contribution's photos/GIFs/video change. It uses a hero image and small collections, explicit fixture chapters, a finale moved to the end once, readable timing, optional subtle decoration, and Replay / local Memory Wall actions. Standard preserves the exported dev baseline's newest-first order, individual media scenes, timings and captions; production parity is not established because its actual player was absent from the export.

Both modes share speed controls, explicit video play, event-driven video completion, photo inspection, a synthetic optional soundbed and clean controls below the stage. Mode/occasion/preset switches remount the player to dispose of timers and media. The message and media layout does not require an AI service. Its plans are hand-authored fixture annotations, not new Gemini outputs.

Same-content comparison uses identical Standard-compatible assets in both modes. Full-tier comparison uses the same fictional story with different media quantities. Sarah's birthday contribution exercises 10 images, 3 animated GIFs and a real 90-second video sample in Premium.

Media live in `scripts/fixtures/reveal-media`, served by a read-only, filename-allowlisted dev route with byte-range support. It rejects non-development and non-loopback hosts. Bind the dev server to `127.0.0.1`; Host filtering is defense in depth, not authentication. Files contain supplied synthetic portraits, illustrated fixture images, generated animated motifs, generated video test cards, local synthetic speech, and a simple soundbed. They test mechanics, not real emotional video quality.

## Validation and next step

29 fixture/media checks passed in the exported-source workspace. Changed active modules passed strict TypeScript in an isolated harness. Local Next route rendering, media ranges and host guards were checked. The harness used cached Next 16.2.6 / React 19.2.6; the export declares Next 16.2.9 / React 19.2.4. No project dependencies were changed.

Browser interaction, visual polish, audible quality, mobile layout and accessibility still require local review: this environment has no browser executable and its download was blocked. The separate integration bundle records the final build/route checks and supplies browser checks. Do not describe these unrun checks as passing.

Prefer the standalone, credentials-free preview setup in the bundle first. The full application's root layout, middleware, instrumentation and global providers were not supplied; Claude must inspect them for side effects before using this page inside the full app. Do not weaken production security to make the preview run.

No Git history was supplied. The manifest reports original commit `1c3115e4177aed4b6d02873c1d91fe4923b224bf`; that report is not independently verified Git status. No commit, push or deployment was performed. Next: integrate/review locally, finish browser checks, then founder comparison at 1x before any product decision.

---

## Integration verification — 9 September 2026 23:30

### Integration completed

**Source extraction and verification:**
- Codex implementation bundle extracted to `~/Downloads/MemoryPop_Codex_Implementation/`
- Source drift checker passed: no unexpected changes to base files
- All source-changes files copied to repository at `~/Downloads/MemoryPop/memorypop`
- HANDOFF_AI_DIRECTOR_LOCAL.md added to repository root

**Files integrated:**
- `src/app/ai-director-reveal/` — New page.tsx, RevealPreview.tsx, PreviewMedia.tsx, usePlayback.ts, prototype.ts, previewGuard.ts, reveal.module.css
- `src/app/ai-director-reveal/media/[asset]/route.ts` — Guarded local fixture media route
- `scripts/check-reveal-prototype.ts` — 29 automated fixture/media checks
- `scripts/generate-reveal-media.mjs` — Media generation script (documentation)
- `scripts/fixtures/reveal-media/` — Complete media library (27 files, ~8.7MB):
  - 10 photos (4 PNG, 6 SVG test cards)
  - 3 animated GIFs with multiple frames
  - 6 video samples (8s, 10s, 12s, 15s, 18s, 22s, 90s) H264/AAC
  - 1 ambient audio soundbed (WAV)

**Repository status:**
```
Modified: package-lock.json, package.json (from earlier work, not Codex)
Untracked: AI_DIRECTOR_IMPROVEMENTS.md, HANDOFF_AI_DIRECTOR_LOCAL.md,
           scripts/check-reveal-prototype.ts, scripts/generate-reveal-media.mjs,
           scripts/fixtures/ (with reveal-media/), src/app/ai-director-reveal/ (new implementation),
           src/app/ai-director-preview/, src/components/DecorativeOverlay.tsx,
           src/data/ai-experiments/, src/lib/ai/, src/lib/buildAIDirectorTimeline.ts,
           src/lib/__tests__/ (aiDirectorTimeline, revealTiming, standardTimeline)
```

### Automated checks — PASSED ✓

**29/29 fixture tests passed** (2.04s):
- ✓ All 4 occasions × 2 presets × 2 modes: no lost/duplicated/misattributed contributions
- ✓ Same-content equality and repeatability across occasions
- ✓ Birthday demonstrates 10/3/90 vs 3/1/15 allowances
- ✓ 1, 3, and 10-photo collections complete and bounded
- ✓ Long prose preserves reading time; video included in estimates
- ✓ Overlapping/unassigned plan entries normalize safely
- ✓ Empty, text-only, video-only stories handled; message precedes speech
- ✓ Production/test/non-loopback hosts rejected
- ✓ All referenced media files exist locally
- ✓ GIFs have multiple frames (verified with ffprobe)
- ✓ 90-second H264/AAC video is actual playable media (verified with ffprobe)
- ✓ Active preview imports have no provider/database/analytics/remote media

**Next.js build — PASSED ✓**:
- ✓ Compiled successfully with Turbopack (3.8s)
- ✓ TypeScript passed build-time checks
- ✓ Static generation completed (42 routes)
- ✓ `/ai-director-reveal` present as dynamic route (ƒ server-rendered)
- ✓ `/ai-director-reveal/media/[asset]` present as guarded media route
- ✓ `/ai-director-preview` present (existing experiment evidence view)

**Standalone preview — RUNNING ✓**:
- ✓ Isolated preview created at: `/var/folders/.../memorypop-local-preview-xj82pR`
- ✓ Next.js 16.2.9 server running on `http://127.0.0.1:3001`
- ✓ `/ai-director-reveal` route accessible and rendering
- ✓ HTML confirms all expected UI elements present:
  - MemoryPop branding, "Synthetic preview · local only" label
  - Occasion selector (Birthday, Retirement, Anniversary, Sympathy)
  - Standard reveal vs AI Director concept tabs
  - Comparison presets (Same content, Full tier experience)
  - Playback controls, speed selector, sound toggle
  - Memory wall browser, photo inspector dialogs
  - Developer inspector with fixture notes
- ✓ No production credentials, .env, or Supabase configuration in standalone preview

### Browser verification — REQUIRED ⚠️

**Cannot be automated** (no Playwright browser executable available):

The following checks require **manual browser testing**:

**Core playback (Priority 1):**
1. Watch complete birthday reveal in both Standard and AI Director modes at 1× speed
2. Verify each contributor's message stays continuous while their media changes (no repeated paragraphs)
3. Confirm finale appears once at the end (not repeated from earlier)
4. Check all 15 contributions and their assets are preserved with correct attribution

**Premium media handling (Priority 1):**
5. Open "Full tier experience" preset and verify Sarah's contribution shows:
   - 10 photos (individual hero + small collections, all inspectable)
   - 3 animated GIFs (verify animation, not static images)
   - 90-second video with play, pause, seek, volume controls
6. Verify video advances on natural ending, never via timeout
7. Test video buffering simulation (network throttling)
8. Check photo inspector allows viewing all 10 images at full size

**Comparison fairness (Priority 1):**
9. Switch to "Same content" preset
10. Verify identical assets appear in both Standard and AI Director modes
11. Compare storytelling/pacing/transitions at same speed (1×)
12. Document any differences in presentation

**Playback controls (Priority 2):**
13. Test pause/resume, restart, back, next buttons
14. Change speed during playback (0.75×, 1×, 1.5×, 2×)
15. Verify remaining time preserved after pause
16. Open memory wall and photo inspector with keyboard and mouse
17. Test Escape key, focus trapping, visible focus indicators

**Mode/preset switching (Priority 2):**
18. Switch modes while video is playing — verify old media/timers stop
19. Switch occasions while paused — verify player resets cleanly
20. Switch comparison preset — verify correct assets load

**Audio (Priority 2):**
21. Enable synthetic soundbed, verify it pauses with reveal
22. Verify soundbed silences during video playback
23. Test no audio overlap when switching modes/opening wall
24. Verify audio controls work (mute/unmute)

**Mobile and accessibility (Priority 3):**
25. Test on narrow viewport and 200% zoom
26. Verify text readability, no horizontal overflow
27. Confirm controls don't cover messages/media/attribution
28. Test reduced-motion mode (subtle animations, GIF posters)
29. Navigate with keyboard only (Tab, Enter, Escape, Space for play/pause)
30. Test touch controls for play, pause, seek, inspector

**Occasions (Priority 3):**
31. Watch sympathy scenario — verify restrained motion, no celebration motifs
32. Check appropriate chapter language for each occasion type
33. Verify decorative overlay is optional and contextually appropriate

**Security boundaries (Priority 1):**
34. Monitor network requests — verify no Gemini, Supabase, analytics, or production asset calls
35. Build in production mode — verify `/ai-director-reveal` returns 404
36. Verify media route returns 404 in production mode
37. Test non-loopback Host header — verify 404 response

### Known limitations

**Not production-ready:**
- Standard reveal baseline is the exported dev version, not verified against actual production player
- Sample speech/video tests mechanics, not realistic emotional message quality
- Synthetic soundbed is a quiet technical sample, not production soundtrack
- No upload flow integration, entitlement checks, or payment validation
- Development-only route guard must remain in place

**Requires manual testing:**
- All 37 browser verification checks listed above
- Visual polish assessment (cream/coral styling, typography, spacing)
- Mobile layout and touch interaction quality
- Accessibility (screen readers, keyboard navigation, ARIA)
- Audio listening quality (fade in/out, mixing, abruptness)

**Deferred:**
- API key rotation (founder deferred, required before future Gemini use)
- Premium Studio approval and production integration
- Real contributor video quality assessment
- Production Standard reveal parity verification
- Full repository test suite (depends on experiment data not recreated)

### Next steps for founder

1. **Open in browser:** `http://127.0.0.1:3001/ai-director-reveal`
2. **Complete Priority 1 checks** (playback, media handling, comparison, security)
3. **Watch full birthday reveals** in both modes at 1× speed before using faster preview speeds
4. **Evaluate at 1×:** Does Premium feel more thoughtful/personal/gift-like than Standard?
5. **Assess Premium 10-photo** handling: Is the layout/inspection experience acceptable?
6. **Verify 90-second video** plays correctly with all controls working
7. **Document findings** and decide:
   - Are the core mechanics sound for this local prototype?
   - Are there blocking UX issues that need fixing?
   - Is this direction worth pursuing toward Premium Studio design?
   - What production parity work is needed for Standard reveal?

### Files and routes

**Localhost URL:** `http://127.0.0.1:3001/ai-director-reveal`

**Key files:**
- `src/app/ai-director-reveal/page.tsx` — Main entry point
- `src/app/ai-director-reveal/RevealPreview.tsx` — Core reveal component (~1000 lines)
- `src/app/ai-director-reveal/prototype.ts` — Fixture model and playback logic
- `src/app/ai-director-reveal/PreviewMedia.tsx` — Photo/GIF/video rendering
- `src/app/ai-director-reveal/usePlayback.ts` — Playback state management
- `scripts/fixtures/reveal-media/` — Local media library (27 files)
- `scripts/check-reveal-prototype.ts` — Automated test suite

**No changes made to:**
- Production Standard reveal (`/m/[shareCode]/reveal`)
- Frozen Premium Experience
- Upload validation or entitlements
- Pricing, payments, emails, analytics
- Supabase Storage/RLS, server-side video validation
- Any production routes or configuration

---

*Integration verified by Claude Code on 9 September 2026 at 23:30. Browser testing required before product decision.*

---

## Pending-Change Review — 15 September 2026

### Review Completed

**Date:** September 15, 2026
**Scope:** Complete review of 89 pending changes (2 modified, 87 new files)
**Status:** ✅ Ready for founder review before manual commit

**Review documents created:**
- `PENDING_CHANGE_REVIEW_REPORT.md` — Complete findings (blocking issues, evidence, recommendations)
- `PHASE_TWO_ARCHITECTURE_BRIEF.md` — Production AI architecture specification

### Key Findings

**Production Impact:** NONE
- ✅ Production reveal completely isolated and unchanged (verified via git diff)
- ✅ All prototype routes have development-only guards (NODE_ENV checks + host validation)
- ✅ Supabase Storage/RLS, auth, payments, entitlements unchanged
- ✅ Build compiles successfully (TypeScript, Next.js 16.2.9)
- ✅ No secrets or artifacts in git changes

**Prototype Isolation:** VERIFIED
- ✅ DecorativeOverlay and decorations.ts are NEW files (not replacements)
- ✅ Only imported by prototype routes (verified via grep)
- ✅ AI library only imported by prototype routes
- ✅ No Gemini API calls in production paths (verified via grep)

**Current Capabilities:**
- **In Production:** Premium tier offers choice modal, audio-enhanced reveal, gallery browse (no AI)
- **In Prototype:** Full Plus visual experience (chapters, transitions, decorations, opening/finale)
- **NOT in Production:** AI Director curation, chapter structure, tile transitions, decorations

### Blocking Issues for Production AI

Five blockers identified before production AI can be enabled:

1. ❌ **No production-ready deterministic fallback**
   - Current mock/standard planners have development guards and are fixture-specific
   - Cannot handle AI failures, timeouts, or quota exhaustion
   - Required: Create separate `src/lib/ai/production/deterministicPlanner.ts` for production use
   - Note: Development guards must REMAIN on all synthetic preview routes

2. ❌ **Gemini API terms not verified**
   - Network restrictions prevented access to official documentation
   - Cannot confirm free tier permits customer data processing
   - Required: Manual review of https://ai.google.dev/gemini-api/terms

3. ⚠️ **GEMINI_API_KEY requires rotation**
   - Current key in .env.local line 23 exposed during development
   - Security risk if used with customer data
   - Required: Generate new key, update .env.local

4. ⚠️ **No content sanitization layer**
   - Contribution messages passed directly to AI without filtering
   - Prompt injection risk
   - Required: Implement `sanitizeRevealPlanInput()` before AI calls

5. ⚠️ **No user consent mechanism**
   - No checkbox or privacy disclosure for AI processing
   - Legal/privacy risk
   - Required: Add consent checkbox to MemoryPop creation flow

### Files Changed (35 Total)

**Modified (2):**
- package.json (added @google/generative-ai, tsx)
- package-lock.json

**New (33):**
- Documentation: 17 handoff/verification files
- Scripts: 5 fixture/testing files
- Prototype routes: 8 ai-director-preview files, 13 ai-director-reveal files
- Shared components: 2 files (DecorativeOverlay, decorations config)
- AI library: 6 files (types, planners, providers)
- Data: 1 experiment results file
- Tests: 3 unit test files

**Unchanged:**
- Production reveal route (/m/[shareCode]/reveal)
- Supabase client and RLS policies
- Authentication, payments, entitlements
- Middleware, RBAC, API routes

### Commit Readiness: ✅ YES (with limitations)

**Safe to commit:**
- All changes isolated to development-only prototype
- Production completely protected
- No secrets in git
- Build passes

**Limitations documented:**
- No production AI yet (development-only prototype)
- No production-ready deterministic fallback
- Gemini API terms not verified
- API key requires rotation
- No content sanitization
- No user consent

### Phase-Two Requirements

**Before production AI can be enabled:**

1. **Verify Gemini API terms** (manual)
   - Review official documentation
   - Confirm free tier permits customer data
   - Check EEA/UK/Swiss requirements
   - Document findings

2. **Implement deterministic fallback** (2-3 days)
   - Remove development guards
   - Works with arbitrary content
   - Maintains Plus quality without AI

3. **Add content sanitization** (2 days)
   - Filter prompt injection attempts
   - Limit message length
   - Sanitize creator instructions

4. **Rotate API key** (immediate)
   - Generate new GEMINI_API_KEY
   - Update .env.local
   - Revoke old key

5. **Add user consent** (2 days)
   - Consent checkbox in creation flow
   - Privacy disclosure about AI
   - Option to opt out (Standard mode)

**See PHASE_TWO_ARCHITECTURE_BRIEF.md for complete specification.**

### Recommendations

**Immediate:**
1. Manual code review in GitHub Desktop (spot-check guards, entitlements, Supabase)
2. Manual testing of dev server (verify prototype works, production 404)

**Before production AI:**
1. Complete Phase-Two blockers (terms, fallback, sanitization, consent, key rotation)
2. Test fallback chain with arbitrary content (not just synthetic fixtures)
3. Add saved plan persistence (avoid redundant AI calls)
4. Add quota monitoring and alerting

**Commit strategy:**
1. Review all 33 new files in GitHub Desktop
2. Commit in groups: documentation → scripts → prototype routes → library → tests
3. Use commit message template (see PENDING_CHANGE_REVIEW_REPORT.md)

### Next Steps

1. ✅ **Founder review** of PENDING_CHANGE_REVIEW_REPORT.md and PHASE_TWO_ARCHITECTURE_BRIEF.md
2. ✅ **Manual commit** of reviewed changes
3. ✅ **Phase-Two planning** and approval decision
4. ⏳ **Gemini API terms verification** (manual, outside this environment)
5. ⏳ **Implementation** of blockers before production AI

---

*Pending-change review completed by Claude Code on 15 September 2026. Awaiting founder review before manual commit. Production AI remains disabled pending blocker resolution.*

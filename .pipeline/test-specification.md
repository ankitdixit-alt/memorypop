# Demo Polish Pass - Test Specification

## Testing Scope

Validate the complete demo experience with focus on:
1. Emotional journey flow
2. Premium transformation quality
3. Animation behavior
4. Accessibility compliance
5. Cross-browser compatibility
6. Mobile responsiveness
7. Performance metrics

## Test Categories

### 1. Happy Path - Emotional Journey

**Scenario**: First-time visitor experiences full demo

Test cases:
- [ ] Welcome section loads with smooth fade-in
- [ ] Scroll to Cover section triggers smooth transition
- [ ] Toggle Premium on/off shows smooth in-place transformation
- [ ] Messages appear with staggered reveal (150ms delay)
- [ ] Photos load with coordinated fade-in (80ms stagger)
- [ ] Recipient Reaction appears as emotional peak
- [ ] Creator Perspective shows simple 3-step process
- [ ] CTA section appears as natural conclusion
- [ ] No competing CTAs before final section
- [ ] Journey feels continuous (no jarring transitions)

**Success Criteria**:
- User reaches CTA thinking "I know who I want to create one for"
- No confusion about Premium vs Standard
- All sections visible without manual intervention
- Emotional arc builds to Recipient Reaction

### 2. Premium Transformation

**Scenario**: User toggles between Standard and Premium

Test cases:
- [ ] Toggle button responds immediately
- [ ] Cover section transforms smoothly (500ms)
  - [ ] Badge changes: 🎂 Birthday → ✨ Premium
  - [ ] Headline size increases (28px → 34px on mobile)
  - [ ] Avatars enlarge with gold borders
  - [ ] Subtle glow appears
- [ ] Messages transform smoothly
  - [ ] Padding increases (p-6 → p-8)
  - [ ] Typography enhances (line-height 1.75, letter-spacing 0.02em)
  - [ ] Subtle quote marks appear
  - [ ] Shadow deepens (shadow-md → shadow-xl)
- [ ] Photos transform smoothly
  - [ ] White borders appear (8px mat-board effect)
  - [ ] Gaps increase (gap-3 → gap-6)
  - [ ] Captions become visible
- [ ] Premium Toggle section updates description
- [ ] All transformations feel like same celebration elevated

**Success Criteria**:
- Premium feels calmer, richer, elegant (NOT noisy)
- User sees natural evolution, not different product
- No flickering or layout shift during transformation
- All transitions complete smoothly

### 3. Animation Behavior

**Scenario**: Animations guide emotional flow

Test cases:
- [ ] WelcomeSection: fade-up (600ms, threshold 0.3)
- [ ] CoverSection: smooth Premium toggle (500ms)
- [ ] MessagesSection: staggered cards (150ms delay, threshold 0.1)
- [ ] PhotosSection: fade + scale (80ms stagger, threshold 0.1)
- [ ] RecipientReactionSection: sequence (100-500ms delays, threshold 0.2)
- [ ] CreatorPerspectiveSection: stagger (150ms delay, threshold 0.2)
- [ ] CtaSection: coordinated sequence (150-500ms delays, threshold 0.3)
- [ ] All animations trigger on scroll into view
- [ ] Animations complete before next section scrolls in
- [ ] No animation overload or distraction

**Success Criteria**:
- Every animation serves emotional flow
- Timing feels natural (not too fast, not too slow)
- Scroll triggers feel responsive
- No janky or stuttering animations

### 4. Accessibility

**Scenario**: Users with accessibility needs

Test cases:
- [ ] prefers-reduced-motion: disable detected correctly
- [ ] WelcomeSection: animations bypass when reduced motion
- [ ] RecipientReactionSection: content visible immediately
- [ ] All content visible without animations
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible on toggle buttons
- [ ] Screen reader announces sections correctly
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets ≥ 44x44px on mobile

**Success Criteria**:
- Zero functionality requires animation
- All users can complete journey
- WCAG 2.1 AA compliance

### 5. Browser Compatibility

**Scenario**: Demo works across browsers

Test browsers:
- [ ] Chrome/Edge (Chromium) - latest
- [ ] Firefox - latest
- [ ] Safari - latest (macOS)
- [ ] Safari - latest (iOS)

Test cases per browser:
- [ ] Intersection Observer API works
- [ ] CSS transitions smooth
- [ ] Gradients render correctly
- [ ] Typography renders consistently
- [ ] Animations perform smoothly
- [ ] Toggle button works
- [ ] Links navigate correctly

**Success Criteria**:
- Consistent experience across browsers
- No major visual regressions
- Animations smooth on all platforms

### 6. Mobile Responsiveness

**Scenario**: Demo on mobile devices

Test viewports:
- [ ] iPhone SE (375px) - minimum width
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 12/13/14 Pro Max (428px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)

Test cases:
- [ ] Welcome headline readable (4xl → 5xl breakpoint)
- [ ] Cover stats stack correctly
- [ ] Messages cards full-width with proper padding
- [ ] Photos grid: 2 columns mobile, 3 desktop
- [ ] Toggle buttons accessible size
- [ ] Recipient photo appropriate size (h-80 mobile)
- [ ] Creator steps stack on mobile
- [ ] CTA button accessible size
- [ ] No horizontal scroll
- [ ] Typography scales appropriately

**Success Criteria**:
- All content readable at 375px
- Touch targets ≥ 44x44px
- No layout breaks
- Smooth scrolling

### 7. Performance

**Scenario**: Demo loads and performs well

Test metrics:
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 3.8s

Test cases:
- [ ] Initial load time acceptable
- [ ] Scroll performance smooth (60fps)
- [ ] Animation performance smooth
- [ ] No layout shift during load
- [ ] Images optimized (if real images added)
- [ ] No memory leaks from observers

**Success Criteria**:
- Core Web Vitals pass
- Smooth 60fps scroll
- No janky animations
- Fast interactive

### 8. Edge Cases

**Scenario**: Unusual situations

Test cases:
- [ ] Very slow network (3G simulation)
- [ ] Rapid toggle between Premium/Standard
- [ ] Rapid scrolling up and down
- [ ] Scroll to bottom then back to top
- [ ] Browser window resize during use
- [ ] Back button after navigation
- [ ] Direct link to /demo
- [ ] Missing reaction data (graceful fallback)

**Success Criteria**:
- No crashes or errors
- Graceful degradation
- State consistency maintained
- User can recover from any edge case

### 9. Regression Testing

**Scenario**: Verify no breaks in existing functionality

Test cases:
- [ ] Analytics tracking fires correctly
  - [ ] demo_viewed on mount
  - [ ] demo_premium_toggled on toggle
  - [ ] demo_see_more_clicked on expand
  - [ ] demo_scroll_depth at 25%, 50%, 75%, 100%
  - [ ] demo_completed at 100% scroll
  - [ ] demo_cta_clicked on final CTA
- [ ] Links navigate correctly
  - [ ] CTA → /create?occasion=birthday
- [ ] Data displays correctly
  - [ ] Stats: 42 contributors, 38 messages, 64 photos
  - [ ] Recipient: Emma, age 30
  - [ ] Creator: Sarah
- [ ] Message expansion works
  - [ ] "See X more memories" button shows
  - [ ] Expands to full messages on click
  - [ ] Tracks expansion event

**Success Criteria**:
- All existing functionality intact
- No analytics breaks
- Data displays correctly
- Navigation works

## Testing Environment

- **Local**: http://localhost:3000/demo
- **Production**: (if deployed)
- **Device Lab**: Physical devices if available
- **Browser DevTools**: Lighthouse, Performance, Coverage

## Testing Tools

- Chrome DevTools (Lighthouse, Performance)
- Firefox DevTools
- Safari Web Inspector
- React DevTools
- Manual testing
- Accessibility audits (axe, Lighthouse)

## Pass/Fail Criteria

**Pass**: All critical test cases pass, no blockers
**Revise**: Some test cases fail, fixable issues
**Block**: Critical failures, requires implementation changes

## Test Execution

Run all test categories systematically. Document findings in `.pipeline/tests.md`.

**Focus**: Validate emotional journey quality, not just technical correctness.

---

Test Spec Version: 1.0
Created: 2026-07-27
Purpose: Demo Polish Pass Testing

# Demo Polish Pass - 7-Day Monitoring Checklist

## Purpose

Validate whether the demo achieves its intended goal: **Visitors finish thinking "I know exactly who I want to create one for"** rather than "That was a nice demo."

**Data-Driven Focus**: Observe real user behavior, not opinions.

---

## Daily Monitoring (Days 1-7)

### Day 1: Launch Day

**Critical Metrics**:
- [ ] Demo page loads without errors (check error logs)
- [ ] All analytics events firing correctly
- [ ] No console errors reported
- [ ] Performance within acceptable range

**Analytics Snapshot**:
- Total demo views: _____
- Completion rate (100% scroll): _____%
- CTA click rate: _____%
- Average time on demo: _____ seconds
- Premium toggles: _____ (avg per session: _____)

**Issues/Anomalies**:
- Any errors: _____
- Any unexpected behavior: _____
- Any user feedback: _____

---

### Day 2-3: Early Patterns

**Focus**: Engagement patterns emerging

**Metrics to Track**:
- [ ] Demo completion rate stabilizing
- [ ] CTA conversion rate trend
- [ ] Scroll depth distribution (where drop-offs occur)
- [ ] Premium toggle usage pattern
- [ ] Message expansion rate

**Questions to Answer**:
1. What % reach Recipient Reaction section? _____
2. What % click CTA after reaching end? _____
3. Do users toggle Premium? (% sessions with toggle: _____)
4. Average toggles per session: _____
5. Do users expand messages? _____

**Behavioral Observations**:
- Bounce rate: _____%
- Average session duration: _____ seconds
- Scroll velocity (fast scrollers vs slow readers): _____

---

### Day 4-5: Mid-Week Analysis

**Focus**: Pattern validation

**Conversion Funnel**:
- Demo viewed: 100%
- 25% scroll depth: _____%
- 50% scroll depth: _____%
- 75% scroll depth: _____%
- 100% scroll depth (completed): _____%
- CTA clicked: _____%

**Premium Engagement**:
- % sessions with Premium toggle: _____%
- Average toggles per session: _____
- Toggle timing (early vs late): _____
- Standard → Premium: _____%
- Premium → Standard: _____%

**Drop-Off Analysis**:
- Largest drop-off point: _____ (section)
- Second largest: _____ (section)
- Hypothesis why: _____

---

### Day 6-7: Week Summary

**Focus**: Full week behavior patterns

**Goal Achievement Indicators**:
1. **Completion Rate** (100% scroll): _____%
   - Target: >60% (strong engagement)
   - Result: [PASS / NEEDS IMPROVEMENT]

2. **CTA Click Rate** (of completers): _____%
   - Target: >40% (strong intent)
   - Result: [PASS / NEEDS IMPROVEMENT]

3. **Time on Demo**: _____ seconds average
   - Target: >60s (reading content)
   - Result: [PASS / NEEDS IMPROVEMENT]

4. **Premium Toggle Rate**: _____%
   - Target: >50% (curiosity about upgrade)
   - Result: [PASS / NEEDS IMPROVEMENT]

5. **Message Expansion Rate**: _____%
   - Target: >30% (engaged with content)
   - Result: [PASS / NEEDS IMPROVEMENT]

---

## Analytics Events Monitoring

### Event Volume (Daily)

**Track each event**:

| Event | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 | Total |
|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| demo_viewed | | | | | | | | |
| demo_scroll_depth_25 | | | | | | | | |
| demo_scroll_depth_50 | | | | | | | | |
| demo_scroll_depth_75 | | | | | | | | |
| demo_scroll_depth_100 | | | | | | | | |
| demo_premium_toggled | | | | | | | | |
| demo_see_more_clicked | | | | | | | | |
| demo_completed | | | | | | | | |
| demo_cta_clicked | | | | | | | | |

**Event Ratios** (Week Average):
- Scroll 25% / Viewed: _____%
- Scroll 50% / Viewed: _____%
- Scroll 75% / Viewed: _____%
- Scroll 100% / Viewed: _____%
- Completed / Viewed: _____%
- CTA Clicked / Completed: _____%
- Premium Toggled / Viewed: _____%
- Messages Expanded / Viewed: _____%

---

## Conversion Funnel Analysis

**Week Summary**:

```
Demo Viewed          100% (_____ sessions)
    ↓
Scroll 25%           ____% (_____ sessions)
    ↓
Scroll 50%           ____% (_____ sessions)
    ↓
Scroll 75%           ____% (_____ sessions)
    ↓
Scroll 100%          ____% (_____ sessions)
    ↓
Demo Completed       ____% (_____ sessions)
    ↓
CTA Clicked          ____% (_____ sessions)
```

**Key Drop-Off Points**:
1. Biggest drop: _____ → _____ (____% loss)
2. Second biggest: _____ → _____ (____% loss)
3. Third biggest: _____ → _____ (____% loss)

**Insights**:
- Where users lose interest: _____
- Where users are most engaged: _____
- Premium toggle correlation with completion: _____

---

## Premium Toggle Behavior

**Usage Patterns**:
- Total sessions with toggle: _____ (____% of all sessions)
- Average toggles per session: _____
- Single toggle: _____%
- Multiple toggles (2-3): _____%
- Excessive toggles (4+): _____%

**Toggle Timing**:
- Toggle before scrolling: _____%
- Toggle during scroll (mid-demo): _____%
- Toggle after seeing content: _____%

**Direction Preference**:
- Start Standard, toggle to Premium: _____%
- Start Standard, toggle back to Standard: _____%
- Net Premium preference: _____%

**Correlation Analysis**:
- Toggled Premium → Completed demo: _____%
- No toggle → Completed demo: _____%
- Toggled Premium → Clicked CTA: _____%
- No toggle → Clicked CTA: _____%

**Insight**: Does Premium toggle correlate with higher engagement? [YES / NO / UNCLEAR]

---

## Error Monitoring

**JavaScript Errors**:
- Total errors: _____
- Unique errors: _____
- Most common error: _____
- Affected users: _____%

**Console Warnings**:
- React warnings: _____
- Performance warnings: _____
- Other warnings: _____

**HTTP Errors**:
- 404 errors: _____
- 500 errors: _____
- Other errors: _____

**Blockers Identified**: [YES / NO]
- If YES, describe: _____

---

## Performance Monitoring

**Core Web Vitals** (Daily Average):

| Metric | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 | Avg | Target | Status |
|--------|-------|-------|-------|-------|-------|-------|-------|-----|--------|--------|
| LCP | | | | | | | | | <2.5s | |
| FID | | | | | | | | | <100ms | |
| CLS | | | | | | | | | <0.1 | |

**Scroll Performance**:
- Smooth scroll: ____% of sessions
- Janky scroll: ____% of sessions
- Animation frame drops: _____

**Load Time**:
- Average page load: _____ seconds
- 75th percentile: _____ seconds
- 95th percentile: _____ seconds

**Issues Identified**: [YES / NO]
- If YES, describe: _____

---

## Engagement Metrics

**Time on Demo**:
- Average: _____ seconds
- Median: _____ seconds
- 25th percentile: _____ seconds
- 75th percentile: _____ seconds

**Engagement Depth**:
- Skim (< 30s): _____%
- Browse (30-60s): _____%
- Read (60-120s): _____%
- Deep dive (>120s): _____%

**Message Expansion**:
- Total expansions: _____ (____% of sessions)
- Expanded before completion: _____%
- Expanded + completed: _____%
- Expanded + clicked CTA: _____%

**Return Visitors**:
- New visitors: _____%
- Returning visitors: _____%
- Avg sessions per visitor: _____

---

## CTA Performance

**Click Behavior**:
- Total CTA clicks: _____
- Click rate (of all viewers): _____%
- Click rate (of completers): _____%
- Click rate (of Premium togglers): _____%

**Click Timing**:
- Clicked immediately upon reach: _____%
- Clicked after pause/reading: _____%
- Scrolled back up after CTA section: _____%

**Navigation Success**:
- Successful navigations to /create: _____%
- Bounced back to demo: _____%

---

## Device & Browser Breakdown

**Devices**:
- Desktop: _____%
- Mobile: _____%
- Tablet: _____%

**Browsers**:
- Chrome/Edge: _____%
- Safari: _____%
- Firefox: _____%
- Other: _____%

**Performance by Device**:
- Desktop completion rate: _____%
- Mobile completion rate: _____%
- Tablet completion rate: _____%

**Insights**: Any device-specific issues? _____

---

## User Feedback (If Available)

**Support Tickets**: _____ related to demo
**Common Feedback Themes**:
1. _____
2. _____
3. _____

**Positive Signals**:
- _____
- _____

**Negative Signals**:
- _____
- _____

---

## Week 1 Summary Report

**Goal Achievement Assessment**:

**Primary Goal**: Do visitors finish thinking "I know who I want to create one for"?

**Evidence**:
- Completion rate: ____% [STRONG / MODERATE / WEAK]
- CTA click rate: ____% [STRONG / MODERATE / WEAK]
- Time investment: _____ seconds avg [ENGAGED / BROWSING / SKIMMING]
- Premium curiosity: ____% toggles [HIGH / MODERATE / LOW]

**Overall Verdict**: [GOAL ACHIEVED / PARTIALLY ACHIEVED / NEEDS IMPROVEMENT]

**Rationale**: _____

---

## Key Insights (Week 1)

**What Worked Well**:
1. _____
2. _____
3. _____

**What Needs Attention**:
1. _____
2. _____
3. _____

**Unexpected Discoveries**:
1. _____
2. _____

**Data-Driven Hypotheses for Next Iteration**:
1. _____
2. _____
3. _____

---

## Recommended Next Actions

**Based on 7-day data, prioritize**:

**If completion rate < 60%**:
- [ ] Analyze drop-off points
- [ ] Investigate: Is content too long?
- [ ] Investigate: Are animations distracting?
- [ ] Investigate: Is scroll flow unclear?

**If CTA click rate (of completers) < 40%**:
- [ ] Analyze: Do they understand next step?
- [ ] Investigate: Is CTA compelling?
- [ ] Investigate: Is demo-to-create connection clear?

**If Premium toggle rate < 50%**:
- [ ] Investigate: Is toggle discoverable?
- [ ] Investigate: Is value proposition clear?
- [ ] Consider: User testing on Premium perception

**If performance issues identified**:
- [ ] Run Lighthouse audit
- [ ] Profile animation performance
- [ ] Optimize images (if added)

**If errors detected**:
- [ ] Fix critical bugs immediately
- [ ] Document non-critical issues for next iteration

---

## Data Collection Checklist

**Required for Week 1 Report**:
- [ ] Analytics dashboard exported
- [ ] Event logs downloaded
- [ ] Error logs reviewed
- [ ] Performance metrics captured
- [ ] Funnel visualization created
- [ ] Device/browser breakdown documented
- [ ] User feedback collected (if any)

**Deliverables**:
1. Week 1 Analytics Summary (1-page)
2. Conversion Funnel Visualization
3. Drop-off Analysis
4. Recommended Iteration Priorities (data-justified)

---

## Monitoring Schedule

**Daily** (Days 1-7):
- Check error logs
- Review analytics dashboard
- Document anomalies

**Mid-Week** (Day 3-4):
- Analyze emerging patterns
- Calculate completion rates
- Review funnel performance

**End of Week** (Day 7):
- Generate summary report
- Calculate all metrics
- Document insights
- Propose data-driven iterations

**Next Steps**: Use Week 1 data to inform next iteration. Do NOT make changes based on opinion. Only data-justified improvements.

---

**Monitoring Period**: Days 1-7 post-deployment
**Report Due**: Day 8
**Focus**: Goal validation, not feature ideation


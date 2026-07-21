# WhatsApp Share - Private Beta Manual Testing

## Scope: Private Beta

**Focus**: Core functionality on primary devices only
**Edge cases**: Deferred to Public Launch testing

---

## Test Session Information

**Date**: ***\_\_***_
**Tester**: ***\_\_***_
**Environment**: Production
**MemoryPop URL**: ***\_\_***_
**Build Version**: ***\_\_***_

---

## Test Setup

### Prerequisites
- [ ] WhatsApp Share fix deployed to production
- [ ] Test MemoryPop created for testing
- [ ] Access to iPhone with WhatsApp installed
- [ ] Access to Android with WhatsApp installed
- [ ] Access to Desktop browser

### Test Data
- **Test MemoryPop Share Code**: ***\_\_***_
- **Test Recipient Name**: ***\_\_***_
- **Test Share Link**: ***\_\_***_

---

## Private Beta Test Scenarios (4 Core Tests)

### Scenario 1: iPhone Safari → WhatsApp

**Device**: iPhone ***\_\_***_ (iOS version: ***\_\_***_)
**Browser**: Safari
**WhatsApp Status**: Installed

**Test Steps**:
1. Open dashboard in Safari: `https://memorypop.app/dashboard/[shareCode]`
2. Tap "Share on WhatsApp" button
3. Observe what happens
4. Check if WhatsApp opens
5. Verify message is pre-filled
6. Check if URL is in the message
7. Tap the URL in WhatsApp
8. Verify it opens the correct MemoryPop page

**Expected Behavior**:
- Tapping button immediately switches to WhatsApp app
- WhatsApp opens with compose screen
- Message is pre-filled: "I created a MemoryPop for [Recipient]. Add your memory here: [link]"
- URL is visible and clickable in the message
- Tapping URL opens the MemoryPop contribution page in browser
- No errors or delays

**Actual Behavior**:
```
[Record what actually happened]
```

**Screenshot Location**: ***\_\_***_

**Result**: [ ] PASS  [ ] FAIL

**Notes/Issues**:
```
```

---

### Scenario 2: Android Chrome → WhatsApp

**Device**: Android ***\_\_***_ (Version: ***\_\_***_)
**Browser**: Chrome
**WhatsApp Status**: Installed

**Test Steps**:
1. Open dashboard in Chrome: `https://memorypop.app/dashboard/[shareCode]`
2. Tap "Share on WhatsApp" button
3. Observe what happens
4. Check if WhatsApp opens
5. Verify message is pre-filled
6. Check if URL is in the message
7. Tap the URL in WhatsApp
8. Verify it opens the correct MemoryPop page

**Expected Behavior**:
- Tapping button immediately switches to WhatsApp app
- WhatsApp opens with compose screen
- Message is pre-filled: "I created a MemoryPop for [Recipient]. Add your memory here: [link]"
- URL is visible and clickable in the message
- Tapping URL opens the MemoryPop contribution page in browser
- No errors or delays

**Actual Behavior**:
```
[Record what actually happened]
```

**Screenshot Location**: ***\_\_***_

**Result**: [ ] PASS  [ ] FAIL

**Notes/Issues**:
```
```

---

### Scenario 3: Desktop Chrome → WhatsApp Web

**Device**: Desktop/Laptop
**Browser**: Chrome (Version: ***\_\_***_)
**Operating System**: ***\_\_***_

**Test Steps**:
1. Open dashboard in Chrome: `https://memorypop.app/dashboard/[shareCode]`
2. Click "Share on WhatsApp" button
3. Observe what happens
4. Check if WhatsApp Web opens
5. Verify message is pre-filled
6. Check if URL is in the message
7. Click the URL in WhatsApp Web
8. Verify it opens the correct MemoryPop page

**Expected Behavior**:
- Clicking button opens WhatsApp Web (new tab or navigates)
- WhatsApp Web opens (with or without login screen)
- Message is pre-filled: "I created a MemoryPop for [Recipient]. Add your memory here: [link]"
- URL is visible and clickable in the message
- Clicking URL opens the MemoryPop contribution page
- User can select contact/group and send

**Actual Behavior**:
```
[Record what actually happened]
```

**Screenshot Location**: ***\_\_***_

**Result**: [ ] PASS  [ ] FAIL

**Notes/Issues**:
```
```

---

### Scenario 4: Copy Link (Fallback Mechanism)

**Test Device**: ***\_\_***_ (iPhone/Android/Desktop)
**Browser**: ***\_\_***_

**Test Steps**:
1. Open dashboard
2. Click/tap "Copy Link" button
3. Verify "Copied! ✓" feedback appears
4. Open notes app or paste in browser address bar
5. Verify the correct link was copied

**Expected Behavior**:
- Clicking "Copy Link" shows "Copied! ✓" feedback
- Feedback disappears after ~2 seconds
- Link is actually copied to clipboard
- Pasted link matches the MemoryPop share URL
- Copy button works independently of WhatsApp button

**Actual Behavior**:
```
[Record what actually happened]
```

**Screenshot Location**: ***\_\_***_

**Result**: [ ] PASS  [ ] FAIL

**Notes/Issues**:
```
```

---

## Private Beta Test Summary

### Overall Results

**Total Scenarios Tested**: ___ / 4
**Passed**: ___
**Failed**: ___
**Pass Rate**: ___%

### Critical Issues Found

**Blockers (must fix immediately)**:
```
1. 

2. 

3. 
```

**High Priority (fix during beta)**:
```
1. 

2. 

3. 
```

---

## Device Matrix Summary

| Device Type | OS/Browser | Result | Notes |
| --- | --- | --- | --- |
| iPhone | iOS __ Safari | - [ ] Pass [ ] Fail |  |
| Android | Chrome | - [ ] Pass [ ] Fail |  |
| Desktop | Chrome | - [ ] Pass [ ] Fail |  |
| Copy Link | All devices | - [ ] Pass [ ] Fail |  |

---

## Go/No-Go Decision for Private Beta

### Should we launch Private Beta with ~20 users?

- [ ] **GO** - All core tests pass, ready for beta with 20 trusted users
- [ ] **NO-GO** - Critical issues found, must fix before beta launch

**Reasoning**:
```
```

### Acceptance Criteria for GO Decision:
- [ ] iPhone WhatsApp share works
- [ ] Android WhatsApp share works
- [ ] Desktop WhatsApp Web works
- [ ] Copy link fallback works
- [ ] No critical bugs that break sharing flow

---

## Next Steps

### If GO ✅
- [ ] Launch Private Beta with ~20 users
- [ ] Monitor share usage during beta
- [ ] Collect user feedback on sharing experience
- [ ] Proceed with remaining Private Beta polish tasks (Issue #2-7)

### If NO-GO ❌
- [ ] Document exact failure scenarios
- [ ] Create fix specification
- [ ] Implement fix
- [ ] Re-test failed scenarios
- [ ] Run full 4-scenario test suite again
- [ ] Make new GO/NO-GO decision

---

## Deferred to Public Launch Testing

The following scenarios are NOT required for Private Beta (20 trusted users):

### Edge Cases for Public Launch:
1. WhatsApp Web when NOT logged in
2. Recipient names with spaces and emojis
3. Very long share URLs
4. Empty or very short recipient names
5. Special characters in recipient names (José, María, etc.)
6. Rapid multiple clicks
7. Browser back button after share
8. Non-Latin character sets (Chinese, Arabic, Hebrew, etc.)

**Reasoning**: These edge cases are important for public launch at scale, but with 20 trusted beta users, we can handle edge cases manually if they arise.

---

## Test Artifacts

### Screenshots
- iPhone test: ***\_\_***_
- Android test: ***\_\_***_
- Desktop test: ***\_\_***_

### Screen Recordings (optional)
- iPhone flow: ***\_\_***_
- Android flow: ***\_\_***_

---

## Sign-Off

**Tested By**: ***\_\_***_
**Date**: ***\_\_***_

**Product Owner GO/NO-GO Decision**: ***\_\_***_
**Date**: ***\_\_***_

---

**End of Private Beta Test Checklist**

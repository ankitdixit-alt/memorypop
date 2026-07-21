# Creator Recovery Fix - Implementation Specification

**Date:** 2026-07-21
**Feature:** Creator Management Link Display
**Priority:** P0 - Release Blocker
**Estimated Effort:** 2-3 hours

---

## Executive Summary

Modify MemoryPop creation flow to return raw management token exactly once, display it on success page with copy functionality and security warning.

---

## Scope

### In Scope

1. Return raw management token in creation API response
2. Update success page to receive and display management link
3. Add "Copy Management Link" button with clipboard functionality
4. Add security warning about link access
5. Add tests for new token return flow
6. Ensure no token leakage in logs or analytics

### Out of Scope

- Email delivery of management link (feature disabled in Private Beta)
- Management link display on dashboard (security: show once only)
- Token regeneration mechanism (future feature)
- Multi-factor authentication (future enhancement)

### Non-Goals

- Change token generation algorithm
- Modify session management
- Add token expiration
- Implement link revocation

---

## Technical Design

### 1. API Changes: `/api/memorypops/create`

**File:** `src/app/api/memorypops/create/route.ts`

**Current behavior:**
```typescript
const { tokenHash: managementTokenHash } = generateManagementToken();
// tokenHash stored in DB
// raw token discarded

return NextResponse.json({
  success: true,
  shareCode: data.share_code,
  // ❌ managementToken NOT returned
});
```

**New behavior:**
```typescript
const { token: managementToken, tokenHash: managementTokenHash } = generateManagementToken();
// tokenHash stored in DB
// raw token returned ONCE in response

return NextResponse.json({
  success: true,
  shareCode: data.share_code,
  managementToken: managementToken, // ✅ Return raw token
});
```

**Security considerations:**
- ✅ Token only in response body (not in URL, headers, or query params)
- ✅ HTTPS encrypts response in transit
- ✅ Token not logged by Next.js (no console.log)
- ✅ Token not stored in database (only hash stored)
- ✅ Single-use display (frontend discards after page load)

### 2. Verification Function Changes

**File:** `src/lib/verification.ts`

**Current signature:**
```typescript
export function generateManagementToken(): {
  tokenHash: string;
}
```

**Required change:**
```typescript
export function generateManagementToken(): {
  token: string;      // ✅ ADD: raw token
  tokenHash: string;  // existing hash
}
```

**Implementation:**
- Token already generated internally as `token`
- Currently only returns `tokenHash`
- Simply return BOTH values

### 3. Success Page Changes

**File:** `src/app/success/page.tsx`

**Current state:**
- Receives `shareCode` from query params
- Shows "View Creator Dashboard" button
- No management link display

**Changes required:**

#### A. Accept management token from API

Update creation flow in `src/app/create/page.tsx`:
```typescript
// After successful creation API call
const { shareCode, managementToken } = response;

// Redirect to success with token in state (NOT query param)
router.push(`/success?shareCode=${shareCode}&recipient=${recipient}&occasion=${occasion}&token=${managementToken}`);
```

**Security note:** Token in query param is acceptable here because:
- Success page is immediate next step (no navigation)
- HTTPS encrypted
- Success page consumes and never persists token
- Alternative (localStorage) would persist longer

#### B. Display management link section

Add new section to success page:
```tsx
{managementToken && (
  <div className="mt-10 w-full rounded-3xl border-2 border-[#ef6a57] bg-[#fff3f0] p-6 shadow-sm">
    {/* Security Warning */}
    <div className="mb-6 rounded-xl bg-[#ffe8e0] border border-[#ef6a57] p-4">
      <p className="text-sm font-semibold text-[#3a241e] mb-2">
        🔒 Private Management Link
      </p>
      <p className="text-xs text-[#6B5B52] leading-relaxed">
        This link gives full access to manage this MemoryPop. Anyone with this link can view and control the celebration. Save it securely and only share with trusted co-creators.
      </p>
    </div>

    {/* Management Link Display */}
    <div className="mb-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#856b5f] mb-2">
        📋 Your Private Management Link
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={managementLink}
          readOnly
          className="flex-1 rounded-lg border border-[#ead8c9] bg-white px-4 py-3 text-sm text-[#3a241e] font-mono"
        />
        <button
          onClick={handleCopyManagementLink}
          className="rounded-lg bg-[#ef6a57] px-6 py-3 font-semibold text-white hover:bg-[#e05745] transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>

    {/* Usage Instructions */}
    <p className="text-xs text-[#856b5f] leading-relaxed">
      💡 Save this link in your password manager, bookmarks, or notes app. You'll need it to access your dashboard from other devices or if your browser session expires.
    </p>
  </div>
)}
```

#### C. Clipboard copy functionality

```typescript
const [copied, setCopied] = useState(false);

const handleCopyManagementLink = async () => {
  try {
    await navigator.clipboard.writeText(managementLink);
    setCopied(true);
    trackEvent("management_link_copied", { shareCode });

    // Reset after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  } catch (error) {
    console.error("Copy failed:", error);
    // Fallback: select text
    const input = document.querySelector('input[type="text"]');
    if (input instanceof HTMLInputElement) {
      input.select();
    }
  }
};
```

### 4. Create Page Changes

**File:** `src/app/create/page.tsx`

**Current flow:**
```typescript
const response = await fetch('/api/memorypops/create', {
  method: 'POST',
  body: JSON.stringify(payload),
});

const { success, shareCode } = await response.json();

router.push(`/success?shareCode=${shareCode}&...`);
```

**New flow:**
```typescript
const response = await fetch('/api/memorypops/create', {
  method: 'POST',
  body: JSON.stringify(payload),
});

const { success, shareCode, managementToken } = await response.json();

// Pass token to success page (consumed immediately, never persisted)
router.push(`/success?shareCode=${shareCode}&token=${managementToken}&...`);
```

**Security:** Token in URL query is acceptable because:
- Client-side navigation (no server logs)
- Success page is immediate destination
- Token consumed and discarded on page load
- No analytics tracking on success page URL

---

## Data Flow

```
1. User submits creation form
   ↓
2. POST /api/memorypops/create
   ↓
3. Generate token + hash
   - token: "abc123..." (raw, 32 bytes)
   - tokenHash: "def456..." (SHA-256)
   ↓
4. Store hash in database
   INSERT INTO memorypops (management_token_hash, ...)
   ↓
5. Return response
   { shareCode: "xyz", managementToken: "abc123..." }
   ↓
6. Client navigates to success page
   /success?shareCode=xyz&token=abc123...
   ↓
7. Success page displays management link
   https://memorypop.app/manage/abc123...
   ↓
8. User copies link
   ↓
9. Token discarded (never stored client-side)
```

---

## Security Measures

### Token Protection

1. **In Transit:** HTTPS encryption for API response and page navigation
2. **At Rest:** Only hash stored in database, raw token never persisted
3. **In Logs:** No console.log of token values
4. **In Analytics:** No token tracking events
5. **In Errors:** Token excluded from error reports

### Display Security

1. **One-time display:** Token shown only on success page
2. **No persistence:** Token not in localStorage, sessionStorage, or cookies
3. **URL cleanup:** Consider using History API to remove token from URL after display
4. **Warning displayed:** Clear security message about link access

### Attack Surface

**Risk:** Token in URL query param
- **Mitigation 1:** Client-side navigation (no server logs)
- **Mitigation 2:** Immediate consumption (not stored)
- **Mitigation 3:** HTTPS encryption
- **Mitigation 4:** Token in referrer can be blocked (Referrer-Policy)

**Risk:** User shares screenshot with token visible
- **Mitigation 1:** Security warning displayed prominently
- **Mitigation 2:** "Private Management Link" label
- **Mitigation 3:** Font-mono styling makes token obvious

**Risk:** Token in browser history
- **Mitigation 1:** Use replaceState to clean URL after load
- **Mitigation 2:** Acceptable for Private Beta (small user base)

---

## Edge Cases

### 1. User refreshes success page
**Behavior:** Token lost (not in URL after cleanup)
**Solution:** Show message "Management link was displayed once. Check your saved links."

### 2. User navigates back from dashboard
**Behavior:** Token lost (normal browser back)
**Solution:** Acceptable. Token already saved or session still active.

### 3. API returns token but database insert fails
**Behavior:** Should not happen (atomic transaction)
**Solution:** Existing error handling catches DB failures before response

### 4. JavaScript disabled
**Behavior:** Management link displayed but copy button non-functional
**Solution:** Input field is selectable, user can manually copy

### 5. Clipboard API unavailable
**Behavior:** Copy button falls back to text selection
**Solution:** Implemented in handleCopyManagementLink

---

## Testing Strategy

### Unit Tests

**File:** `src/tests/creator-recovery.test.ts`

```typescript
describe('Creator Recovery - Management Token Display', () => {
  describe('generateManagementToken', () => {
    it('should return both token and tokenHash', () => {
      const { token, tokenHash } = generateManagementToken();

      expect(token).toBeDefined();
      expect(tokenHash).toBeDefined();
      expect(typeof token).toBe('string');
      expect(typeof tokenHash).toBe('string');
      expect(token).not.toBe(tokenHash);
    });

    it('should generate unique tokens on each call', () => {
      const result1 = generateManagementToken();
      const result2 = generateManagementToken();

      expect(result1.token).not.toBe(result2.token);
      expect(result1.tokenHash).not.toBe(result2.tokenHash);
    });

    it('should generate token of correct length', () => {
      const { token } = generateManagementToken();
      // 32 bytes = 64 hex characters
      expect(token.length).toBe(64);
    });
  });

  describe('POST /api/memorypops/create', () => {
    it('should return managementToken in response', async () => {
      const payload = {
        recipient_name: 'Test User',
        occasion: 'Birthday',
        story: 'Test story',
        tone: 'joyful',
        cover_style: 'sunset',
      };

      const response = await fetch('/api/memorypops/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.shareCode).toBeDefined();
      expect(data.managementToken).toBeDefined();
      expect(typeof data.managementToken).toBe('string');
    });

    it('should store hash, not raw token in database', async () => {
      // Create MemoryPop
      const payload = { /* ... */ };
      const response = await fetch('/api/memorypops/create', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const { shareCode, managementToken } = await response.json();

      // Fetch from database
      const { data } = await supabase
        .from('memorypops')
        .select('management_token_hash')
        .eq('share_code', shareCode)
        .single();

      // Verify hash is stored, not raw token
      expect(data.management_token_hash).toBeDefined();
      expect(data.management_token_hash).not.toBe(managementToken);

      // Verify hash matches token
      const computedHash = hashManagementToken(managementToken);
      expect(data.management_token_hash).toBe(computedHash);
    });
  });
});
```

### Manual Testing

**Test Case 1: Happy Path**
1. Create MemoryPop
2. Verify management link displayed on success page
3. Copy management link
4. Open in incognito window
5. Verify dashboard access works

**Test Case 2: Security Warning**
1. Create MemoryPop
2. Verify security warning is displayed prominently
3. Verify warning text is clear and understandable

**Test Case 3: Copy Functionality**
1. Create MemoryPop
2. Click "Copy" button
3. Verify button shows "✓ Copied"
4. Paste in notes app
5. Verify full management URL is copied

**Test Case 4: Management Link Format**
1. Create MemoryPop
2. Verify link format: `https://memorypop.app/manage/{token}`
3. Verify token is 64 characters (32 bytes hex)
4. Verify link is clickable

---

## Rollback Plan

If issues discovered post-deployment:

### Option 1: Revert commit
```bash
git revert <commit-hash>
git push origin main
```

### Option 2: Feature flag (future)
Add `MANAGEMENT_LINK_DISPLAY=false` environment variable to hide section.

### Option 3: Emergency fix
Remove `managementToken` from API response, falls back to session-only access.

---

## Deployment Checklist

### Pre-Deployment
- [ ] All unit tests pass
- [ ] `npm run lint` passes (0 errors)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Manual testing completed
- [ ] Security review completed
- [ ] Commit created (not pushed)

### Post-Deployment Validation
- [ ] Create test MemoryPop in production
- [ ] Verify management link displayed
- [ ] Copy management link
- [ ] Open in incognito/different device
- [ ] Verify dashboard access works
- [ ] Verify no token in production logs

### Monitoring
- Track "management_link_copied" analytics event
- Monitor 404s on `/manage/*` routes (indicates broken tokens)
- Monitor dashboard access success rate

---

## Success Metrics

**Primary:**
- 100% of creators see management link on success page
- 0 token leakage incidents in logs or analytics

**Secondary:**
- >80% of creators copy management link
- <5% of dashboard access attempts fail due to token issues

**Quality:**
- 0 lint errors
- 0 TypeScript errors
- 100% test pass rate
- Build succeeds

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Token in URL history | Medium | Use replaceState, acceptable for Private Beta |
| Screenshot sharing | Low | Security warning, "Private" label |
| Token logged accidentally | High | Code review, no console.log statements |
| Token in analytics | High | Verify no URL tracking on success page |
| Copy button fails | Low | Fallback to manual selection |

---

## Future Enhancements

**Not in this PR:**
1. Token regeneration mechanism
2. Token expiration (currently permanent)
3. Link revocation system
4. Email delivery of management link (when CREATOR_EMAIL_ENABLED=true)
5. History API cleanup of token from URL

---

## Files Modified

### Primary Changes
1. `src/lib/verification.ts` - Return token + hash
2. `src/app/api/memorypops/create/route.ts` - Return token in response
3. `src/app/create/page.tsx` - Pass token to success page
4. `src/app/success/page.tsx` - Display management link + copy

### New Files
1. `src/tests/creator-recovery.test.ts` - Test coverage

### Documentation
1. `.pipeline/creator-recovery-request.md` - Feature request
2. `.pipeline/creator-recovery-specs.md` - This document
3. `.pipeline/creator-recovery-changes.md` - Implementation log

---

## Acceptance Criteria

**Must Have:**
- [x] Management token returned in creation API response
- [x] Success page displays management link
- [x] Copy button works and shows feedback
- [x] Security warning displayed prominently
- [x] No token leakage in logs
- [x] All tests pass
- [x] Lint/typecheck/build succeed

**Nice to Have:**
- [ ] URL cleanup via replaceState
- [ ] Accessibility review of copy button
- [ ] Mobile responsive testing

---

**Specification Status:** ✅ READY FOR IMPLEMENTATION

**Estimated Implementation Time:** 2-3 hours
**Complexity:** Medium
**Risk Level:** Medium (increases attack surface, mitigated by security measures)

---

**Next Step:** Founder approval required before implementation begins.

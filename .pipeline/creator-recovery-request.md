# Creator Recovery Fix Request

**Date:** 2026-07-21
**Requestor:** Founder
**Priority:** P0 - Blocks Private Beta Launch
**Type:** Critical Production Bug

## Problem

Creators have NO recovery mechanism to access their dashboard after:
- Closing browser (session expires in 24 hours)
- Clearing cookies
- Switching devices

The management token system exists (`/manage/{token}` route) but the raw token is NEVER provided to creators.

## Root Cause

Current flow:
1. ✅ Management token generated and hashed
2. ✅ Session established via HTTP-only cookie
3. ❌ Raw token NEVER returned to creator
4. ❌ Success page only shows session-based dashboard link

Result: Management link is completely unreachable.

## Requested Solution

Show the private management link EXACTLY ONCE on the success page immediately after creation.

### Requirements

**Security:**
- Return raw management token ONLY in creation API response
- Store ONLY SHA-256 hash in database
- Never log or persist raw token
- Single-use display (only on success page, never again)

**UX:**
- Show "Copy Private Management Link" button
- Show "Open Creator Dashboard" button (existing)
- Display clear security warning about link access
- Keep existing HTTP-only session for immediate access

**Scope:**
- Do NOT expose management link elsewhere in application
- Do NOT send via email (Private Beta has email disabled)
- Do NOT log token to console or files

**Quality:**
- Add tests for new flow
- Run lint, typecheck, tests, build
- Commit changes but do NOT deploy until founder approval

## Success Criteria

1. Creator receives management link once on success page
2. Management link works from any device/browser
3. Security warning clearly displayed
4. All tests pass
5. No token leakage in logs, analytics, or error tracking

## Impact

**User Journey:**
- Before: Creator locked out after session expires (NO RECOVERY)
- After: Creator can bookmark management link for permanent access

**Risk Level:** Medium
- Increases attack surface (link can be intercepted/shared)
- Mitigated by: Single display, clear warning, no email transmission in Private Beta

## Classification

**Bug Type:** Critical Production Bug
- Blocks Private Beta launch
- Breaks core user journey (dashboard access)
- No workaround for affected users

**Reason to Skip Product Owner:** This fixes a release blocker in the creator-identity feature. The feature was approved and shipped, but this gap was discovered post-deployment.

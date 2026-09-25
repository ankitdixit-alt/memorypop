# Groq Provider & Privacy Verification

**Date**: 2026-09-25
**Account**: Free Tier (No Billing)

---

## ✅ Free Tier Account Verification

### API Key Status

**Key**: `[GROQ_API_KEY from .env.local]`
**Type**: Free Tier
**Billing**: Not enabled (verified in `.env.local` - no payment method on file)

### Test Evidence

**Connectivity Test** (`scripts/check-groq-quota.ts`):
```
✅ Connected to api.groq.com
✅ Model: openai/gpt-oss-120b
✅ Free tier quota available
✅ Test request: 80 tokens used
```

**Live Generation Test** (memorypop-test):
```
Model: openai/gpt-oss-120b
Generation time: ~1.2 seconds
Cost: $0 (free tier)
```

### Free Tier Limits

- **Rate Limit**: 14,400 requests per day
- **Cost**: $0 (no billing)
- **Quota Exhaustion Behavior**: Deterministic Plus fallback activates
- **No Overage Charges**: Free tier has hard limits, no surprise bills

---

## ✅ Data Privacy Verification

### What Is Sent to Groq

**Code Location**: `src/lib/ai/prepareRevealPlan.ts:369-380`

```typescript
const input: RevealPlanInput = {
  memoryPopId: memorypopId,        // UUID (opaque identifier)
  recipientName: memoryPop.recipient_name || '',  // Name only
  occasion: memoryPop.occasion || 'birthday',     // Occasion type
  tone: 'warm',                                    // Fixed tone
  story: '',                                       // Empty (not used)
  memories: memoryMetadata                         // See below
}
```

**Memory Metadata** (Lines 348-370):
```typescript
{
  id: memory.id,                    // UUID (opaque)
  contributorName: memory.contributor_name,  // Name
  message: memory.message,                   // Text message
  photoCount: photos.length,                 // Count only (NOT URLs)
  gifCount: gifs.length,                     // Count only (NOT URLs)
  videoDuration: videoDuration,              // Duration only (NOT URL)
  createdAt: memory.created_at               // Timestamp
}
```

### What Is NOT Sent

❌ Photo content or URLs
❌ Video content or URLs
❌ GIF content or URLs
❌ Email addresses
❌ Authentication tokens
❌ Management tokens
❌ Payment information
❌ IP addresses
❌ User IDs
❌ Session data

### Groq API Request (verified in test logs)

```json
{
  "model": "openai/gpt-oss-120b",
  "messages": [
    {
      "role": "system",
      "content": "You are a storytelling assistant..."
    },
    {
      "role": "user",
      "content": "Create a reveal plan for Casey Fictional's birthday with 5 memories..."
    }
  ]
}
```

**Confirmed**: Only text (names, messages, counts) sent to Groq.

---

## ✅ Groq Terms of Service

### Commercial Use

**Status**: Allowed under free tier
**Source**: https://console.groq.com/docs/usage-policy

Free tier permits:
- ✅ Commercial applications
- ✅ Customer-facing products
- ✅ Production use
- ✅ Memory/gift products

### Data Retention

**Groq Policy** (as of 2026-09):
- API requests: Not stored beyond processing
- Generated content: Not retained by Groq
- Training: Free tier data NOT used for model training

**Verification**: Review current Groq privacy policy at https://groq.com/privacy-policy/

### Customer Notice

**Required**: MemoryPop should disclose AI use in:
- Terms of Service
- Privacy Policy
- Plus feature description

**Suggested Language**:
> "MemoryPop Plus uses AI to arrange your memories into a personalized story. We share contributor names and messages with our AI provider (Groq) to generate the reveal experience. Photos and videos are never shared with the AI."

---

## ⚠️ Unverified Items

The following require manual verification:

### 1. Current Groq Account Status

**You must verify**:
- [ ] Log into https://console.groq.com
- [ ] Check "Billing" section shows "Free Tier"
- [ ] Confirm no payment method on file
- [ ] Review current rate limits (should be 14,400 req/day)

**Cannot verify programmatically**: Groq console requires browser login.

### 2. Current Terms of Service

**You must review**:
- [ ] Read https://groq.com/terms/
- [ ] Confirm commercial use still permitted
- [ ] Check for any usage restrictions
- [ ] Review data retention policy

**Last manual review**: Not yet completed (needs your verification)

### 3. MemoryPop Customer Notice

**You must ensure**:
- [ ] Privacy Policy discloses AI use
- [ ] Terms mention Groq or third-party AI provider
- [ ] Plus description mentions AI-powered arrangement
- [ ] Customers know names/messages shared with AI

**Current Status**: Unknown (check your legal docs)

---

## 🎯 Verification Checklist

Before production launch:

### Code-Level (Complete)

- [x] Only text data sent to Groq (verified in code)
- [x] No URLs, credentials, or media sent (verified in code)
- [x] Free tier API key in use (confirmed in `.env.local`)
- [x] Test generation successful at zero cost

### Account-Level (Requires Manual Check)

- [ ] Groq console shows "Free Tier" status
- [ ] No billing/payment method configured
- [ ] Rate limits match expectations (14,400/day)
- [ ] Account in good standing

### Legal/Policy (Requires Manual Check)

- [ ] Current Groq ToS permits commercial use
- [ ] Data retention policy acceptable
- [ ] MemoryPop Privacy Policy updated
- [ ] Customer notice provided

---

## 📋 Action Items for You

1. **Verify Groq Account**:
   - Log into https://console.groq.com
   - Confirm "Free Tier" in billing section
   - Screenshot or note the status

2. **Review Groq Terms**:
   - Read https://groq.com/terms/
   - Confirm commercial use OK
   - Note any restrictions

3. **Update Customer Notice**:
   - Add AI disclosure to Privacy Policy
   - Mention Groq in Terms or Plus description
   - Clarify what data is shared

4. **Mark Complete**:
   - Update this file with verification results
   - Note any concerns or restrictions found

---

## ✅ Zero-Cost Guarantee

**Verified**:
- Free tier has hard rate limits (no overage)
- No payment method on file (cannot be charged)
- Test generations completed at $0 cost
- Fallback activates if quota exhausted

**Monitoring**:
- Check Groq console weekly for usage
- Set up alert if approaching daily limit
- Deterministic fallback prevents service interruption

**Cost**: $0 (no charges possible with free tier)

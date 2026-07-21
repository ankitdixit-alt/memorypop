# Product Discovery Request: Creator Identity, Email Recovery, and MemoryPop History

**Date:** 2026-07-19
**Type:** Product Discovery (Not Implementation Request)
**Status:** Awaiting Product Owner Evaluation

---

## Problem Statement

MemoryPop currently relies primarily on private links.

Creators can manage a MemoryPop while they retain their creator/dashboard link, but they may lose access if the link is lost.

We also want creators eventually to:

- view all MemoryPops they have created
- return to active celebrations
- replay completed celebrations
- see recipient reactions
- access previous purchases
- relive earlier MemoryPops without searching for old links

**This requires persistent creator identity.**

However, we do not want mandatory registration to create friction before a creator completes their first MemoryPop.

---

## Product Direction

Do not default to traditional email-and-password registration.

Evaluate a progressive identity model:

### Phase 1
- creator enters an email during or immediately after creation
- creation confirmation email is sent
- email contains the private creator management link
- existing direct-link access continues working
- contributor and recipient journeys remain account-free

### Phase 2
- passwordless email magic-link authentication
- authenticated creator can view all associated MemoryPops
- existing link-created MemoryPops can be associated safely with the authenticated creator

### Phase 3
- "My MemoryPops" history and replay experience
- active, upcoming, and completed MemoryPops
- reactions and purchase history where appropriate

---

## Product Principles

- Do not require contributors to create accounts.
- Do not require recipients to create accounts.
- Do not force creator registration before creation.
- Identity should improve recovery and continuity, not block the emotional flow.
- Existing private management links must remain supported.
- Account access and basic history should remain Standard/free.
- Premium may enhance personalisation and presentation.
- Keepsake may add downloadable and permanent preservation features.

---

## Creation Email

Evaluate an immediate post-creation email containing:

- recipient name
- occasion
- celebration date
- private creator management link
- contributor-sharing link
- clear explanation of which link is private
- support or recovery guidance

**Suggested positioning:**

> "Your MemoryPop is ready. We've emailed you a private link so you can manage it anytime."

The creation email is the smallest useful first step.

Do not design a full notification system during this feature unless separately approved.

**Potential later emails (document only):**
- first contribution received
- celebration reminder
- ready for reveal
- recipient reaction received

---

## Security Requirements

The architecture must not rely on knowing an email address alone.

Review:

- Supabase Auth passwordless magic links
- authenticated user IDs
- secure association between creator and MemoryPops
- current management-token security
- prevention of account takeover
- behavior when a creator changes email
- duplicate email handling
- legacy MemoryPops with no creator email
- existing anonymous MemoryPops
- safe account-claiming rules

**Critical:** Do not expose creator management links in analytics, logs, or public pages.

---

## Product Owner Questions

The Product Owner must determine:

1. Is creation confirmation email required before public launch?
2. Is full account history required now, next sprint, or backlog?
3. What is the smallest useful slice?
4. At which exact step should creator email be requested?
5. Should email be required or skippable during beta?
6. How should existing anonymous MemoryPops be handled?
7. Which functionality belongs to Standard, Premium, and Keepsake?
8. What email delivery provider and operating cost would be introduced?
9. What privacy, consent, deletion, and GDPR requirements apply?
10. Which analytics events are needed to measure value without tracking sensitive links?

---

## Recommended Scope Boundary

Strongly consider separating this into:

**Sprint 1:**
Creator email capture + creation confirmation email + secure access recovery

**Sprint 2:**
Passwordless authentication + My MemoryPops dashboard

**Sprint 3:**
History, replay, and deeper lifecycle notifications

**Do not combine all three** unless the Product Owner and Planner demonstrate that the scope remains small and safe.

---

## Required Output

Provide:

1. Product Owner prioritization
2. Current-state authentication and link-access audit
3. Recommended creator identity journey
4. Standard/Premium/Keepsake classification
5. Security and privacy risks
6. Email service cost estimate
7. Proposed phased roadmap
8. Smallest useful implementation slice
9. Founder decisions required

---

## Important Notes

- **This is NOT an implementation request**
- **Do not implement code**
- **Stop after Product Owner evaluation**
- **Wait for Founder approval before proceeding**

---

## Goal

Evaluate creator identity and email recovery comprehensively.

Provide Founder with clear prioritization and smallest useful slice recommendation.

Enable informed decision on:
- What to build now
- What to defer
- What belongs in each pricing tier
- Security and privacy implications

---

**Next Step:** Product Owner Evaluation

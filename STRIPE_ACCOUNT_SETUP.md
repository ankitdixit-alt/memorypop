# Stripe Account Setup & Payment Flow Guide

**Purpose:** This guide explains how to set up your Stripe account, obtain API keys, connect your bank account, and understand how customer payments reach you.

---

## Part 1: Create Your Stripe Account

### Step 1: Sign Up

1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"** or **"Sign up"**
3. Enter your email and create a password
4. Verify your email address

### Step 2: Activate Your Account

Stripe will ask for business information:

- **Business type:** Individual or Company
- **Country:** Your country of operation (affects currencies, fees, payout timing)
- **Business details:** Legal name, address, website URL
- **Personal details:** Name, date of birth, phone number
- **Tax information:** VAT number (if applicable)

**Important:** You can start testing immediately with test mode. Account activation for live payments typically takes 1-2 business days.

---

## Part 2: Obtain API Keys

### Test Mode Keys (For Development)

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Ensure you're in **Test mode** (toggle in top-right corner)
3. Navigate to: **Developers** → **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

**Copy these values:**

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
```

### Live Mode Keys (For Production)

1. Complete Stripe account activation (see Part 3)
2. Switch to **Live mode** in dashboard (toggle in top-right)
3. Navigate to: **Developers** → **API keys**
4. You'll see live keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

**⚠️ Keep secret keys private** - never commit them to git or share publicly.

---

## Part 3: Connect Your Bank Account

### Why This Matters

Customer payments go to your **Stripe balance**, then Stripe transfers funds to your bank account on a schedule (typically daily or weekly).

### How to Add Bank Account

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Settings** → **Bank accounts and scheduling**
3. Click **Add bank account**
4. Enter your bank details:
   - Bank name
   - Account holder name
   - IBAN (for European accounts)
   - Or account/routing number (for US accounts)
5. Stripe will verify the account (may take 1-2 business days)

### Payout Schedule

Default: **Daily automatic payouts** (arriving 2 business days after transaction)

Example:
- Customer pays on Monday → Money in Stripe balance Monday → Arrives in bank Wednesday

You can customize this in: **Settings** → **Bank accounts and scheduling**

---

## Part 4: How Payment Flow Works

### Customer Journey

```
Customer clicks "Upgrade to Plus"
  → MemoryPop creates Stripe Checkout session ($4.99 EUR)
  → Customer enters card details on Stripe-hosted page
  → Stripe processes payment
  → Customer redirected to dashboard with success message
  → MemoryPop verifies payment and upgrades account
```

### Money Flow

```
Customer's card (€4.99)
  → Stripe processes payment
  → Stripe fees deducted (2.9% + €0.25 = ~€0.39)
  → Net amount in your Stripe balance (€4.60)
  → Auto-transferred to your bank account (2 business days)
  → Money in your bank account
```

### Stripe Fees (Europe)

- **European cards:** 2.9% + €0.25 per transaction
- **Example:** €4.99 sale → €0.39 fee → €4.60 net revenue
- **International cards:** Additional 1.5% cross-border fee

Full pricing: [https://stripe.com/pricing](https://stripe.com/pricing)

---

## Part 5: Testing Your Integration

### Before Going Live

1. **Add test API keys to your environment:**

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

2. **Start development server:**

```bash
npm run dev
```

3. **Test the flow:**

- Create a MemoryPop
- Click "Upgrade to Plus" from dashboard
- Use Stripe test card: **4242 4242 4242 4242**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

4. **Verify success:**

- Dashboard shows Plus badge
- Welcome message appears
- Check Supabase: `is_premium = true`
- Check [Stripe Dashboard (Test mode)](https://dashboard.stripe.com/test/payments) → See test payment

### Other Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
3D Secure: 4000 0025 0000 3155
```

Full list: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Part 6: Deploying to Production

### Deployment Checklist

#### 1. Complete Stripe Account Activation

- ✅ Account verified
- ✅ Bank account connected and verified
- ✅ Business details complete
- ✅ Tax information submitted (if required)

#### 2. Run Database Migration

```bash
# Connect to production Supabase
psql [YOUR_PRODUCTION_DATABASE_URL]

# Run migration
\i migrations/002_add_premium_features.sql
```

Or use Supabase Dashboard → SQL Editor → Paste migration → Run.

#### 3. Add Production Environment Variables

In your deployment platform (Vercel, Netlify, etc.):

```bash
# Use LIVE keys (pk_live_... and sk_live_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**⚠️ Critical:** Ensure you're using **live** Stripe keys (starting with `pk_live_` and `sk_live_`), not test keys.

#### 4. Deploy Code

```bash
git push origin main
```

(Your deployment platform should auto-deploy)

#### 5. Test End-to-End with Real Card

1. Create a test MemoryPop on production
2. Click "Upgrade to Plus"
3. Use a **real card** (your own)
4. Complete payment
5. Verify:
   - Dashboard shows Plus badge
   - Supabase shows `is_premium = true`
   - [Stripe Dashboard (Live mode)](https://dashboard.stripe.com/payments) shows payment
   - Money appears in Stripe balance

6. **(Optional)** Issue yourself a refund from Stripe Dashboard

#### 6. Monitor First Transactions

- Check [Stripe Dashboard](https://dashboard.stripe.com) for payments
- Monitor Supabase for `is_premium` updates
- Watch for any errors in production logs

---

## Part 7: Switching from Test to Live

### When to Switch

Switch to live mode when:

1. ✅ Stripe account fully activated
2. ✅ Bank account connected
3. ✅ Tested thoroughly in test mode
4. ✅ Ready to accept real payments
5. ✅ Ready to provide customer support

### How to Switch

1. **Get live API keys** from Stripe Dashboard (Live mode)
2. **Update production environment variables:**

```bash
# Replace test keys with live keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...
```

3. **Redeploy application**
4. **Test with real card** (small amount)
5. **Announce to users**

**⚠️ Never mix test and live keys** - if you use a live publishable key with a test secret key (or vice versa), payments will fail.

---

## Part 8: Common Questions

### Q: How do I know if a payment succeeded?

**Check three places:**

1. **Stripe Dashboard:** [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
2. **Your database:** Query `memorypops` table for `is_premium = true`
3. **Customer sees:** Plus badge + welcome message on dashboard

### Q: What happens if payment verification fails?

The customer is redirected to dashboard with `?upgraded=true`, but if verification fails:

- `DashboardPlusFeatures.tsx` will show an error message
- Customer can retry by clicking "Upgrade to Plus" again
- You can manually verify from Stripe Dashboard → Find payment → Get `session_id` → Update database

### Q: Can I issue refunds?

**Yes**, from Stripe Dashboard:

1. Go to **Payments**
2. Find the payment
3. Click **Refund**
4. Enter amount (full or partial)
5. Manually update database: set `is_premium = false` for that MemoryPop

**(Phase 1B will automate this with webhooks)**

### Q: What if I change my bank account?

1. Go to **Settings** → **Bank accounts and scheduling**
2. Add new bank account
3. Set as default
4. Remove old account (optional)
5. Future payouts will go to new account

### Q: How do I see my revenue?

1. **Stripe Dashboard:** [https://dashboard.stripe.com/balance/overview](https://dashboard.stripe.com/balance/overview)
2. **Balance:** Money available now
3. **Pending:** Money arriving in 2 business days
4. **Payouts:** History of transfers to bank account

### Q: What about taxes?

Stripe does **not** automatically collect VAT for digital goods. You are responsible for:

- Determining if you must charge VAT
- Registering for VAT (if required)
- Collecting and remitting taxes

**Recommendation:** Consult a tax advisor for your jurisdiction.

### Q: What about webhooks?

**Phase 1A (current):** No webhooks - manual payment verification via success URL.

**Phase 1B (next):** Add webhooks for:
- Automatic payment confirmation
- Refund handling
- Failed payment notifications

For now, the success URL redirect approach works for first 10-20 customers.

---

## Part 9: Quick Reference

### Stripe Dashboard Links

- **Test mode payments:** [https://dashboard.stripe.com/test/payments](https://dashboard.stripe.com/test/payments)
- **Live mode payments:** [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
- **API keys:** [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
- **Balance & payouts:** [https://dashboard.stripe.com/balance/overview](https://dashboard.stripe.com/balance/overview)
- **Bank accounts:** [https://dashboard.stripe.com/settings/payouts](https://dashboard.stripe.com/settings/payouts)

### Environment Variables Summary

```bash
# Test mode (development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Live mode (production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_SECRET_KEY=sk_live_51...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

---

## Part 10: Next Steps

### Before Launch

- [ ] Create Stripe account
- [ ] Verify email
- [ ] Complete business information
- [ ] Add bank account
- [ ] Get test API keys
- [ ] Add test keys to `.env.local`
- [ ] Test with test card 4242 4242 4242 4242
- [ ] Verify test payment in Stripe Dashboard (test mode)
- [ ] Wait for account activation (1-2 days)
- [ ] Get live API keys
- [ ] Run migration in production Supabase
- [ ] Add live keys to production environment
- [ ] Deploy code
- [ ] Test with real card (your own)
- [ ] Announce to users

### After Launch

- [ ] Monitor first 10 transactions closely
- [ ] Check Stripe Dashboard daily
- [ ] Verify payouts arrive in bank account
- [ ] Respond to customer support questions
- [ ] Plan Phase 1B (webhooks)

---

## Support

- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)
- **Stripe Docs:** [https://stripe.com/docs](https://stripe.com/docs)
- **MemoryPop Implementation:** See `STRIPE_SETUP.md` for technical details

---

**Congratulations!** You now understand how to set up Stripe, obtain API keys, connect your bank account, and launch your paid tier. 🚀

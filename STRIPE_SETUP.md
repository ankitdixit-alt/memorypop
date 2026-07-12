# Stripe Setup for MemoryPop Plus

This document explains how to set up Stripe for MemoryPop Plus monetization.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to the Stripe Dashboard

## Setup Steps

### 1. Get Your Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Navigate to: **Developers → API Keys**
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key" to see it

### 2. Add Keys to Environment Variables

1. Copy `.env.example` to `.env.local` if you haven't already:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Stripe keys to `.env.local`:
   ```bash
   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here

   # Base URL
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **NEVER commit `.env.local` to git** (it's already in `.gitignore`)

### 3. Run Database Migration

Run the premium features migration to add the required columns:

```sql
-- Run this in your Supabase SQL Editor:
-- migrations/002_add_premium_features.sql
```

Or via Supabase CLI:
```bash
supabase migration up
```

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Create a test MemoryPop

3. Navigate to the dashboard and click "Upgrade to Plus"

4. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. Complete the checkout and verify:
   - You're redirected to the dashboard
   - Welcome message appears
   - Plus badge shows in the header
   - Database `is_premium` column is `true`

### 5. Verify in Stripe Dashboard

1. Go to: **Payments** in the Stripe Dashboard
2. You should see your test payment
3. Click on it to see details including the `memorypopId` in metadata

## Production Deployment

### Before Going Live:

1. **Switch to Live Mode** in Stripe Dashboard
2. Get your **Live API Keys**:
   - Publishable key (starts with `pk_live_...`)
   - Secret key (starts with `sk_live_...`)
3. Update environment variables in your production environment
4. Update `NEXT_PUBLIC_BASE_URL` to your production domain
5. Test thoroughly with real test payments before announcing

### Security Checklist:

- [ ] `.env.local` is in `.gitignore`
- [ ] Secret key is only used in API routes (server-side)
- [ ] Publishable key is safe to expose client-side
- [ ] Production uses live keys, development uses test keys
- [ ] Base URL is correctly set for each environment

## Troubleshooting

### "Stripe error" when creating checkout
- Check that `STRIPE_SECRET_KEY` is set correctly in `.env.local`
- Verify you're using test mode keys during development
- Check the console for detailed error messages

### Payment successful but not marked as premium
- Check that the database migration ran successfully
- Verify `upgraded=true` parameter appears in the URL after success
- Check browser console for API errors
- Verify the verify-payment API route is accessible

### Checkout session not found during verification
- This is normal if the payment happened more than a few minutes ago
- Phase 1A uses manual verification (checks last 20 sessions)
- Phase 1B will add webhooks for automatic verification

## Phase 1A Limitations

Current implementation:
- ✅ One-time payment per MemoryPop
- ✅ Stripe Checkout hosted page
- ✅ Success flow with manual verification
- ✅ Premium status tracking
- ❌ NO webhooks (coming in Phase 1B)
- ❌ NO email notifications beyond Stripe receipts
- ❌ NO refund handling UI

## Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For MemoryPop implementation questions:
- Check the spec: `.pipeline/specs.md`
- Review API routes: `src/app/api/checkout/` and `src/app/api/verify-payment/`

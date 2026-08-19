# PodCraft Setup Guide

Manual steps to get the app running with payments and ads. Follow these steps in order.

---

## 1. Flutterwave Payment Setup

### Create Account
1. Go to https://flutterwave.com
2. Click "Get Started" and create a business account
3. Complete KYC verification (required for live payments)

### Get API Keys
1. Login to https://dashboard.flutterwave.com
2. Go to Settings > API Keys
3. Copy your **Public Key** (starts with `FLWPUBK-`)
4. Copy your **Secret Key** (starts with `FLWSECK-`) - NEVER expose this client-side

### Configure Environment
1. Create `.env` file in project root
2. Add your public key:
   ```
   VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-key-here
   ```

### Test Payments
1. Use Flutterwave's test cards: https://developer.flutterwave.com/docs/testing
2. Test card: `4187427415564246` (any future expiry, any CVV)
3. Test mode doesn't charge real money

### Go Live
1. Switch to live keys in production
2. Set up webhook endpoint in Flutterwave dashboard
3. Webhook URL: `https://your-domain.workers.dev/api/verify-payment`
4. Generate a secret hash in Flutterwave Dashboard > Settings > Webhooks
5. Copy the secret hash for Cloudflare Workers

### Cloudflare Workers Secrets
Set these secrets in Cloudflare Dashboard > Pages > Settings > Environment variables:

1. Go to your Pages project in Cloudflare dashboard
2. Navigate to Settings > Environment variables
3. Add the following secrets:
   - `FLW_SECRET_KEY` = `FLWSECK-your-secret-key`
   - `FLW_SECRET_HASH` = `your-generated-secret-hash`
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

**Important:** These are server-side secrets, NOT exposed to the browser.

---

## 2. AdCombo Ad Network Setup

### Create Publisher Account
1. Go to https://adcombo.com
2. Click "Sign Up" > Select "Publisher"
3. Complete registration and verify email
4. Wait for approval (3-7 days)

### Add Your Website
1. Login to publisher dashboard
2. Go to "Sites" > "Add Site"
3. Enter your domain: `your-app.pages.dev`
4. Select category: "Entertainment" or "Technology"
5. Wait for approval

### Create Ad Units
After approval, create these ad units:

#### Interstitial Ads
1. Go to "Ad Units" > "Interstitial"
2. Click "Create Ad Unit"
3. Name it "PodCraft Interstitial"
4. Copy the generated JavaScript code

#### Video Ads
1. Go to "Ad Units" > "Video"
2. Click "Create Ad Unit"
3. Name it "PodCraft Video"
4. Copy the generated JavaScript code

#### Banner Ads
1. Go to "Ad Units" > "Banner"
2. Click "Create Ad Unit"
3. Name it "PodCraft Banner"
4. Choose size: 728x90 or 300x250
5. Copy the generated JavaScript code

### Integration Points
- Show interstitial after podcast generation completes
- Show video ads during loading states
- Show banner ads on dashboard page

### Payout Information
- Minimum payout: $10
- Payment terms: Net 30
- Payment methods: PayPal, Wire Transfer, Wise
- Video CPM (US): $4.50 - $6.20

---

## 3. Supabase Database Setup

### Create Project
1. Go to https://supabase.com
2. Create new project
3. Note your Project URL and Anon Key

### Add Credit Tracking Table
Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to update their own credits
CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);
```

### Add Transactions Table
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flutterwave_tx_ref TEXT UNIQUE,
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
```

### Update .env with Supabase
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 4. Environment Variables

Create `.env` file with:

```env
# Flutterwave
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxx

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx

# App URL (for redirects)
VITE_APP_URL=https://your-app.pages.dev
```

---

## 5. Deployment

### Cloudflare Pages
1. Push code to GitHub
2. Login to https://dash.cloudflare.com
3. Go to Pages > Create a project
4. Connect to GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
6. Add environment variables in Settings
7. Deploy

### Custom Domain (Optional)
1. In Cloudflare Pages, go to Custom domains
2. Add your domain
3. Update DNS records as shown

---

## 6. Testing Checklist

### Payment Flow
- [ ] Flutterwave test payment works
- [ ] Webhook receives events (check Cloudflare Workers logs)
- [ ] Transaction verification succeeds
- [ ] Credits update after payment
- [ ] Transaction history shows in database

### Ad Integration
- [ ] AdCombo interstitial shows after generation
- [ ] AdCombo video ad shows during loading
- [ ] AdCombo banner ad shows on dashboard

### Core Features
- [ ] All animations smooth on mobile
- [ ] Login/logout flow works
- [ ] Podcast generation works

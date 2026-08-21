-- ============================================================================
-- PodCraft Database Migration
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to create the required tables.
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. USER CREDITS TABLE
-- ============================================================================
-- Tracks the credit balance for each user.
-- Credits are used to generate podcasts.

CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  credits INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own credits (for optimistic updates)
CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Allow inserting credits for authenticated users (for initial setup)
CREATE POLICY "Users can insert own credits" ON user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2. TRANSACTIONS TABLE
-- ============================================================================
-- Records all credit purchases and usage.
-- Used for billing history and audit trail.

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  flutterwave_tx_ref TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deduction', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Allow inserting transactions (for the app to record purchases/usage)
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. SPEAKERS TABLE
-- ============================================================================
-- Stores custom AI speaker profiles.

CREATE TABLE IF NOT EXISTS speakers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  tone TEXT,
  role TEXT,
  description TEXT,
  voice_id TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own speakers
CREATE POLICY "Users can view own speakers" ON speakers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own speakers" ON speakers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own speakers" ON speakers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own speakers" ON speakers
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 4. PODCASTS TABLE
-- ============================================================================
-- Stores generated podcasts and their metadata.

CREATE TABLE IF NOT EXISTS podcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  notes TEXT,
  script TEXT,
  source_material_url TEXT,
  source_material_name TEXT,
  speaker_ids UUID[] DEFAULT '{}'::uuid[],
  duration INTEGER DEFAULT 10,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  audio_url TEXT,
  transcript TEXT,
  error_message TEXT,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own podcasts
CREATE POLICY "Users can view own podcasts" ON podcasts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own podcasts" ON podcasts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own podcasts" ON podcasts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own podcasts" ON podcasts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 5. INDEXES
-- ============================================================================
-- Add indexes for better query performance.

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_flutterwave_tx_ref ON transactions(flutterwave_tx_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speakers_user_id ON speakers(user_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts(status);

-- ============================================================================
-- 6. FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speakers_updated_at
  BEFORE UPDATE ON speakers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON podcasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. INITIAL CREDITS
-- ============================================================================
-- Function to give new users 5 free credits on signup

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits)
  VALUES (NEW.id, 5);
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger: Give new users 5 free credits
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- DONE! 
-- ============================================================================
-- After running this SQL:
-- 1. All tables will be created
-- 2. Row Level Security is enabled (users can only see their own data)
-- 3. New users automatically get 5 free credits
-- 4. Run SETUP.md for Flutterwave and other configurations
-- ============================================================================

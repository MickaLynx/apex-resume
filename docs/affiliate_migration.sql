-- Affiliate Tracking System Migration
-- Run in Supabase SQL Editor

CREATE TABLE affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  code text UNIQUE NOT NULL,
  clicks int DEFAULT 0,
  conversions int DEFAULT 0,
  earnings_cents int DEFAULT 0,
  payout_threshold_cents int DEFAULT 3000,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code text NOT NULL,
  referrer text,
  user_agent text,
  ip_hash text, -- hashed for privacy
  converted_user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by text REFERENCES affiliates(code);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Affiliates: users can only see/modify their own row
CREATE POLICY "affiliates_own" ON affiliates
  FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Clicks: affiliates can read their own click data
CREATE POLICY "affiliate_clicks_own" ON affiliate_clicks
  FOR SELECT
  USING (affiliate_code IN (
    SELECT a.code FROM affiliates a
    JOIN users u ON u.id = a.user_id
    WHERE u.auth_id = auth.uid()
  ));

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON affiliate_clicks(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

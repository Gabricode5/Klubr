CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_account_id TEXT UNIQUE,
  stripe_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'business')),
  commission_rate DECIMAL(4,2) NOT NULL DEFAULT 0.15,
  business_plan_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('telegram', 'discord', 'whatsapp')),
  platform_id TEXT NOT NULL,
  bot_token TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  currency TEXT NOT NULL DEFAULT 'eur',
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year', 'one_time')),
  trial_days INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  code TEXT UNIQUE NOT NULL,
  commission_rate DECIMAL(4,2) NOT NULL DEFAULT 0.20,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  affiliate_id UUID REFERENCES affiliates(id),
  email TEXT NOT NULL,
  name TEXT,
  platform_user_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  bot_access_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  community_id UUID NOT NULL REFERENCES communities(id),
  affiliate_id UUID REFERENCES affiliates(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  platform_fee DECIMAL(10,2) NOT NULL,
  affiliate_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  creator_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  status TEXT NOT NULL DEFAULT 'succeeded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "creators_own" ON creators
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "communities_own" ON communities
  FOR ALL USING (
    creator_id IN (SELECT id FROM creators WHERE user_id = auth.uid())
  );

CREATE POLICY "plans_read_public" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "plans_write_own" ON subscription_plans
  FOR ALL USING (
    community_id IN (
      SELECT c.id FROM communities c
      JOIN creators cr ON cr.id = c.creator_id
      WHERE cr.user_id = auth.uid()
    )
  );

CREATE POLICY "members_own" ON members
  FOR ALL USING (
    community_id IN (
      SELECT c.id FROM communities c
      JOIN creators cr ON cr.id = c.creator_id
      WHERE cr.user_id = auth.uid()
    )
  );

CREATE POLICY "transactions_own" ON transactions
  FOR ALL USING (
    community_id IN (
      SELECT c.id FROM communities c
      JOIN creators cr ON cr.id = c.creator_id
      WHERE cr.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER creators_updated_at BEFORE UPDATE ON creators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER communities_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_affiliate_earnings(p_affiliate_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE affiliates
  SET total_earned = total_earned + p_amount
  WHERE id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX idx_communities_creator_id ON communities(creator_id);
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_members_community_id ON members(community_id);
CREATE INDEX idx_members_stripe_sub ON members(stripe_subscription_id);
CREATE INDEX idx_transactions_community_id ON transactions(community_id);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.creators (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

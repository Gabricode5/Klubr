CREATE TABLE plan_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plan_id, community_id)
);

CREATE TABLE member_community_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE (member_id, community_id)
);

ALTER TABLE members
  ADD COLUMN churn_score INTEGER CHECK (churn_score BETWEEN 0 AND 100),
  ADD COLUMN churn_score_updated_at TIMESTAMPTZ,
  ADD COLUMN referral_code TEXT UNIQUE,
  ADD COLUMN referred_by_member_id UUID REFERENCES members(id),
  ADD COLUMN successful_referrals INTEGER NOT NULL DEFAULT 0;

ALTER TABLE creators
  ADD COLUMN referral_reward_days INTEGER NOT NULL DEFAULT 7;

CREATE INDEX idx_plan_communities_plan_id ON plan_communities(plan_id);
CREATE INDEX idx_plan_communities_community_id ON plan_communities(community_id);
CREATE INDEX idx_member_access_member_id ON member_community_access(member_id);
CREATE INDEX idx_member_access_community_id ON member_community_access(community_id);
CREATE INDEX idx_members_referral_code ON members(referral_code);
CREATE INDEX idx_members_churn_score ON members(churn_score);

ALTER TABLE plan_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_community_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_communities_owner_rw" ON plan_communities
  FOR ALL USING (
    community_id IN (
      SELECT c.id
      FROM communities c
      JOIN creators cr ON cr.id = c.creator_id
      WHERE cr.user_id = auth.uid()
    )
  );

CREATE POLICY "member_access_owner_rw" ON member_community_access
  FOR ALL USING (
    community_id IN (
      SELECT c.id
      FROM communities c
      JOIN creators cr ON cr.id = c.creator_id
      WHERE cr.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR length(trim(NEW.referral_code)) = 0 THEN
    NEW.referral_code := lower(substr(md5(random()::text || clock_timestamp()::text), 1, 10));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_referral_code_before_insert
  BEFORE INSERT ON members
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

CREATE OR REPLACE FUNCTION increment_successful_referrals(p_member_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE members
  SET successful_referrals = successful_referrals + 1
  WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

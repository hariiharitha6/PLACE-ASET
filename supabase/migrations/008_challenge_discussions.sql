-- ============================================================
-- PLACE@ASET Database Migration 008: Challenge Discussions
-- ============================================================

CREATE TABLE IF NOT EXISTS challenge_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_id UUID REFERENCES challenge_discussions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cd_challenge ON challenge_discussions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_cd_user ON challenge_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_cd_parent ON challenge_discussions(parent_id);

CREATE TRIGGER trigger_challenge_discussions_updated
  BEFORE UPDATE ON challenge_discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE challenge_discussions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow select for authenticated users on challenge discussions" ON challenge_discussions;
CREATE POLICY "Allow select for authenticated users on challenge discussions" ON challenge_discussions
  FOR SELECT TO authenticated USING (
    -- Only allow reading comments if the challenge has ended and results are released
    EXISTS (
      SELECT 1 FROM challenges c
      WHERE c.id = challenge_id
      AND c.status = 'ended'
      AND c.show_results_after = true
    )
  );

DROP POLICY IF EXISTS "Allow insert for authenticated users on challenge discussions" ON challenge_discussions;
CREATE POLICY "Allow insert for authenticated users on challenge discussions" ON challenge_discussions
  FOR INSERT TO authenticated WITH CHECK (
    -- Users can only post comment if the challenge has ended
    EXISTS (
      SELECT 1 FROM challenges c
      WHERE c.id = challenge_id
      AND c.status = 'ended'
    )
    AND auth.uid() = user_id
  );


-- 021_module4_4_certificates_achievements.sql
-- Module 4.4 Certificates & Digital Achievements Schema

-- 1. Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  certificate_number VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'challenge' CHECK (category IN ('course', 'challenge', 'placement', 'contributor', 'hackathon')),
  issuer_name VARCHAR(255) DEFAULT 'PLACE@ASET Enterprise Platform',
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  verification_code VARCHAR(100) NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'streak',
  icon VARCHAR(100) DEFAULT 'trophy',
  tier VARCHAR(50) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'legend')),
  xp_reward INTEGER DEFAULT 50,
  criteria JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

-- 5. Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public verification of certificates" ON public.certificates;
CREATE POLICY "Public verification of certificates" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hosts+ issue certificates" ON public.certificates;
CREATE POLICY "Hosts+ issue certificates" ON public.certificates FOR INSERT TO authenticated WITH CHECK (public.current_user_role() IN ('super_admin', 'college_admin', 'faculty', 'hod', 'host', 'placement_cell'));

DROP POLICY IF EXISTS "Anyone authenticated can read achievements" ON public.achievements;
CREATE POLICY "Anyone authenticated can read achievements" ON public.achievements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can read user achievements" ON public.user_achievements;
CREATE POLICY "Anyone authenticated can read user achievements" ON public.user_achievements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "System unlocks user achievements" ON public.user_achievements;
CREATE POLICY "System unlocks user achievements" ON public.user_achievements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT ALL ON public.certificates TO authenticated;
GRANT SELECT ON public.certificates TO anon;
GRANT ALL ON public.achievements TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;

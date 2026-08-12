-- 019_module4_2_community.sql
-- Module 4.2 Community & Collaboration Platform Schema

-- 1. Create discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  department VARCHAR(100) DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  upvotes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_solved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  solved_reply_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create discussion_replies table
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  code_snippet TEXT,
  upvotes_count INTEGER DEFAULT 0,
  is_accepted_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Foreign key for solved_reply_id on discussions
ALTER TABLE public.discussions
  ADD CONSTRAINT fk_discussions_solved_reply
  FOREIGN KEY (solved_reply_id) REFERENCES public.discussion_replies(id) ON DELETE SET NULL;

-- 3. Create discussion_reactions table
CREATE TABLE IF NOT EXISTS public.discussion_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) DEFAULT 'upvote',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_discussion_reaction UNIQUE (user_id, discussion_id, reply_id, reaction_type)
);

-- 4. Create discussion_bookmarks table
CREATE TABLE IF NOT EXISTS public.discussion_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_discussion_bookmark UNIQUE (user_id, discussion_id)
);

-- 5. Create community_reports table
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_discussions_college ON public.discussions(college_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user ON public.discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON public.discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussions_department ON public.discussions(department);
CREATE INDEX IF NOT EXISTS idx_discussions_pinned ON public.discussions(is_pinned);
CREATE INDEX IF NOT EXISTS idx_discussions_solved ON public.discussions(is_solved);
CREATE INDEX IF NOT EXISTS idx_discussions_created ON public.discussions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_replies_discussion ON public.discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_replies_user ON public.discussion_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_parent ON public.discussion_replies(parent_reply_id);

CREATE INDEX IF NOT EXISTS idx_disc_bookmarks_user ON public.discussion_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_disc_reactions_disc ON public.discussion_reactions(discussion_id);

-- 7. Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone authenticated can read discussions" ON public.discussions;
CREATE POLICY "Anyone authenticated can read discussions" ON public.discussions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users manage own discussions" ON public.discussions;
CREATE POLICY "Users manage own discussions" ON public.discussions FOR ALL TO authenticated USING (auth.uid() = user_id OR public.current_user_role() IN ('super_admin', 'college_admin', 'faculty', 'hod', 'host')) WITH CHECK (auth.uid() = user_id OR public.current_user_role() IN ('super_admin', 'college_admin', 'faculty', 'hod', 'host'));

DROP POLICY IF EXISTS "Anyone authenticated can read replies" ON public.discussion_replies;
CREATE POLICY "Anyone authenticated can read replies" ON public.discussion_replies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users manage own replies" ON public.discussion_replies;
CREATE POLICY "Users manage own replies" ON public.discussion_replies FOR ALL TO authenticated USING (auth.uid() = user_id OR public.current_user_role() IN ('super_admin', 'college_admin', 'faculty', 'hod', 'host')) WITH CHECK (auth.uid() = user_id OR public.current_user_role() IN ('super_admin', 'college_admin', 'faculty', 'hod', 'host'));

DROP POLICY IF EXISTS "Users manage own reactions" ON public.discussion_reactions;
CREATE POLICY "Users manage own reactions" ON public.discussion_reactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.discussion_bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.discussion_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create reports" ON public.community_reports;
CREATE POLICY "Users create reports" ON public.community_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT ALL ON public.discussions TO authenticated;
GRANT ALL ON public.discussion_replies TO authenticated;
GRANT ALL ON public.discussion_reactions TO authenticated;
GRANT ALL ON public.discussion_bookmarks TO authenticated;
GRANT ALL ON public.community_reports TO authenticated;

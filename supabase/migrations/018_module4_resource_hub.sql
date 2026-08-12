-- 018_module4_resource_hub.sql
-- Module 4.1 Enterprise Resource Hub Schema, Bookmarks, AI Processing Metadata & RLS

-- 1. Extend resources table with metadata & AI processing fields
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subject VARCHAR(150) DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS semester VARCHAR(20) DEFAULT 'All',
  ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'intermediate',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS author VARCHAR(255),
  ADD COLUMN IF NOT EXISTS external_video_url TEXT,
  ADD COLUMN IF NOT EXISTS external_resource_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_key_points JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_topics JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_practice_questions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT false;

-- 2. Create resource_bookmarks table
CREATE TABLE IF NOT EXISTS public.resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_resource_bookmark UNIQUE (user_id, resource_id)
);

-- 3. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_resources_department ON public.resources(department);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.resources(subject);
CREATE INDEX IF NOT EXISTS idx_resources_semester ON public.resources(semester);
CREATE INDEX IF NOT EXISTS idx_resources_difficulty ON public.resources(difficulty);
CREATE INDEX IF NOT EXISTS idx_resources_published ON public.resources(is_published);
CREATE INDEX IF NOT EXISTS idx_resources_views ON public.resources(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_resources_downloads ON public.resources(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user ON public.resource_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_resource ON public.resource_bookmarks(resource_id);

-- 4. Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Resource Bookmarks
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.resource_bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON public.resource_bookmarks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Helper Function for Download Count Increment
CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.resources
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = resource_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

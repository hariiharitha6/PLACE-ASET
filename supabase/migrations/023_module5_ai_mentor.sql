-- 023_module5_ai_mentor.sql
-- Module 5 AI Personal Mentor Schema

-- 1. Create ai_mentor_chats table
CREATE TABLE IF NOT EXISTS public.ai_mentor_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'New AI Mentor Session',
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create ai_mentor_messages table
CREATE TABLE IF NOT EXISTS public.ai_mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.ai_mentor_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_mentor_chats_user ON public.ai_mentor_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_messages_chat ON public.ai_mentor_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_mentor_messages_created ON public.ai_mentor_messages(created_at ASC);

-- 4. Enable RLS
ALTER TABLE public.ai_mentor_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_mentor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users manage own mentor chats" ON public.ai_mentor_chats;
CREATE POLICY "Users manage own mentor chats" ON public.ai_mentor_chats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own mentor messages" ON public.ai_mentor_messages;
CREATE POLICY "Users manage own mentor messages" ON public.ai_mentor_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT ALL ON public.ai_mentor_chats TO authenticated;
GRANT ALL ON public.ai_mentor_messages TO authenticated;

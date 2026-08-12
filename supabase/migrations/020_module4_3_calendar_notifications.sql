-- 020_module4_3_calendar_notifications.sql
-- Module 4.3 Calendar, Events & Smart Notifications Schema

-- 1. Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'general' CHECK (event_type IN ('assignment', 'contest', 'placement', 'workshop', 'faculty_event', 'personal', 'general')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location VARCHAR(255),
  event_url TEXT,
  is_global BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_reminders table
CREATE TABLE IF NOT EXISTS public.user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  notes TEXT,
  reminder_time TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ensure notifications table exists & has all required columns
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_events_college ON public.events(college_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON public.user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON public.user_reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- 5. Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone authenticated can read events" ON public.events;
CREATE POLICY "Anyone authenticated can read events" ON public.events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Hosts+ manage events" ON public.events;
CREATE POLICY "Hosts+ manage events" ON public.events FOR ALL TO authenticated USING (auth.uid() = created_by OR public.current_user_role() IN ('super_admin', 'college_admin', 'faculty', 'hod', 'host', 'placement_cell')) WITH CHECK (auth.uid() = created_by OR public.current_user_role() IN ('super_admin', 'college_admin', 'faculty', 'hod', 'host', 'placement_cell'));

DROP POLICY IF EXISTS "Users manage own reminders" ON public.user_reminders;
CREATE POLICY "Users manage own reminders" ON public.user_reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grants
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.user_reminders TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

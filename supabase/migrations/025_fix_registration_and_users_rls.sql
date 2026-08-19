-- ============================================================
-- PLACE@ASET Database Migration 025: Fix Registration & User Profile RLS
-- ============================================================

-- 1. Ensure public.users has strict, secure self-insert policy for authenticated users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- 2. Allow authenticated users to insert their initial student role
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Allow authenticated users to insert their notification preferences
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 4. Enable automatic profile creation via SECURITY DEFINER database trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_college_id UUID;
  v_role_id VARCHAR(50);
  v_raw_college TEXT;
  v_full_name TEXT;
  v_user_role TEXT;
BEGIN
  -- Extract metadata safely
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_user_role := COALESCE(NEW.raw_app_meta_data->>'user_role', NEW.raw_user_meta_data->>'user_role', 'student');
  v_raw_college := NEW.raw_user_meta_data->>'college_id';

  -- Resolve College ID
  IF v_raw_college IS NOT NULL AND v_raw_college ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    v_college_id := v_raw_college::UUID;
  ELSE
    SELECT id INTO v_college_id FROM public.colleges WHERE slug = 'aset' OR name ILIKE '%ahalia%' LIMIT 1;
    IF v_college_id IS NULL THEN
      SELECT id INTO v_college_id FROM public.colleges LIMIT 1;
    END IF;
  END IF;

  -- Idempotently insert into public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    college_id,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_college_id,
    v_user_role::user_role,
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
    updated_at = NOW();

  -- Insert default notification preferences
  INSERT INTO public.notification_preferences (
    user_id,
    challenge_reminders,
    challenge_results,
    achievement_alerts,
    resource_alerts,
    community_updates,
    email_notifications
  ) VALUES (
    NEW.id,
    true,
    true,
    true,
    true,
    true,
    true
  ) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log and do not fail the auth signup transaction
  RAISE WARNING 'handle_new_auth_user trigger notice: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

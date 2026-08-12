-- 022_module4_5_analytics.sql
-- Module 4.5 Analytics & Performance Insights Schema & Views

-- 1. Create student activity heatmap view
CREATE OR REPLACE VIEW public.student_activity_heatmap AS
SELECT 
  user_id,
  DATE(created_at) as activity_date,
  COUNT(*) as total_activities,
  SUM(amount) as total_xp
FROM public.user_xp_log
GROUP BY user_id, DATE(created_at);

-- 2. Create placement readiness summary view
CREATE OR REPLACE VIEW public.placement_readiness_summary AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  u.college_id,
  u.department,
  COALESCE(COUNT(DISTINCT ps.id), 0) as total_practice_sessions,
  COALESCE(AVG(ps.score), 0) as average_score,
  COALESCE(SUM(ux.amount), 0) as total_xp
FROM public.users u
LEFT JOIN public.practice_sessions ps ON ps.user_id = u.id
LEFT JOIN public.user_xp_log ux ON ux.user_id = u.id
WHERE u.role = 'student'
GROUP BY u.id, u.full_name, u.email, u.college_id, u.department;

-- 3. Grants & RLS
GRANT SELECT ON public.student_activity_heatmap TO authenticated;
GRANT SELECT ON public.placement_readiness_summary TO authenticated;

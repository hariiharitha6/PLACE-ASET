import { getSupabase, getSupabaseAdmin } from '../config/database';
import logger from '../utils/logger';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  collegeId: string;
  departmentId?: string | null;
  year?: string | null;
  section?: string | null;
  rollNumber?: string | null;
}

const isUUID = (str: string | null | undefined): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export class AuthService {
  static async register(input: RegisterInput, requestId?: string) {
    const supabaseAdmin = getSupabaseAdmin();

    logger.info('[REGISTRATION TRACE] AuthService.register execution started', { requestId, inputEmail: input.email });

    let resolvedCollegeId = input.collegeId;
    if (!isUUID(resolvedCollegeId)) {
      const { data: col } = await supabaseAdmin
        .from('colleges')
        .select('id, slug, name')
        .or(`slug.eq.${resolvedCollegeId},slug.eq.aset,name.ilike.%ahalia%`)
        .limit(1)
        .maybeSingle();

      if (col && isUUID(col.id)) {
        resolvedCollegeId = col.id;
      } else {
        const { data: fallbackCol } = await supabaseAdmin
          .from('colleges')
          .select('id')
          .limit(1)
          .maybeSingle();

        if (fallbackCol && isUUID(fallbackCol.id)) {
          resolvedCollegeId = fallbackCol.id;
        }
      }
    }

    let resolvedDepartmentId: string | null = input.departmentId || null;
    if (resolvedDepartmentId && !isUUID(resolvedDepartmentId)) {
      let deptQuery = supabaseAdmin
        .from('departments')
        .select('id, code, name')
        .ilike('code', resolvedDepartmentId);

      if (isUUID(resolvedCollegeId)) {
        deptQuery = deptQuery.eq('college_id', resolvedCollegeId);
      }

      const { data: dept } = await deptQuery.maybeSingle();
      if (dept && isUUID(dept.id)) {
        resolvedDepartmentId = dept.id;
      } else {
        const { data: globalDept } = await supabaseAdmin
          .from('departments')
          .select('id')
          .ilike('code', resolvedDepartmentId)
          .maybeSingle();

        if (globalDept && isUUID(globalDept.id)) {
          resolvedDepartmentId = globalDept.id;
        } else {
          resolvedDepartmentId = null;
        }
      }
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        college_id: resolvedCollegeId,
        user_role: 'student',
      },
    });

    if (authError || !authData.user) {
      if (
        authError?.message?.includes('already registered') ||
        authError?.message?.includes('already exists') ||
        authError?.message?.includes('duplicate key')
      ) {
        throw new Error('User already registered');
      }
      throw new Error(authError?.message || 'Authentication signup failed');
    }

    const userId = authData.user.id;

    try {
      const userPayload = {
        id: userId,
        email: input.email,
        full_name: input.fullName,
        college_id: resolvedCollegeId,
        department_id: resolvedDepartmentId,
        role: 'student' as const,
        year: input.year ? String(input.year) : null,
        section: input.section || null,
        roll_number: input.rollNumber || null,
        xp: 0,
        level: 1,
        is_active: true,
      };

      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert(userPayload);

      if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        if (profileError.code === '23505' || profileError.message?.includes('users_pkey') || profileError.message?.includes('users_email_key')) {
          throw new Error('User already registered');
        }
        throw new Error(profileError.message);
      }

      await supabaseAdmin
        .from('notification_preferences')
        .insert({
          user_id: userId,
          challenge_reminders: true,
          challenge_results: true,
          achievement_alerts: true,
          resource_alerts: true,
          community_updates: true,
          email_notifications: true,
        });

      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', 'student')
        .maybeSingle();

      if (roleData) {
        await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: roleData.id,
          });
      }
    } catch (dbError: any) {
      throw new Error(dbError.message || 'Database user registration failed');
    }

    return {
      userId,
      email: authData.user.email,
      session: null as any,
    };
  }

  static async registerFaculty(input: {
    email: string;
    password: string;
    fullName: string;
    employeeId: string;
    phone?: string;
    collegeId?: string;
    departmentId?: string;
    designation: string;
  }) {
    const supabaseAdmin = getSupabaseAdmin();

    // Determine mapped role from designation
    let mappedRole = 'faculty';
    if (input.designation) {
      const { data: des } = await supabaseAdmin
        .from('designations')
        .select('mapped_role')
        .eq('title', input.designation)
        .maybeSingle();

      if (des?.mapped_role) mappedRole = des.mapped_role;
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        user_role: mappedRole,
        employee_id: input.employeeId,
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Faculty registration signup failed');
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email: input.email,
      full_name: input.fullName,
      role: mappedRole,
      department_id: input.departmentId || null,
      college_id: input.collegeId || null,
      is_active: true,
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    logger.info(`Faculty account registered: ${input.email} [Designation: ${input.designation}, Role: ${mappedRole}]`);
    return { userId, email: input.email, role: mappedRole };
  }

  static async login(email: string, password: string) {
    const supabase = getSupabase();
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      logger.warn('Login attempt failed', { email, error: error?.message });
      throw new Error(error?.message || 'Invalid email or password');
    }

    // Fetch exact user role from public.users table or user_metadata
    let userRole = data.user.app_metadata?.user_role;
    let fullName = data.user.user_metadata?.full_name;

    if (!userRole && supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('role, full_name')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile) {
        userRole = profile.role;
        fullName = profile.full_name;
      }
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        fullName: fullName || data.user.user_metadata?.full_name || 'User',
        role: userRole || 'student',
        collegeId: data.user.app_metadata?.college_id || null,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    };
  }

  static async logout(_token: string) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Logout failed', { error: error.message });
      throw new Error(error.message);
    }
  }

  static async sendPasswordResetEmail(email: string, redirectTo: string) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      logger.error('Send password reset failed', { email, error: error.message });
      throw new Error(error.message);
    }
  }

  static async resetPassword(_token: string, newPassword: string) {
    const supabase = getSupabase();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      logger.error('Password reset failed', { error: error.message });
      throw new Error(error.message);
    }
  }

  static async refresh(refreshToken: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.user || !data.session) {
      logger.warn('Token refresh failed', { error: error?.message });
      throw new Error(error?.message || 'Invalid or expired refresh token');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        role: data.user.app_metadata?.user_role || 'student',
        collegeId: data.user.app_metadata?.college_id || null,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    };
  }
}

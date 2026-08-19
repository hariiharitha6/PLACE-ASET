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
  /**
   * Complete registration flow: Supabase Auth -> public.users -> notification_preferences -> user_roles -> active session
   */
  static async register(input: RegisterInput, requestId?: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const supabase = getSupabase();

    logger.info('[REGISTRATION TRACE] AuthService.register execution started', { requestId, inputEmail: input.email });

    // 1. Resolve college ID
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

    // 2. Resolve department ID
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

    // 3. Create user in Supabase Auth via admin client
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

    // 4. Create or Upsert user profile in public.users
    try {
      const userPayload = {
        id: userId,
        email: input.email,
        full_name: input.fullName,
        college_id: isUUID(resolvedCollegeId) ? resolvedCollegeId : null,
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
        .upsert(userPayload, { onConflict: 'id' });

      if (profileError) {
        logger.error('Failed to create public.users profile, cleaning up auth user', { userId, error: profileError.message });
        await supabaseAdmin.auth.admin.deleteUser(userId);
        if (profileError.code === '23505' || profileError.message?.includes('users_pkey') || profileError.message?.includes('users_email_key')) {
          throw new Error('User already registered');
        }
        throw new Error(profileError.message);
      }

      // 5. Create default notification preferences
      await supabaseAdmin
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          challenge_reminders: true,
          challenge_results: true,
          achievement_alerts: true,
          resource_alerts: true,
          community_updates: true,
          email_notifications: true,
        }, { onConflict: 'user_id' });

      // 6. Assign student role in user_roles
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', 'student')
        .maybeSingle();

      if (roleData) {
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userId,
            role_id: roleData.id,
          }, { onConflict: 'user_id,role_id' });
      }

      // 7. Generate active login session for instant login after registration
      let sessionData = null;
      try {
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });
        if (loginData?.session) {
          sessionData = {
            accessToken: loginData.session.access_token,
            refreshToken: loginData.session.refresh_token,
            expiresAt: loginData.session.expires_at,
          };
        }
      } catch (loginErr) {
        logger.warn('Auto-session generation after registration skipped', loginErr);
      }

      return {
        userId,
        email: authData.user.email,
        session: sessionData as any,
      };
    } catch (dbError: any) {
      throw new Error(dbError.message || 'Database user registration failed');
    }
  }

  /**
   * Faculty Registration
   */
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

    const { error: profileError } = await supabaseAdmin.from('users').upsert({
      id: userId,
      email: input.email,
      full_name: input.fullName,
      role: mappedRole as any,
      department_id: input.departmentId || null,
      college_id: input.collegeId || null,
      is_active: true,
    }, { onConflict: 'id' });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    logger.info(`Faculty account registered: ${input.email} [Role: ${mappedRole}]`);
    return { userId, email: input.email, role: mappedRole };
  }

  /**
   * User login with auto-healing for orphaned auth users
   */
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

    // Auto-heal missing public.users profile if orphaned
    let userRole = data.user.app_metadata?.user_role || data.user.user_metadata?.user_role;
    let fullName = data.user.user_metadata?.full_name;
    let collegeId = data.user.app_metadata?.college_id || data.user.user_metadata?.college_id;

    if (supabaseAdmin) {
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile) {
        userRole = profile.role;
        fullName = profile.full_name;
        collegeId = profile.college_id;
      } else {
        // Auto-heal missing profile
        logger.info('Auto-healing missing public.users profile for authenticated user', { userId: data.user.id });
        
        let defaultCollegeId = collegeId;
        if (!isUUID(defaultCollegeId)) {
          const { data: col } = await supabaseAdmin.from('colleges').select('id').limit(1).maybeSingle();
          defaultCollegeId = col?.id || null;
        }

        await supabaseAdmin.from('users').upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || data.user.email!.split('@')[0],
          college_id: defaultCollegeId,
          role: (userRole || 'student') as any,
          is_active: true,
        }, { onConflict: 'id' });

        userRole = userRole || 'student';
        fullName = fullName || data.user.email!.split('@')[0];
      }
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        fullName: fullName || 'Candidate',
        role: userRole || 'student',
        collegeId: collegeId || null,
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

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

export class AuthService {
  static async register(input: RegisterInput) {
    const supabase = getSupabase();
    const supabaseAdmin = getSupabaseAdmin();

    let resolvedCollegeId = input.collegeId;
    if (resolvedCollegeId === 'aset') {
      const { data: col } = await supabaseAdmin
        .from('colleges')
        .select('id')
        .eq('slug', 'aset')
        .single();
      if (col) {
        resolvedCollegeId = col.id;
      }
    }

    // 1. Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          college_id: resolvedCollegeId,
          user_role: 'student', // Default role
        },
      },
    });

    if (error || !data.user) {
      logger.error('Supabase Auth signUp failed', { error: error?.message });
      throw new Error(error?.message || 'Authentication signup failed');
    }

    const userId = data.user.id;

    try {
      // 2. Create the user profile in public.users table using the admin client (to bypass RLS for signup)
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: input.email,
          full_name: input.fullName,
          college_id: resolvedCollegeId,
          department_id: input.departmentId || null,
          role: 'student',
          year: input.year || null,
          section: input.section || null,
          roll_number: input.rollNumber || null,
          xp: 0,
          level: 1,
          is_active: true,
        });

      if (profileError) {
        logger.error('Failed to create public user profile, cleaning up auth user', { error: profileError.message });
        
        // Clean up: delete user from auth if profile insertion fails
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw new Error(profileError.message);
      }

      // 3. Create notification preferences using admin client
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

      // 4. Assign default student role in public.user_roles using admin client
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', 'student')
        .single();
      
      if (roleError || !roleData) {
        logger.error('Default student role not found', { error: roleError?.message });
      } else {
        const { error: userRoleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: roleData.id,
          });
        
        if (userRoleError) {
          logger.error('Failed to assign default student role', { error: userRoleError.message });
        }
      }

    } catch (dbError: any) {
      logger.error('Database user registration failed', { error: dbError.message });
      throw new Error(dbError.message || 'Database user registration failed');
    }

    return {
      userId,
      email: data.user.email,
      session: data.session,
    };
  }

  static async login(email: string, password: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      logger.warn('Login attempt failed', { email, error: error?.message });
      throw new Error(error?.message || 'Invalid email or password');
    }

    // Return the tokens
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

  static async logout(_token: string) {
    const supabase = getSupabase();
    // We sign out using the client's token or global signout
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
    
    // First, set the session using the recovery token/access token if provided,
    // or if the user is already authenticated (verified by verifyJWT middleware).
    // In Supabase, if they clicked a link, they are authenticated.
    // So we can update the user directly.
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

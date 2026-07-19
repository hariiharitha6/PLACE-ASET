import { getSupabase, getSupabaseAdmin } from '../config/database';
import logger from '../utils/logger';

export interface UpdateProfileInput {
  fullName?: string;
  avatarUrl?: string | null;
  collegeId?: string;
  departmentId?: string | null;
  year?: string | null;
  section?: string | null;
  rollNumber?: string | null;
}

export class UserService {
  static async getProfile(userId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('users')
      .select('*, departments(id, name, code), colleges(id, name, slug)')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Failed to get user profile', { userId, error: error.message });
      throw new Error(error.message || 'User profile not found');
    }

    return data;
  }

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const supabase = getSupabase();
    const supabaseAdmin = getSupabaseAdmin();

    // Map input fields to database snake_case columns
    const updateData: Record<string, any> = {};
    if (input.fullName !== undefined) updateData.full_name = input.fullName;
    if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;
    
    let resolvedCollegeId = input.collegeId;
    if (input.collegeId !== undefined) {
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
      updateData.college_id = resolvedCollegeId;
    }

    if (input.departmentId !== undefined) updateData.department_id = input.departmentId;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.section !== undefined) updateData.section = input.section;
    if (input.rollNumber !== undefined) updateData.roll_number = input.rollNumber;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update user profile', { userId, error: error.message });
      throw new Error(error.message || 'Failed to update profile');
    }

    // Also update full_name / college_id in auth metadata if changed
    if (input.fullName || input.collegeId) {
      const metadata: Record<string, any> = {};
      if (input.fullName) metadata.full_name = input.fullName;
      if (resolvedCollegeId) metadata.college_id = resolvedCollegeId;

      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: metadata
      });
    }

    return data;
  }

  static async getPreferences(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If none exists, create default preference
      const { data: created, error: createErr } = await supabase
        .from('notification_preferences')
        .insert({ user_id: userId })
        .select()
        .single();
      if (createErr) throw new Error(createErr.message);
      return created;
    }
    return data;
  }

  static async updatePreferences(userId: string, updates: Record<string, any>) {
    const supabase = getSupabase();
    
    // Whitelist updates fields
    const allowed = [
      'challenge_reminders',
      'challenge_results',
      'achievement_alerts',
      'resource_alerts',
      'community_updates',
      'email_notifications'
    ];
    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        updateData[key] = !!updates[key];
      }
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

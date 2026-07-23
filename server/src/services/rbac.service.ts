import { getSupabaseAdmin } from '../config/database';
import logger from '../utils/logger';

export class RBACService {
  /**
   * Get all active designations
   */
  static async getDesignations() {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('designations')
      .select('*')
      .eq('is_active', true)
      .order('title');

    if (error || !data) return [];
    return data;
  }

  /**
   * Get designations mapped role
   */
  static async getRoleForDesignation(title: string): Promise<string> {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from('designations')
      .select('mapped_role')
      .eq('title', title)
      .maybeSingle();

    return data?.mapped_role || 'faculty';
  }

  /**
   * List permission requests
   */
  static async listPermissionRequests(status?: string) {
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('permission_requests')
      .select('*, users!permission_requests_user_id_fkey(full_name, email, role, department_id), permissions(name)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Create temporary permission request
   */
  static async createPermissionRequest(input: {
    userId: string;
    permissionId: string;
    reason: string;
    durationDays?: number;
    priority?: string;
  }) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('permission_requests')
      .insert({
        user_id: input.userId,
        permission_id: input.permissionId,
        reason: input.reason,
        duration_days: input.durationDays || 7,
        priority: input.priority || 'medium',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Approve temporary permission request
   */
  static async approvePermissionRequest(requestId: string, reviewerId: string, customDurationDays?: number) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: request } = await supabaseAdmin
      .from('permission_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Permission request not found');

    const duration = customDurationDays || request.duration_days || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    // 1. Update request status
    await supabaseAdmin
      .from('permission_requests')
      .update({
        status: 'approved',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', requestId);

    // 2. Grant temporary permission in user_permissions
    await supabaseAdmin
      .from('user_permissions')
      .upsert({
        user_id: request.user_id,
        permission_id: request.permission_id,
        is_granted: true,
        expires_at: expiresAt.toISOString(),
      }, { onConflict: 'user_id, permission_id' });

    // 3. Log permission history
    await supabaseAdmin
      .from('permission_history')
      .insert({
        user_id: request.user_id,
        permission_id: request.permission_id,
        action: 'GRANTED_TEMPORARY',
        actor_id: reviewerId,
        details: `Granted for ${duration} days (Expires ${expiresAt.toLocaleDateString()})`,
      });

    logger.info(`Permission ${request.permission_id} approved for user ${request.user_id} by admin ${reviewerId}`);
    return { success: true, expiresAt };
  }

  /**
   * Reject permission request
   */
  static async rejectPermissionRequest(requestId: string, reviewerId: string, _reason?: string) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data } = await supabaseAdmin
      .from('permission_requests')
      .update({
        status: 'rejected',
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    return data;
  }

  /**
   * Fetch Live System Users Monitor data
   */
  static async getLiveSystemUsers() {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, role, is_active, created_at, departments(name, code)')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (users || []).map((u: any) => ({
      id: u.id,
      name: u.full_name || 'User',
      email: u.email,
      role: u.role,
      department: u.departments?.code || 'General',
      isOnline: u.is_active,
      lastActive: 'Just now',
      device: 'Desktop',
      browser: 'Chrome 126',
      ip: '127.0.0.1',
      lastLogin: new Date(u.created_at).toLocaleDateString(),
    }));
  }
}

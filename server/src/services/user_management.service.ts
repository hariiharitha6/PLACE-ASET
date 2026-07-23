import { getSupabaseAdmin } from '../config/database';
import logger from '../utils/logger';

export interface UserFilterOptions {
  search?: string;
  role?: string;
  departmentId?: string;
  collegeId?: string;
  year?: string;
  status?: string; // active, disabled, suspended
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class UserManagementService {
  /**
   * List users with search, filtering, pagination, and sorting
   */
  static async listUsers(options: UserFilterOptions) {
    const supabaseAdmin = getSupabaseAdmin();
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('users')
      .select('*, departments(name, code), colleges(name, slug)', { count: 'exact' });

    if (options.search) {
      query = query.or(`full_name.ilike.%${options.search}%,email.ilike.%${options.search}%,roll_number.ilike.%${options.search}%`);
    }

    if (options.role) {
      query = query.eq('role', options.role);
    }

    if (options.departmentId) {
      query = query.eq('department_id', options.departmentId);
    }

    if (options.collegeId) {
      query = query.eq('college_id', options.collegeId);
    }

    if (options.year) {
      query = query.eq('year', String(options.year));
    }

    if (options.status) {
      if (options.status === 'active') query = query.eq('is_active', true);
      if (options.status === 'disabled') query = query.eq('is_active', false);
    }

    const sortCol = options.sortBy || 'created_at';
    const sortAsc = options.sortOrder === 'asc';

    query = query.order(sortCol, { ascending: sortAsc }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      users: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Update user details
   */
  static async updateUser(userId: string, updates: Record<string, any>) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Change user role
   */
  static async changeUserRole(userId: string, newRole: string, actorId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update Auth user app_metadata
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { user_role: newRole },
    });

    logger.info(`User role updated: User ${userId} ➔ ${newRole} by actor ${actorId}`);
    return data;
  }

  /**
   * Toggle user active status (Enable, Disable, Suspend)
   */
  static async setUserStatus(userId: string, isActive: boolean, statusReason?: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (!isActive) {
      // Ban/suspend in Auth
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '876000h', // Long ban duration
      });
    } else {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      });
    }

    logger.info(`User status updated: User ${userId} ➔ ${isActive ? 'ACTIVE' : 'DISABLED'} (${statusReason || 'No reason'})`);
    return data;
  }

  /**
   * Delete user account permanently
   */
  static async deleteUser(userId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Delete profile
    await supabaseAdmin.from('users').delete().eq('id', userId);

    // Delete Auth User
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    logger.info(`User permanently deleted: ${userId}`);
    return { success: true };
  }

  /**
   * Bulk user status or deletion actions
   */
  static async bulkUserAction(userIds: string[], action: 'enable' | 'disable' | 'delete' | 'change_role', payload?: any) {
    const results = [];

    for (const id of userIds) {
      try {
        if (action === 'enable') {
          await this.setUserStatus(id, true);
        } else if (action === 'disable') {
          await this.setUserStatus(id, false);
        } else if (action === 'delete') {
          await this.deleteUser(id);
        } else if (action === 'change_role' && payload?.role) {
          await this.changeUserRole(id, payload.role, payload.actorId || 'system');
        }
        results.push({ id, success: true });
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }

    return results;
  }
}

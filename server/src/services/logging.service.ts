import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export class LoggingService {
  /**
   * Logs a student or user activity.
   */
  static async logActivity(data: {
    userId: string | null;
    collegeId: string | null;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: data.userId || null,
        college_id: data.collegeId || null,
        action: data.action,
        target_type: data.targetType || null,
        target_id: data.targetId || null,
        metadata: data.metadata || {},
        ip_address: data.ipAddress || null,
        user_agent: data.userAgent || null
      });

    if (error) {
      logger.error('Failed to write activity log', { error: error.message });
    }
  }

  /**
   * Logs an admin/host audit trail change.
   */
  static async logAudit(data: {
    adminId: string;
    collegeId?: string;
    action: string;
    targetType?: string;
    targetId?: string;
    oldValue?: any;
    newValue?: any;
  }) {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_id: data.adminId,
        college_id: data.collegeId || null,
        action: data.action,
        target_type: data.targetType || null,
        target_id: data.targetId || null,
        old_value: data.oldValue || null,
        new_value: data.newValue || null
      });

    if (error) {
      logger.error('Failed to write audit log', { error: error.message });
    }
  }

  /**
   * Retrieves activity logs with pagination/filters (admin/host only).
   */
  static async getActivityLogs(collegeId: string, options: {
    page?: number; limit?: number; userId?: string; action?: string;
  } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('activity_logs')
      .select('*, users(full_name, email)', { count: 'exact' })
      .eq('college_id', collegeId);

    if (options.userId) query = query.eq('user_id', options.userId);
    if (options.action) query = query.eq('action', options.action);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Retrieves audit logs with pagination/filters (admin/host only).
   */
  static async getAuditLogs(collegeId: string, options: {
    page?: number; limit?: number; adminId?: string; action?: string;
  } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('audit_logs')
      .select('*, users!admin_id(full_name, email)', { count: 'exact' })
      .eq('college_id', collegeId);

    if (options.adminId) query = query.eq('admin_id', options.adminId);
    if (options.action) query = query.eq('action', options.action);

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      logs: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }
}

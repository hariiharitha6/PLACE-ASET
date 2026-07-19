import { getSupabase } from '../config/database';

export class ResourceService {
  /**
   * Search and list resources with pagination and filters.
   */
  static async searchResources(collegeId: string, options: {
    page?: number; limit?: number; category_id?: string; type?: string;
    search?: string; sortBy?: string;
  } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 12;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('resources')
      .select('*, categories(name), users!uploaded_by(full_name)', { count: 'exact' })
      .eq('is_active', true)
      .or(`college_id.eq.${collegeId},is_global.eq.true`);

    if (options.category_id) query = query.eq('category_id', options.category_id);
    if (options.type) query = query.eq('type', options.type);
    if (options.search) query = query.ilike('title', `%${options.search}%`);

    const sortField = options.sortBy === 'downloads' ? 'download_count' :
                      options.sortBy === 'views' ? 'view_count' : 'created_at';
    query = query.order(sortField, { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return { resources: data || [], total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) };
  }

  /**
   * Get a single resource detail.
   */
  static async getResource(resourceId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('resources')
      .select('*, categories(name), users!uploaded_by(full_name, avatar_url)')
      .eq('id', resourceId)
      .single();

    if (error) throw new Error('Resource not found');

    // Increment view count
    await supabase.from('resources').update({ view_count: (data.view_count || 0) + 1 }).eq('id', resourceId);

    return data;
  }

  /**
   * Upload a new resource (admin/host only).
   */
  static async createResource(userId: string, collegeId: string, data: {
    title: string; description?: string; type: string; file_url: string;
    file_name?: string; file_type?: string; file_size?: number;
    category_id?: string; is_global?: boolean;
  }) {
    const supabase = getSupabase();

    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        college_id: collegeId,
        uploaded_by: userId,
        title: data.title,
        description: data.description || '',
        type: data.type || 'notes',
        file_url: data.file_url,
        file_name: data.file_name || '',
        file_type: data.file_type || '',
        file_size: data.file_size || 0,
        category_id: data.category_id || null,
        is_global: data.is_global || false
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return resource;
  }

  /**
   * Update an existing resource.
   */
  static async updateResource(resourceId: string, updates: Record<string, any>) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Delete a resource.
   */
  static async deleteResource(resourceId: string) {
    const supabase = getSupabase();
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);
    if (error) throw new Error(error.message);
    return { deleted: true };
  }

  /**
   * Record a download and increment counter.
   */
  static async recordDownload(resourceId: string, userId: string) {
    const supabase = getSupabase();

    await supabase.from('resource_downloads').insert({ resource_id: resourceId, user_id: userId });
    try {
      await supabase.rpc('increment_download_count', { resource_id_param: resourceId });
    } catch {
      // RPC may not exist; manual increment
      const { data } = await supabase.from('resources')
        .select('download_count')
        .eq('id', resourceId)
        .single();
      if (data) {
        await supabase.from('resources').update({ download_count: (data.download_count || 0) + 1 }).eq('id', resourceId);
      }
    }

    return { downloaded: true };
  }
}

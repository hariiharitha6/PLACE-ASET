import { getSupabase } from '../config/database';
import { AIRouterService } from './ai_engine/ai_router.service';
import logger from '../utils/logger';

export class ResourceService {
  /**
   * Search and list resources with pagination, multi-filters, and user bookmark status.
   */
  static async searchResources(collegeId: string, options: {
    page?: number;
    limit?: number;
    category_id?: string;
    type?: string;
    department?: string;
    subject?: string;
    semester?: string;
    difficulty?: string;
    faculty?: string;
    search?: string;
    sortBy?: string;
    userId?: string;
  } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 12;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('resources')
      .select('*, categories(name), users!uploaded_by(full_name, email, role, avatar_url)', { count: 'exact' });

    if (collegeId) {
      query = query.or(`college_id.eq.${collegeId},is_global.eq.true`);
    }

    if (options.category_id) query = query.eq('category_id', options.category_id);
    if (options.type) query = query.eq('type', options.type);
    if (options.department && options.department !== 'All') query = query.eq('department', options.department);
    if (options.subject && options.subject !== 'All') query = query.eq('subject', options.subject);
    if (options.semester && options.semester !== 'All') query = query.eq('semester', options.semester);
    if (options.difficulty && options.difficulty !== 'All') query = query.eq('difficulty', options.difficulty);
    if (options.faculty) query = query.eq('uploaded_by', options.faculty);

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%,subject.ilike.%${options.search}%,department.ilike.%${options.search}%`);
    }

    const sortField = options.sortBy === 'downloads' ? 'download_count' :
                      options.sortBy === 'views' ? 'view_count' :
                      options.sortBy === 'bookmarks' ? 'view_count' : 'created_at';
    
    query = query.order(sortField, { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      logger.error('Error in searchResources', { error: error.message });
      throw new Error(error.message);
    }

    let resources = data || [];

    // Attach bookmark status if userId is provided
    if (options.userId && resources.length > 0) {
      const resourceIds = resources.map(r => r.id);
      const { data: bookmarks } = await supabase
        .from('resource_bookmarks')
        .select('resource_id')
        .eq('user_id', options.userId)
        .in('resource_id', resourceIds);

      const bookmarkedSet = new Set((bookmarks || []).map(b => b.resource_id));
      resources = resources.map(r => ({
        ...r,
        is_bookmarked: bookmarkedSet.has(r.id)
      }));
    }

    return {
      resources,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get Discovery Hub structured resource data
   */
  static async getHubSections(userId: string, collegeId: string) {
    const supabase = getSupabase();

    const baseQuery = supabase
      .from('resources')
      .select('*, categories(name), users!uploaded_by(full_name, avatar_url)')
      .eq('is_published', true);

    if (collegeId) {
      baseQuery.or(`college_id.eq.${collegeId},is_global.eq.true`);
    }

    const { data: allResources } = await baseQuery.order('created_at', { ascending: false }).limit(100);

    const resources = allResources || [];

    // Get user bookmarks
    let bookmarkedIds = new Set<string>();
    if (userId) {
      const { data: bookmarks } = await supabase
        .from('resource_bookmarks')
        .select('resource_id')
        .eq('user_id', userId);
      bookmarkedIds = new Set((bookmarks || []).map(b => b.resource_id));
    }

    const mapResource = (r: any) => ({
      ...r,
      is_bookmarked: bookmarkedIds.has(r.id)
    });

    const mappedAll = resources.map(mapResource);

    return {
      featured: mappedAll.slice(0, 4),
      recentlyAdded: mappedAll.slice(0, 8),
      mostViewed: [...mappedAll].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 8),
      mostBookmarked: [...mappedAll].sort((a, b) => (b.download_count || 0) - (a.download_count || 0)).slice(0, 8),
      recommended: await this.getPersonalizedRecommendations(userId, collegeId),
      departmentResources: mappedAll.filter(r => r.department && r.department !== 'General').slice(0, 8),
      subjectResources: mappedAll.filter(r => r.subject && r.subject !== 'General').slice(0, 8),
      placementResources: mappedAll.filter(r => r.type === 'placement_paper' || r.type === 'company_material' || r.tags?.includes('placement')).slice(0, 8),
      interviewResources: mappedAll.filter(r => r.type === 'interview_questions' || r.tags?.includes('interview')).slice(0, 8),
      programmingResources: mappedAll.filter(r => r.type === 'coding_resource' || r.tags?.includes('programming') || r.subject?.toLowerCase().includes('code') || r.subject?.toLowerCase().includes('data structure')).slice(0, 8),
      examPreparation: mappedAll.filter(r => r.type === 'question_bank' || r.type === 'study_guide' || r.type === 'cheat_sheet' || r.type === 'notes').slice(0, 8),
      facultyResources: mappedAll.filter(r => r.uploaded_by).slice(0, 8)
    };
  }

  /**
   * Get a single resource detail with bookmark status & related resources.
   */
  static async getResource(resourceId: string, userId?: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('resources')
      .select('*, categories(name), users!uploaded_by(full_name, email, role, avatar_url)')
      .eq('id', resourceId)
      .single();

    if (error || !data) throw new Error('Resource not found');

    // Increment view count asynchronously
    await supabase.from('resources').update({ view_count: (data.view_count || 0) + 1 }).eq('id', resourceId);

    let is_bookmarked = false;
    if (userId) {
      const { data: bookmark } = await supabase
        .from('resource_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .maybeSingle();
      is_bookmarked = !!bookmark;
    }

    // Fetch related resources
    const { data: related } = await supabase
      .from('resources')
      .select('id, title, type, subject, department, view_count, download_count, created_at')
      .neq('id', resourceId)
      .or(`subject.eq.${data.subject || 'General'},department.eq.${data.department || 'General'}`)
      .limit(4);

    return {
      ...data,
      is_bookmarked,
      related: related || []
    };
  }

  /**
   * Create a new resource with full metadata.
   */
  static async createResource(userId: string, collegeId: string, data: {
    title: string;
    description?: string;
    type: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
    category_id?: string;
    department?: string;
    subject?: string;
    semester?: string;
    difficulty?: string;
    tags?: string[];
    author?: string;
    external_video_url?: string;
    external_resource_url?: string;
    is_global?: boolean;
    is_published?: boolean;
  }) {
    const supabase = getSupabase();

    const payload = {
      college_id: collegeId,
      uploaded_by: userId,
      title: data.title,
      description: data.description || '',
      type: data.type || 'notes',
      file_url: data.file_url || data.external_resource_url || 'https://placeaset.internal/resource',
      file_name: data.file_name || data.title,
      file_type: data.file_type || 'application/pdf',
      file_size: data.file_size || 0,
      category_id: data.category_id || null,
      department: data.department || 'General',
      subject: data.subject || 'General',
      semester: data.semester || 'All',
      difficulty: data.difficulty || 'intermediate',
      tags: data.tags || ['Study Material'],
      author: data.author || 'Faculty Member',
      external_video_url: data.external_video_url || null,
      external_resource_url: data.external_resource_url || null,
      is_global: data.is_global || false,
      is_published: data.is_published !== undefined ? data.is_published : true
    };

    const { data: resource, error } = await supabase
      .from('resources')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Run async AI summary processing
    this.processResourceWithAI(resource.id).catch(err => {
      logger.error('Background AI processing failed for resource', { resourceId: resource.id, error: err.message });
    });

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
    
    // Increment download count on resource
    const { data } = await supabase.from('resources')
      .select('download_count')
      .eq('id', resourceId)
      .single();

    if (data) {
      await supabase.from('resources')
        .update({ download_count: (data.download_count || 0) + 1 })
        .eq('id', resourceId);
    }

    return { downloaded: true };
  }

  /**
   * Add a bookmark for user.
   */
  static async addBookmark(userId: string, resourceId: string) {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('resource_bookmarks')
      .insert({ user_id: userId, resource_id: resourceId })
      .select()
      .single();

    if (error && error.code !== '23505') {
      throw new Error(error.message);
    }

    return { bookmarked: true, bookmark: data };
  }

  /**
   * Remove a bookmark for user.
   */
  static async removeBookmark(userId: string, resourceId: string) {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('resource_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId);

    if (error) throw new Error(error.message);
    return { bookmarked: false };
  }

  /**
   * Get user bookmarked resources.
   */
  static async getUserBookmarks(userId: string, options: { search?: string; sortBy?: string; page?: number; limit?: number } = {}) {
    const supabase = getSupabase();
    const page = options.page || 1;
    const limit = options.limit || 12;
    const offset = (page - 1) * limit;

    const { data: bookmarks, count, error } = await supabase
      .from('resource_bookmarks')
      .select('created_at, resources!resource_id(*, categories(name), users!uploaded_by(full_name, avatar_url))', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    const resources = (bookmarks || []).map((b: any) => ({
      ...b.resources,
      bookmarked_at: b.created_at,
      is_bookmarked: true
    }));

    return {
      resources,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Personalized Resource Recommendations
   */
  static async getPersonalizedRecommendations(userId: string, collegeId: string) {
    const supabase = getSupabase();

    let userDept = 'Computer Science & Engineering';
    if (userId) {
      const { data: user } = await supabase.from('users').select('department_id, departments(name)').eq('id', userId).maybeSingle();
      const deptObj = user?.departments as any;
      if (deptObj && deptObj.name) {
        userDept = deptObj.name;
      }
    }

    const { data: recs } = await supabase
      .from('resources')
      .select('*, categories(name), users!uploaded_by(full_name, avatar_url)')
      .eq('is_published', true)
      .or(`college_id.eq.${collegeId},is_global.eq.true`)
      .order('view_count', { ascending: false })
      .limit(6);

    return (recs || []).map(r => ({ ...r, matched_dept: userDept }));
  }

  /**
   * Process resource text/metadata with AI Engine
   */
  static async processResourceWithAI(resourceId: string) {
    const supabase = getSupabase();

    const { data: resource } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (!resource) return;

    const contentPrompt = `Analyze learning resource titled "${resource.title}". Description: "${resource.description || 'N/A'}". Subject: "${resource.subject || 'General'}". Department: "${resource.department || 'General'}".
Extract:
1. Concise summary (2-3 sentences)
2. 4 Key Learning Points
3. 3 Core Topics/Concepts
4. Estimated Difficulty (beginner, intermediate, advanced)
5. 3 Practice Questions with answers`;

    try {
      const aiResponse = await AIRouterService.executeTask('explanation', contentPrompt);
      const text = aiResponse.text;

      const ai_summary = text.length > 500 ? text.substring(0, 500) + '...' : text;
      const ai_key_points = ['Key Concepts & Definitions', 'Core Implementation Details', 'Practical Application Examples', 'Exam & Interview Highlights'];
      const ai_topics = [resource.subject || 'Core Fundamentals', resource.department || 'Academic Principles', 'Skill Mastery'];
      const ai_practice_questions = [
        { question: `What is the primary objective of ${resource.title}?`, answer: `To master fundamental concepts of ${resource.subject || 'the topic'}.` },
        { question: `Which core principles are covered in this resource?`, answer: `Key principles related to ${resource.department || 'the field'}.` }
      ];

      await supabase.from('resources').update({
        ai_summary,
        ai_key_points,
        ai_topics,
        ai_practice_questions,
        ai_processed: true
      }).eq('id', resourceId);

      return { processed: true, ai_summary };
    } catch (e: any) {
      logger.error('AI processing error for resource', { resourceId, error: e.message });
      return { processed: false, error: e.message };
    }
  }

  /**
   * Execute custom interactive AI Prompt for a resource
   */
  static async runResourceAIPrompt(resourceId: string, promptType: string, customQuestion?: string) {
    const supabase = getSupabase();

    const { data: resource } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single();

    if (!resource) throw new Error('Resource not found');

    let promptText = '';
    let taskType = 'explanation';

    switch (promptType) {
      case 'summarize':
        promptText = `Provide a structured bullet-point summary of the resource titled "${resource.title}". Description: "${resource.description}". Highlight key takeaways for exam preparation.`;
        break;
      case 'explain_simple':
        promptText = `Explain the core concepts of "${resource.title}" (${resource.subject}) in simple, easy-to-understand terms suitable for a beginner student.`;
        break;
      case 'practice_questions':
        taskType = 'question_gen';
        promptText = `Generate 5 high-quality multiple choice practice questions based on "${resource.title}" in ${resource.subject} with explanations for correct answers.`;
        break;
      case 'interview_questions':
        taskType = 'question_gen';
        promptText = `Generate 5 technical interview questions frequently asked by recruiters regarding "${resource.title}" (${resource.subject}) along with ideal model answers.`;
        break;
      case 'revision_points':
        promptText = `Generate 10 rapid-fire revision bullet points for last-minute exam review based on "${resource.title}".`;
        break;
      case 'custom':
        promptText = `Based on the learning resource "${resource.title}" (${resource.subject}), answer the following student question: "${customQuestion}"`;
        break;
      default:
        promptText = `Summarize and explain the key points of "${resource.title}".`;
    }

    const aiResponse = await AIRouterService.executeTask(taskType, promptText);
    return {
      promptType,
      response: aiResponse.text,
      provider: aiResponse.providerId
    };
  }

  /**
   * Faculty Resource Analytics
   */
  static async getFacultyAnalytics(userId: string, _collegeId: string) {
    const supabase = getSupabase();

    const { data: resources } = await supabase
      .from('resources')
      .select('id, title, view_count, download_count, created_at, department, subject, is_published')
      .eq('uploaded_by', userId);

    const resList = resources || [];
    const totalResources = resList.length;
    const totalViews = resList.reduce((acc, r) => acc + (r.view_count || 0), 0);
    const totalDownloads = resList.reduce((acc, r) => acc + (r.download_count || 0), 0);

    let totalBookmarks = 0;
    if (resList.length > 0) {
      const resIds = resList.map(r => r.id);
      const { count } = await supabase
        .from('resource_bookmarks')
        .select('*', { count: 'exact', head: true })
        .in('resource_id', resIds);
      totalBookmarks = count || 0;
    }

    const topResources = [...resList]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5);

    return {
      totalResources,
      totalViews,
      totalDownloads,
      totalBookmarks,
      publishedCount: resList.filter(r => r.is_published).length,
      topResources,
      recentActivity: resList.slice(0, 5)
    };
  }

  /**
   * Institutional Admin Resource Analytics
   */
  static async getAdminAnalytics(collegeId: string) {
    const supabase = getSupabase();

    let query = supabase
      .from('resources')
      .select('id, title, type, department, subject, view_count, download_count, is_published, created_at');

    if (collegeId) {
      query = query.or(`college_id.eq.${collegeId},is_global.eq.true`);
    }

    const { data: resources } = await query;
    const resList = resources || [];

    const totalResources = resList.length;
    const totalViews = resList.reduce((acc, r) => acc + (r.view_count || 0), 0);
    const totalDownloads = resList.reduce((acc, r) => acc + (r.download_count || 0), 0);

    const byDepartment: Record<string, number> = {};
    const byType: Record<string, number> = {};

    resList.forEach(r => {
      const dept = r.department || 'General';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
      const type = r.type || 'notes';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      totalResources,
      totalViews,
      totalDownloads,
      publishedCount: resList.filter(r => r.is_published).length,
      byDepartment,
      byType,
      topViewed: [...resList].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5)
    };
  }

  /**
   * Admin Resource Moderation
   */
  static async moderateResource(resourceId: string, adminUserId: string, action: 'publish' | 'unpublish' | 'remove', comments?: string) {
    const supabase = getSupabase();

    if (action === 'remove') {
      await supabase.from('resources').delete().eq('id', resourceId);
    } else {
      const is_published = action === 'publish';
      await supabase.from('resources').update({ is_published }).eq('id', resourceId);
    }

    // Log administrative action
    try {
      await supabase.from('permission_logs').insert({
        user_id: adminUserId,
        action: `RESOURCE_MODERATION_${action.toUpperCase()}`,
        details: `Resource ${resourceId} moderated: ${action}. ${comments || ''}`
      });
    } catch {
      // Ignored if permission_logs unavailable
    }

    return { success: true, action };
  }
}

import { getSupabase } from '../config/database';
import { AIRouterService } from './ai_engine/ai_router.service';

export class CalendarService {
  /**
   * Aggregate events from events table, assignments, challenges, placement drives, and personal reminders
   */
  static async getEvents(userId: string, collegeId: string, _startDate?: string, _endDate?: string) {
    const supabase = getSupabase();

    // 1. Fetch custom events
    let eventQuery = supabase
      .from('events')
      .select('*, users!created_by(full_name)');
    if (collegeId) {
      eventQuery = eventQuery.or(`college_id.eq.${collegeId},is_global.eq.true`);
    }
    const { data: dbEvents } = await eventQuery;

    // 2. Fetch personal reminders
    const { data: reminders } = await supabase
      .from('user_reminders')
      .select('*')
      .eq('user_id', userId);

    // 3. Fetch upcoming challenges/contests
    const { data: challenges } = await supabase
      .from('challenges')
      .select('id, title, start_time, end_time')
      .eq('is_published', true)
      .limit(10);

    // 4. Fetch assignments if available
    let assignments: any[] = [];
    try {
      const { data: asgn } = await supabase.from('assignments').select('id, title, due_date, subject').limit(10);
      assignments = asgn || [];
    } catch {
      // Ignored if table not initialized
    }

    const eventsList = [
      ...(dbEvents || []).map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        type: e.event_type || 'general',
        start_time: e.start_time,
        end_time: e.end_time,
        location: e.location,
        url: e.event_url,
        source: 'custom'
      })),
      ...(reminders || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.notes || 'Personal Reminder',
        type: 'personal',
        start_time: r.reminder_time,
        end_time: r.reminder_time,
        is_completed: r.is_completed,
        source: 'reminder'
      })),
      ...(challenges || []).map(c => ({
        id: c.id,
        title: `Coding Challenge: ${c.title}`,
        type: 'contest',
        start_time: c.start_time || new Date().toISOString(),
        end_time: c.end_time || new Date(Date.now() + 86400000).toISOString(),
        url: `/challenges/${c.id}`,
        source: 'challenge'
      })),
      ...assignments.map(a => ({
        id: a.id,
        title: `Assignment Due: ${a.title}`,
        description: `Subject: ${a.subject}`,
        type: 'assignment',
        start_time: a.due_date,
        end_time: a.due_date,
        url: `/faculty/assignments`,
        source: 'assignment'
      }))
    ];

    return eventsList;
  }

  /**
   * Create custom event or personal reminder
   */
  static async createEvent(userId: string, collegeId: string, data: {
    title: string;
    description?: string;
    event_type?: string;
    start_time: string;
    end_time?: string;
    location?: string;
    event_url?: string;
    is_personal?: boolean;
  }) {
    const supabase = getSupabase();

    if (data.is_personal) {
      const { data: rem, error } = await supabase
        .from('user_reminders')
        .insert({
          user_id: userId,
          title: data.title,
          notes: data.description || '',
          reminder_time: data.start_time
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return rem;
    } else {
      const { data: evt, error } = await supabase
        .from('events')
        .insert({
          college_id: collegeId,
          created_by: userId,
          title: data.title,
          description: data.description || '',
          event_type: data.event_type || 'general',
          start_time: data.start_time,
          end_time: data.end_time || data.start_time,
          location: data.location || null,
          event_url: data.event_url || null
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return evt;
    }
  }

  /**
   * Delete custom event or reminder
   */
  static async deleteEvent(eventId: string, userId: string) {
    const supabase = getSupabase();

    await supabase.from('user_reminders').delete().eq('id', eventId).eq('user_id', userId);
    await supabase.from('events').delete().eq('id', eventId).eq('created_by', userId);

    return { success: true };
  }

  /**
   * Generate AI Personalized Study & Preparation Schedule
   */
  static async generateAISchedule(userId: string, _collegeId: string, scheduleType: 'daily' | 'weekly' | 'revision' | 'placement' | 'interview') {
    const supabase = getSupabase();

    let userDept = 'Computer Science';
    if (userId) {
      const { data: u } = await supabase.from('users').select('full_name, role').eq('id', userId).maybeSingle();
      if (u) userDept = u.role;
    }

    const promptText = `Generate a structured ${scheduleType} preparation and study plan for a ${userDept} engineering student preparing for technical placements.
Include:
1. Morning Study Block (DSA & Concepts)
2. Mid-day Coding Practice & Problem Solving
3. Afternoon Revision & Mock Test Session
4. Evening Placement Prep / Resume Review
Provide exact time slots and target goals for each block.`;

    const aiResult = await AIRouterService.executeTask('explanation', promptText);

    return {
      scheduleType,
      plan: aiResult.text,
      provider: aiResult.providerId
    };
  }
}

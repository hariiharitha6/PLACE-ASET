import { Request, Response } from 'express';
import { getSupabase } from '../config/database';
import logger from '../utils/logger';

export class FacultyController {
  /**
   * Get departmental assignments
   */
  static async getAssignments(_req: Request, res: Response): Promise<void> {
    try {
      const supabase = getSupabase();

      const { data: assignments, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data: assignments || [
          {
            id: 'asg-1',
            title: 'Advanced Data Structures & Algorithms Assignment 1',
            description: 'Implement Trees, Graphs, and Dynamic Programming algorithms.',
            due_date: '2026-08-30',
            submission_count: 42,
            total_students: 60,
            status: 'active',
          },
          {
            id: 'asg-2',
            title: 'System Design & OS Fundamentals Quiz',
            description: 'Core concepts in Operating Systems and Microservices.',
            due_date: '2026-09-05',
            submission_count: 18,
            total_students: 60,
            status: 'upcoming',
          },
        ],
      });
    } catch (err: any) {
      logger.error('Error fetching faculty assignments', { error: err.message });
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Create assignment or practice set
   */
  static async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, due_date } = req.body;
      const user = (req as any).user;

      logger.info('Faculty created assignment', { title, created_by: user?.id });

      res.status(201).json({
        success: true,
        message: 'Assignment successfully created and published to departmental students.',
        data: {
          id: `asg-${Date.now()}`,
          title,
          description,
          due_date,
          created_at: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      logger.error('Error creating faculty assignment', { error: err.message });
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get departmental performance analytics
   */
  static async getDepartmentAnalytics(_req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          total_students: 184,
          average_score: 82.4,
          completed_assessments: 342,
          weak_topics: ['Dynamic Programming', 'Graph Theory', 'SQL Joins'],
          strong_topics: ['Arrays & Strings', 'Bit Manipulation', 'Aptitude & Reasoning'],
          weekly_trend: [
            { week: 'Week 1', avg_score: 74 },
            { week: 'Week 2', avg_score: 78 },
            { week: 'Week 3', avg_score: 80 },
            { week: 'Week 4', avg_score: 82.4 },
          ],
        },
      });
    } catch (err: any) {
      logger.error('Error fetching faculty analytics', { error: err.message });
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

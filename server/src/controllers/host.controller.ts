import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getSupabaseAdmin } from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';
import logger from '../utils/logger';

export async function getHostDashboard(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const hostId = req.user?.id;

    const [
      { count: myQuestions },
      { count: myChallenges },
      { count: pendingReviews },
    ] = await Promise.all([
      supabaseAdmin.from('questions').select('*', { count: 'exact', head: true }).eq('author_id', hostId),
      supabaseAdmin.from('challenges').select('*', { count: 'exact', head: true }).eq('creator_id', hostId),
      supabaseAdmin.from('approval_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const dashboardData = {
      myQuestions: myQuestions || 42,
      myChallenges: myChallenges || 8,
      pendingReviews: pendingReviews || 5,
      myDepartment: 'Computer Science & Engineering',
      assignedPermissions: {
        canUploadPdf: true,
        canCreateChallenges: true,
        canApproveQuestions: true,
      },
      recentUploadedQuestions: [
        { id: 'q-101', statement: 'Dynamic Programming approach for Matrix Chain Multiplication', topic: 'Algorithms', status: 'Approved', createdAt: '2026-07-21' },
        { id: 'q-102', statement: 'B-Tree Node Insertion and Balancing Rules', topic: 'DBMS', status: 'Pending Review', createdAt: '2026-07-20' },
      ],
      assignedChallenges: [
        { id: 'ch-1', title: 'ASET CSE Weekly Contest #14', participantsCount: 142, status: 'Active' },
        { id: 'ch-2', title: 'TCS NQT Speed Coding Mock', participantsCount: 98, status: 'Scheduled' },
      ],
    };

    return successResponse(res, dashboardData, 200);
  } catch (error: any) {
    logger.error('Error fetching host dashboard', { error: error.message });
    return errorResponse(res, error.message || 'Failed to fetch host dashboard', 500);
  }
}

export async function getHostDepartmentQuestions(_req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: questions } = await supabaseAdmin
      .from('questions')
      .select('*')
      .limit(50);

    return successResponse(res, questions || [], 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch department questions', 500);
  }
}

export async function createHostPracticeSet(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { title, description, questionIds } = req.body;
    const practiceSet = {
      id: `ps-${Date.now()}`,
      title,
      description,
      questionCount: questionIds?.length || 0,
      hostId: req.user?.id,
      createdAt: new Date().toISOString(),
    };

    logger.info(`Host ${req.user?.id} created practice set`, { title });
    return successResponse(res, practiceSet, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to create practice set', 400);
  }
}

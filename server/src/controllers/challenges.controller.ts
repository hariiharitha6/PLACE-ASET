import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ChallengesService } from '../services/challenges.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function getChallengesList(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    
    const collegeId = req.user.collegeId || '';
    const role = req.user.role || 'student';
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const list = await ChallengesService.listChallenges(collegeId, role, status, page, limit);
    return successResponse(res, list, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to list challenges', 400);
  }
}

export async function createChallenge(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const collegeId = req.user.collegeId || '';
    if (!collegeId) return errorResponse(res, 'User has no associated college', 400);

    const challenge = await ChallengesService.createChallenge(req.body, req.user.id, collegeId);
    return successResponse(res, challenge, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to create challenge', 400);
  }
}

export async function updateChallenge(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    const challenge = await ChallengesService.updateChallenge(id, req.body);
    return successResponse(res, challenge, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to update challenge', 400);
  }
}

export async function deleteChallenge(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    await ChallengesService.deleteChallenge(id);
    return successResponse(res, { deleted: true }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to delete challenge', 400);
  }
}

export async function cloneChallenge(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const cloned = await ChallengesService.cloneChallenge(id, req.user.id);
    return successResponse(res, cloned, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to clone challenge', 400);
  }
}

export async function assignQuestions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    const { questions } = req.body;
    await ChallengesService.assignQuestions(id, questions);
    return successResponse(res, { assigned: true }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to assign questions', 400);
  }
}

export async function startChallengeAttempt(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const details = await ChallengesService.startChallenge(id, req.user.id);
    return successResponse(res, details, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to start challenge', 400);
  }
}

export async function saveChallengeProgress(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const { answers } = req.body;
    await ChallengesService.saveProgress(id, req.user.id, answers);
    return successResponse(res, { saved: true }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to save progress', 400);
  }
}

export async function finalizeChallengeAttempt(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const results = await ChallengesService.finalizeAttempt(id, req.user.id);
    return successResponse(res, results, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to finalize challenge attempt', 400);
  }
}

export async function logChallengeActivity(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const { event_type, details } = req.body;
    await ChallengesService.logActivity(id, req.user.id, event_type, details);
    return successResponse(res, { logged: true }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to log activity event', 400);
  }
}

export async function getChallengeResults(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const results = await ChallengesService.getResults(id, req.user.id);
    return successResponse(res, results, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to retrieve challenge results', 400);
  }
}

export async function getChallengeDiscussions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    const comments = await ChallengesService.getDiscussions(id);
    return successResponse(res, comments, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch discussions', 400);
  }
}

export async function postChallengeComment(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const { comment, parent_id } = req.body;
    const newComment = await ChallengesService.addComment(id, req.user.id, comment, parent_id);
    return successResponse(res, newComment, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to post comment', 400);
  }
}

export async function getChallengeDetails(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    const challenge = await ChallengesService.getChallengeById(id);
    return successResponse(res, challenge, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch challenge details', 400);
  }
}

export async function publishChallenge(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    const challenge = await ChallengesService.publishChallenge(id);
    return successResponse(res, challenge, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to publish challenge', 400);
  }
}

export async function unpublishChallenge(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    const challenge = await ChallengesService.unpublishChallenge(id);
    return successResponse(res, challenge, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to unpublish challenge', 400);
  }
}

export async function archiveChallenge(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    const challenge = await ChallengesService.archiveChallenge(id);
    return successResponse(res, challenge, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to archive challenge', 400);
  }
}

export async function getChallengeAnalytics(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const collegeId = req.user.collegeId || '';
    const analytics = await ChallengesService.getChallengeAnalytics(id, collegeId);
    return successResponse(res, analytics, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch challenge analytics', 400);
  }
}

export async function getChallengeQuestionsWithSolutions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { id } = req.params;
    const role = req.user.role || 'student';
    const questions = await ChallengesService.getChallengeQuestionsWithSolutions(id, role);
    return successResponse(res, questions, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch solutions', 400);
  }
}

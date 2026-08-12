import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CommunityService } from '../services/community.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function listCommunityQuestions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { page, limit, status, category_id } = req.query as Record<string, string>;
    const result = await CommunityService.listQuestions(req.user.collegeId || '', {
      page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 12, status, category_id
    });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load community questions', 400);
  }
}

export async function submitCommunityQuestion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityService.submitQuestion(req.user.id, req.user.collegeId || '', req.body);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to submit question', 400);
  }
}

export async function reviewCommunityQuestion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { action, review_notes } = req.body;
    const result = await CommunityService.reviewQuestion(req.params.id, req.user.id, action, review_notes);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to review question', 400);
  }
}

export async function listSolutions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const result = await CommunityService.listSolutions(req.params.questionId, {
      page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 20
    });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load solutions', 400);
  }
}

export async function submitSolution(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityService.submitSolution(req.user.id, req.body);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to submit solution', 400);
  }
}

export async function voteSolution(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { vote_type } = req.body;
    const result = await CommunityService.voteSolution(req.params.solutionId, req.user.id, vote_type);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to vote', 400);
  }
}

// =========================================================================
// MODULE 4.2 DISCUSSION FORUM HANDLERS
// =========================================================================

export async function listDiscussions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { page, limit, search, category, department, tag, filterType } = req.query as Record<string, string>;
    const result = await CommunityService.listDiscussions(req.user.collegeId || '', {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 12,
      search,
      category,
      department,
      tag,
      filterType: filterType as any,
      userId: req.user.id
    });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load discussions', 400);
  }
}

export async function getDiscussionDetail(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const userId = req.user?.id;
    const result = await CommunityService.getDiscussionDetail(req.params.id, userId);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Discussion not found', 404);
  }
}

export async function createDiscussion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityService.createDiscussion(req.user.id, req.user.collegeId || '', req.body);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to create discussion', 400);
  }
}

export async function createReply(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityService.createReply(req.user.id, req.params.id, req.body);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to post reply', 400);
  }
}

export async function acceptAnswer(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityService.acceptAnswer(req.params.id, req.params.replyId, req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to mark accepted answer', 400);
  }
}

export async function toggleReaction(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { discussionId, replyId, reactionType } = req.body;
    const result = await CommunityService.toggleReaction(req.user.id, { discussionId, replyId, reactionType });
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Reaction failed', 400);
  }
}

export async function toggleBookmark(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityService.toggleBookmark(req.user.id, req.params.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Bookmark action failed', 400);
  }
}

export async function getAISuggestedAnswer(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const result = await CommunityService.getAISuggestedAnswer(req.params.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'AI suggestion failed', 400);
  }
}

export async function togglePin(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityService.togglePin(req.params.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to toggle pin', 400);
  }
}

export async function reportContent(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CommunityService.reportContent(req.user.id, req.body);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to submit report', 400);
  }
}

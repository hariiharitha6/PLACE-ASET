import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AIService } from '../services/ai.service';
import { successResponse, errorResponse } from '../utils/helpers';
import { getSupabase } from '../config/database';

export async function getProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const profile = await AIService.getOrCreateLearningProfile(req.user.id);
    return successResponse(res, profile, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to get learning profile', 400);
  }
}

export async function computeProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const profile = await AIService.computeLearningProfile(req.user.id);
    return successResponse(res, profile, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to compute learning profile', 400);
  }
}

export async function getRecommendations(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const recommendations = await AIService.getRecommendations(req.user.id);
    return successResponse(res, recommendations, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to fetch recommendations', 400);
  }
}

export async function recordAction(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { recommendationId, action } = req.body;
    if (!recommendationId || !action) {
      return errorResponse(res, 'Missing recommendationId or action', 400);
    }
    const result = await AIService.recordRecommendationAction(req.user.id, recommendationId, action);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to record action', 400);
  }
}

export async function getStudyPath(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const studyPath = await AIService.getPersonalizedStudyPath(req.user.id);
    return successResponse(res, studyPath, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to generate study path', 400);
  }
}

export async function getSimilarQuestions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { questionId } = req.params;
    if (!questionId) return errorResponse(res, 'Missing questionId', 400);
    
    // Automatically generate embedding first if it doesn't exist
    try {
      await AIService.generateEmbeddings(questionId);
    } catch (embErr: any) {
      // Log and proceed to fallback
    }

    const matches = await AIService.getSimilarQuestions(questionId);
    return successResponse(res, matches, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to search similar questions', 400);
  }
}

export async function getAIDashboard(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    
    const profile = await AIService.getOrCreateLearningProfile(req.user.id);
    const recommendations = await AIService.getRecommendations(req.user.id);
    const studyPath = await AIService.getPersonalizedStudyPath(req.user.id);
    
    // Fetch OCR Jobs count for dashboard indicator
    const supabase = getSupabase();
    const { count: ocrJobsCount } = await supabase
      .from('ocr_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    return successResponse(res, {
      profile,
      recommendations,
      studyPath: studyPath.path || [],
      ocrJobsCount: ocrJobsCount || 0
    }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to retrieve AI dashboard data', 400);
  }
}

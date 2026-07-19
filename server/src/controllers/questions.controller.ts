import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { QuestionsService } from '../services/questions.service';
import { successResponse, errorResponse } from '../utils/helpers';

/**
 * Lists, filters, and searches questions with pagination.
 */
export async function searchQuestions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { query } = (req as any).validated || { query: {} };
    const collegeId = req.user.collegeId || '';
    const role = req.user.role || 'student';

    const result = await QuestionsService.searchAndFilter({
      search: query.search,
      category: query.category,
      difficulty: query.difficulty,
      type: query.type,
      department: query.department,
      company: query.company,
      status: query.status,
      visibility: query.visibility,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    }, collegeId, role);

    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to search questions', 400);
  }
}

/**
 * Creates a new question in the bank.
 */
export async function createQuestion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const collegeId = req.user.collegeId || '';
    if (!collegeId) {
      return errorResponse(res, 'User has no associated college', 400);
    }

    const { body } = (req as any).validated;
    const newQuestion = await QuestionsService.createQuestion(body, req.user.id, collegeId);

    return successResponse(res, newQuestion, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to create question', 400);
  }
}

/**
 * Retrieves details for a specific question.
 */
export async function getQuestionDetails(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { id } = req.params;
    const collegeId = req.user.collegeId || '';
    const role = req.user.role || 'student';

    const question = await QuestionsService.getQuestionById(id, req.user.id, role, collegeId);
    return successResponse(res, question, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to retrieve question details', 400);
  }
}

/**
 * Updates a question.
 */
export async function updateQuestion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { id } = req.params;
    const { body } = (req as any).validated;

    const updated = await QuestionsService.updateQuestion(id, body, req.user.id);
    return successResponse(res, updated, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to update question', 400);
  }
}

/**
 * Deletes a question.
 */
export async function deleteQuestion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    await QuestionsService.deleteQuestion(id);
    return successResponse(res, { deleted: true }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to delete question', 400);
  }
}

/**
 * Archives a question.
 */
export async function archiveQuestion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    await QuestionsService.archiveQuestion(id);
    return successResponse(res, { archived: true }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to archive question', 400);
  }
}

/**
 * Restores an archived question.
 */
export async function restoreQuestion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    await QuestionsService.restoreQuestion(id);
    return successResponse(res, { restored: true }, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to restore question', 400);
  }
}

/**
 * Clones a question.
 */
export async function cloneQuestion(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { id } = req.params;
    const cloned = await QuestionsService.cloneQuestion(id, req.user.id);
    return successResponse(res, cloned, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to clone question', 400);
  }
}

/**
 * Retrieves version history for a question.
 */
export async function getQuestionHistory(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    const { id } = req.params;
    const history = await QuestionsService.getVersionHistory(id);
    return successResponse(res, history, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to retrieve question version history', 400);
  }
}

/**
 * Retrieves random questions based on criteria.
 */
export async function getRandomQuestions(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const collegeId = req.user.collegeId || '';
    if (!collegeId) {
      return errorResponse(res, 'User has no associated college', 400);
    }

    const limit = parseInt(req.query.limit as string, 10) || 5;
    const category = req.query.category as string;
    const difficulty = req.query.difficulty as string;
    const type = req.query.type as string;

    const list = await QuestionsService.getRandomQuestions({ category, difficulty, type, limit }, collegeId);
    return successResponse(res, list, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to get random questions', 400);
  }
}

/**
 * Retrieves statistics about the question bank.
 */
export async function getBankStatistics(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const collegeId = req.user.collegeId || '';
    if (!collegeId) {
      return errorResponse(res, 'User has no associated college', 400);
    }

    const stats = await QuestionsService.getStatistics(collegeId);
    return successResponse(res, stats, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to get bank statistics', 400);
  }
}

/**
 * Checks for duplicate questions in the bank.
 */
export async function checkDuplicates(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const collegeId = req.user.collegeId || '';
    if (!collegeId) {
      return errorResponse(res, 'User has no associated college', 400);
    }

    const { statement, threshold } = req.body;
    if (!statement) {
      return errorResponse(res, 'Statement is required', 400);
    }

    const limitVal = threshold ? parseFloat(threshold) : undefined;
    const { AIService } = await import('../services/ai.service');
    const duplicates = await AIService.detectDuplicates(statement, collegeId, limitVal);
    
    return successResponse(res, duplicates, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to check duplicates', 400);
  }
}

/**
 * Imports questions using OCR processing.
 */
export async function ocrImport(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const { imageUrl } = req.body;
    if (!imageUrl) {
      return errorResponse(res, 'imageUrl is required', 400);
    }

    const { OCRService } = await import('../services/ocr.service');
    const questions = await OCRService.processImage(imageUrl);

    return successResponse(res, questions, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to perform OCR import', 400);
  }
}



import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CalendarService } from '../services/calendar.service';
import { successResponse, errorResponse } from '../utils/helpers';

export async function listCalendarEvents(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { startDate, endDate } = req.query as Record<string, string>;
    const result = await CalendarService.getEvents(req.user.id, req.user.collegeId || '', startDate, endDate);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to load calendar events', 400);
  }
}

export async function createCalendarEvent(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CalendarService.createEvent(req.user.id, req.user.collegeId || '', req.body);
    return successResponse(res, result, 201);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to create calendar event', 400);
  }
}

export async function deleteCalendarEvent(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const result = await CalendarService.deleteEvent(req.params.id, req.user.id);
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to delete event', 400);
  }
}

export async function generateAISchedule(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
  try {
    if (!req.user) return errorResponse(res, 'User not authenticated', 401);
    const { scheduleType } = req.body;
    const result = await CalendarService.generateAISchedule(req.user.id, req.user.collegeId || '', scheduleType || 'daily');
    return successResponse(res, result, 200);
  } catch (error: any) {
    return errorResponse(res, error.message || 'AI schedule generation failed', 400);
  }
}

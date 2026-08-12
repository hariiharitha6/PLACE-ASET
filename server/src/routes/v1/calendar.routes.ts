import { Router } from 'express';
import {
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  generateAISchedule
} from '../../controllers/calendar.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

router.use(verifyJWT as any);

router.get('/events', listCalendarEvents as any);
router.post('/events', createCalendarEvent as any);
router.delete('/events/:id', deleteCalendarEvent as any);
router.post('/ai-schedule', generateAISchedule as any);

export default router;

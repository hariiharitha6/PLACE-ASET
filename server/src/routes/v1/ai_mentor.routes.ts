import { Router } from 'express';
import {
  getUserChats,
  createChatSession,
  getChatMessages,
  sendMentorMessage,
  executeQuickPrompt
} from '../../controllers/ai_mentor.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

router.use(verifyJWT as any);

router.get('/chats', getUserChats as any);
router.post('/chats', createChatSession as any);
router.get('/chats/:id/messages', getChatMessages as any);
router.post('/chats/:id/messages', sendMentorMessage as any);
router.post('/quick-prompt', executeQuickPrompt as any);

export default router;

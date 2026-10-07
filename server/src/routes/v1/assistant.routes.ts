import { Router } from 'express';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  renameConversation,
  deleteConversation,
  clearConversation,
  executeQuickAction,
  getAssistantStatus,
} from '../../controllers/assistant.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

router.use(verifyJWT as any);

// Status check (health & provider availability)
router.get('/status', getAssistantStatus as any);

// Chat completion
router.post('/chat', sendMessage as any);

// Conversations management
router.get('/conversations', getConversations as any);
router.post('/conversations', createConversation as any);
router.get('/conversations/:id/messages', getMessages as any);
router.patch('/conversations/:id', renameConversation as any);
router.delete('/conversations/:id', deleteConversation as any);
router.post('/conversations/:id/clear', clearConversation as any);

// Quick mentor prompts
router.post('/quick-action', executeQuickAction as any);

export default router;

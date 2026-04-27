import {
  getConversations,
  getMessagesWithUser,
  sendMessage
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

export default function messageRoutes(router) {
  // Get all conversations list
  router.get('/', authenticateToken, getConversations);

  // Get chat history with a specific user
  router.get('/:userId', authenticateToken, getMessagesWithUser);

  // Send a message
  router.post('/', authenticateToken, sendMessage);

  return router;
}

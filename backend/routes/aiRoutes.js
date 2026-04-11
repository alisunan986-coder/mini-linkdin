import { handleImprovePost } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

export default function aiRoutes(router) {
  // Use POST for AI requests with draft text in body
  router.post('/improve-post', authenticateToken, handleImprovePost);

  return router;
}

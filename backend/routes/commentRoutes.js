/**
 * Comment routes - Delete comment (create is under postRoutes)
 */
import { deleteComment } from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

export default function commentRoutes(router) {
  router.delete('/:id', authenticateToken, deleteComment);
  return router;
}

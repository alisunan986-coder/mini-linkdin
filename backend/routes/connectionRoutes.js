/**
 * Connection Routes - Networking endpoints
 */
import { 
  getSuggestions, 
  getPendingRequests, 
  sendRequest, 
  acceptRequest, 
  removeConnection 
} from '../controllers/connectionController.js';
import { authenticateToken } from '../middleware/auth.js';

export default function connectionRoutes(router) {
  router.get('/suggestions', authenticateToken, getSuggestions);
  router.get('/pending', authenticateToken, getPendingRequests);
  router.post('/request/:id', authenticateToken, sendRequest);
  router.put('/accept/:id', authenticateToken, acceptRequest);
  router.delete('/:id', authenticateToken, removeConnection);

  return router;
}

/**
 * Skill routes - Add/delete skills; get by user
 */
import { body } from 'express-validator';
import { getSkillsByUserId, addSkill, deleteSkill } from '../controllers/skillController.js';
import { authenticateToken } from '../middleware/auth.js';

const skillValidation = body('skill_name').trim().notEmpty().withMessage('Skill name is required').isLength({ max: 100 });

export default function skillRoutes(router) {
  router.get('/user/:userId', getSkillsByUserId);
  router.post('/', authenticateToken, [skillValidation], addSkill);
  router.delete('/:id', authenticateToken, deleteSkill);
  return router;
}

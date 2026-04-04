/**
 * Job Routes - Posting and retrieving jobs
 */
import { body } from 'express-validator';
import { getAllJobs, createJob, deleteJob } from '../controllers/jobController.js';
import { authenticateToken } from '../middleware/auth.js';

const jobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(['Full-time', 'Part-time', 'Internship', 'Contract']).withMessage('Invalid job type'),
  body('description').trim().notEmpty().withMessage('Description is required')
];

export default function jobRoutes(router) {
  router.get('/', getAllJobs);
  router.post('/', authenticateToken, jobValidation, createJob);
  router.delete('/:id', authenticateToken, deleteJob);

  return router;
}

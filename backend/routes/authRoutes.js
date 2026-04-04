/**
 * Auth routes - Register & Login
 */
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

export default function authRoutes(router) {
  router.post('/register', registerValidation, register);
  router.post('/login', loginValidation, login);
  return router;
}

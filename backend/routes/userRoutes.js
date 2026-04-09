/**
 * User routes - Profile CRUD
 */
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMe, getUserById, updateMe, getAllUsers, searchUsers } from '../controllers/userController.js';
import { getUserActivity } from '../controllers/postController.js';
import { authenticateToken } from '../middleware/auth.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const updateValidation = [
  body('name').optional().trim().isLength({ max: 255 }),
  body('email').optional().trim().isEmail(),
  body('bio').optional().trim(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export default function userRoutes(router) {
  router.get('/', authenticateToken, getAllUsers);
  router.get('/search', authenticateToken, searchUsers);
  router.get('/me', authenticateToken, getMe);
  router.put('/me', authenticateToken, upload.single('avatar'), updateValidation, updateMe);
  router.get('/:id', getUserById);
  router.get('/:id/activity', getUserActivity);
  return router;
}

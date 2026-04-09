/**
 * Post routes - CRUD for posts
 */
import { body } from 'express-validator';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleRepost,
  getRepostStatus
} from '../controllers/postController.js';
import { getCommentsByPostId, createComment } from '../controllers/commentController.js';
import { toggleLike, getLikeStatus } from '../controllers/likeController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

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

const postContentValidation = body('content').trim().notEmpty().withMessage('Content is required');
const commentValidation = body('comment_text').trim().notEmpty().withMessage('Comment text is required');

export default function postRoutes(router) {
  router.get('/', getAllPosts);
  router.get('/:id', getPostById);
  router.post('/', authenticateToken, upload.single('postImage'), [postContentValidation], createPost);
  router.put('/:id', authenticateToken, [postContentValidation], updatePost);
  router.delete('/:id', authenticateToken, deletePost);

  router.get('/:postId/comments', getCommentsByPostId);
  router.post('/:postId/comments', authenticateToken, [commentValidation], createComment);

  router.post('/:postId/like', authenticateToken, toggleLike);
  router.get('/:postId/like', authenticateToken, getLikeStatus);

  router.post('/:id/repost', authenticateToken, toggleRepost);
  router.get('/:id/repost', authenticateToken, getRepostStatus);

  return router;
}

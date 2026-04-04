/**
 * Comment Controller - CRUD for comments on posts
 */
import { validationResult } from 'express-validator';
import pool from '../config/db.js';

/**
 * GET /api/posts/:postId/comments - Get all comments for a post
 */
export const getCommentsByPostId = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.post_id, c.user_id, c.comment_text, c.created_at,
             u.name AS user_name, u.profile_picture AS user_profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.postId]);
    res.json(rows);
  } catch (err) {
    console.error('getCommentsByPostId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/posts/:postId/comments - Add comment (auth required)
 */
export const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const postId = req.params.postId;
    const { comment_text } = req.body;

    const [postExists] = await pool.query('SELECT id FROM posts WHERE id = ?', [postId]);
    if (postExists.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)',
      [postId, req.user.id, comment_text]
    );
    const [newComment] = await pool.query(`
      SELECT c.id, c.post_id, c.user_id, c.comment_text, c.created_at,
             u.name AS user_name, u.profile_picture AS user_profile_picture
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);
    res.status(201).json(newComment[0]);
  } catch (err) {
    console.error('createComment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/comments/:id - Delete comment (auth, owner only)
 */
export const deleteComment = async (req, res) => {
  try {
    const [comments] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [req.params.id]);
    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comments[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed to delete this comment' });
    }
    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteComment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

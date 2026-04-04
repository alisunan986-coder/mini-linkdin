/**
 * Post Controller - CRUD for posts, with like count and comment count
 */
import { validationResult } from 'express-validator';
import pool from '../config/db.js';

/**
 * GET /api/posts - Get all posts (feed) with user info, like count, comment count
 */
export const getAllPosts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.user_id, p.content, p.image_url, p.created_at,
             u.name AS user_name, u.profile_picture AS user_profile_picture,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('getAllPosts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/posts/:id - Get single post with details
 */
export const getPostById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.user_id, p.content, p.created_at,
             u.name AS user_name, u.profile_picture AS user_profile_picture,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('getPostById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/posts - Create post (auth required)
 */
export const createPost = async (req, res) => {
  console.log('[DEBUG] createPost Body:', req.body);
  console.log('[DEBUG] createPost File:', req.file);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { content } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
      [req.user.id, content, image_url]
    );
    const [newPost] = await pool.query(`
      SELECT p.id, p.user_id, p.content, p.image_url, p.created_at,
             u.name AS user_name, u.profile_picture AS user_profile_picture,
             0 AS like_count, 0 AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [result.insertId]);
    res.status(201).json(newPost[0]);
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/posts/:id - Update post (auth, owner only)
 */
export const updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const [posts] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (posts[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed to edit this post' });
    }
    const { content } = req.body;
    await pool.query('UPDATE posts SET content = ? WHERE id = ?', [content, req.params.id]);
    const [updated] = await pool.query(`
      SELECT p.id, p.user_id, p.content, p.created_at,
             u.name AS user_name, u.profile_picture AS user_profile_picture,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('updatePost error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/posts/:id - Delete post (auth, owner only)
 */
export const deletePost = async (req, res) => {
  try {
    const [posts] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (posts[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed to delete this post' });
    }
    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

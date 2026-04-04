/**
 * Like Controller - Like / Unlike post
 */
import pool from '../config/db.js';

/**
 * POST /api/posts/:postId/like - Toggle like (auth required)
 * If already liked, removes like; otherwise adds like.
 */
export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const [postExists] = await pool.query('SELECT id FROM posts WHERE id = ?', [postId]);
    if (postExists.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      return res.json({ liked: false, message: 'Unliked' });
    } else {
      await pool.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      return res.json({ liked: true, message: 'Liked' });
    }
  } catch (err) {
    console.error('toggleLike error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/posts/:postId/like - Check if current user liked the post (auth required)
 */
export const getLikeStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [req.params.postId, req.user.id]
    );
    res.json({ liked: rows.length > 0 });
  } catch (err) {
    console.error('getLikeStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Connection Controller - Manage user relationships
 */
import pool from '../config/db.js';

/**
 * GET /api/connections/suggestions - Get users not connected to current user
 */
export const getSuggestions = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    console.log('[DEBUG] getSuggestions for User ID:', userId);

    const [allUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [allConns] = await pool.query('SELECT COUNT(*) as count FROM connections');
    console.log(`[DEBUG] Table counts - Users: ${allUsers[0].count}, Connections: ${allConns[0].count}`);

    // Simplified query for testing
    const [rows] = await pool.query(`
      SELECT id, name, bio, profile_picture 
      FROM users 
      WHERE id != ? 
      AND id NOT IN (SELECT connected_user_id FROM connections WHERE user_id = ?)
      AND id NOT IN (SELECT user_id FROM connections WHERE connected_user_id = ?)
      LIMIT 20
    `, [userId, userId, userId]);
    
    console.log(`[DEBUG] getSuggestions returning ${rows.length} users`);
    res.json(rows);
  } catch (err) {
    console.error('getSuggestions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/connections/pending - Get incoming connection requests
 */
export const getPendingRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id AS connection_id, u.id, u.name, u.bio, u.profile_picture, c.created_at
      FROM connections c
      JOIN users u ON c.user_id = u.id
      WHERE c.connected_user_id = ? AND c.status = 'pending'
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error('getPendingRequests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/connections/request/:id - Send a connection request
 */
export const sendRequest = async (req, res) => {
  try {
    const recipientId = req.params.id;
    const userId = req.user.id;

    if (userId === parseInt(recipientId)) {
      return res.status(400).json({ error: 'Cannot connect to yourself' });
    }

    // Check if already exists
    const [existing] = await pool.query(
      'SELECT id FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)',
      [userId, recipientId, recipientId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Connection already exists or pending' });
    }

    await pool.query(
      'INSERT INTO connections (user_id, connected_user_id, status) VALUES (?, ?, "pending")',
      [userId, recipientId]
    );
    res.status(201).json({ message: 'Connection request sent' });
  } catch (err) {
    console.error('sendRequest error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PUT /api/connections/accept/:id - Accept a connection request
 */
export const acceptRequest = async (req, res) => {
  try {
    const requesterId = req.params.id; // Corrected: this is the ID of the user who SENT the request
    const userId = req.user.id;

    const [result] = await pool.query(
      'UPDATE connections SET status = "accepted" WHERE user_id = ? AND connected_user_id = ? AND status = "pending"',
      [requesterId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Connection accepted' });
  } catch (err) {
    console.error('acceptRequest error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/connections/:id - Remove or ignore a connection
 */
export const removeConnection = async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)',
      [userId, targetId, targetId, userId]
    );
    res.json({ message: 'Connection removed' });
  } catch (err) {
    console.error('removeConnection error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

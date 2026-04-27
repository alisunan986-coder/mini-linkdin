import pool from '../config/db.js';

/**
 * GET /api/messages - List unique conversations for the current user
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.profile_picture, 
        m.content AS last_message, 
        m.created_at AS last_message_time,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) AS unread_count
      FROM users u
      JOIN (
        SELECT MAX(id) as max_id, 
               CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY other_user_id
      ) conv ON u.id = conv.other_user_id
      JOIN messages m ON conv.max_id = m.id
      ORDER BY m.created_at DESC
    `, [userId, userId, userId, userId]);

    res.json(rows);
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/messages/:userId - Get full message history with a specific user
 */
export const getMessagesWithUser = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?',
      [otherId, myId]
    );

    const [rows] = await pool.query(`
      SELECT * FROM messages
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `, [myId, otherId, otherId, myId]);

    res.json(rows);
  } catch (err) {
    console.error('getMessagesWithUser error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/messages - Send a direct message
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    console.log('[DEBUG] sendMessage:', { senderId, receiverId, content });

    if (!content || !receiverId) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    const numericReceiverId = Number(receiverId);

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, numericReceiverId, content]
    );

    console.log('[DEBUG] Message inserted, ID:', result.insertId);

    const [newMessage] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

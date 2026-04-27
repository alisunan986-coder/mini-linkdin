/**
 * User Controller - Profile CRUD and update
 */
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import pool from '../config/db.js';

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, bio, profile_picture, created_at FROM users ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('getAllUsers error:', err.message);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

/**
 * GET /api/users/search - Search users by name or bio
 */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const query = `%${q}%`;
    const [rows] = await pool.query(
      'SELECT id, name, email, bio, profile_picture FROM users WHERE name LIKE ? OR bio LIKE ? ORDER BY name ASC',
      [query, query]
    );
    res.json(rows);
  } catch (err) {
    console.error('searchUsers error:', err.message);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

/**
 * GET /api/users/me - Get current user profile (auth required)
 */
export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, bio, profile_picture, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('getMe error:', err.message);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

/**
 * GET /api/users/:id - Get user by ID (public profile)
 */
export const getUserById = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    if (isNaN(targetId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, bio, profile_picture, created_at FROM users WHERE id = ?',
      [targetId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('getUserById error:', err.message);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

/**
 * PUT /api/users/me - Update current user profile (auth required)
 */
export const updateMe = async (req, res) => {
  console.log('[DEBUG] updateMe Body:', req.body);
  console.log('[DEBUG] updateMe File:', req.file);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, bio, email, password } = req.body;
    const profile_picture = req.file ? `/uploads/${req.file.filename}` : req.body.profile_picture;

    let updates = [];
    let values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (profile_picture !== undefined) {
      updates.push('profile_picture = ?');
      values.push(profile_picture);
    }
    if (password && password.length >= 6) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.user.id);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, bio, profile_picture, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('updateMe error:', err.message);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

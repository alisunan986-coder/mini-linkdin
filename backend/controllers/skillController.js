/**
 * Skill Controller - CRUD for user skills
 */
import { validationResult } from 'express-validator';
import pool from '../config/db.js';

/**
 * GET /api/users/:userId/skills - Get all skills for a user
 */
export const getSkillsByUserId = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_id, skill_name, created_at FROM skills WHERE user_id = ? ORDER BY skill_name',
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('getSkillsByUserId error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/users/me/skills - Add skill for current user (auth required)
 */
export const addSkill = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { skill_name } = req.body;
    const [result] = await pool.query(
      'INSERT INTO skills (user_id, skill_name) VALUES (?, ?)',
      [req.user.id, skill_name.trim()]
    );
    const [newSkill] = await pool.query(
      'SELECT id, user_id, skill_name, created_at FROM skills WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(newSkill[0]);
  } catch (err) {
    console.error('addSkill error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/skills/:id - Delete skill (auth, owner only)
 */
export const deleteSkill = async (req, res) => {
  try {
    const [skills] = await pool.query('SELECT user_id FROM skills WHERE id = ?', [req.params.id]);
    if (skills.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    if (skills[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed to delete this skill' });
    }
    await pool.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    console.error('deleteSkill error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Job Controller - Manage job postings
 */
import { validationResult } from 'express-validator';
import pool from '../config/db.js';

/**
 * GET /api/jobs - Get all jobs
 */
export const getAllJobs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT j.*, u.name AS poster_name 
      FROM jobs j 
      JOIN users u ON j.user_id = u.id 
      ORDER BY j.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('getAllJobs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/jobs - Create a job posting
 */
export const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, type, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO jobs (user_id, title, company, location, type, description) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, company, location, type, description]
    );

    const [newJob] = await pool.query('SELECT * FROM jobs WHERE id = ?', [result.insertId]);
    res.status(201).json(newJob[0]);
  } catch (err) {
    console.error('createJob error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/jobs/:id - Delete a job posting
 */
export const deleteJob = async (req, res) => {
  try {
    const [jobs] = await pool.query('SELECT user_id FROM jobs WHERE id = ?', [req.params.id]);
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobs[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    console.error('deleteJob error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

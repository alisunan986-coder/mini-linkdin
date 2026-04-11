import pool from '../config/db.js';
import { validationResult } from 'express-validator';

/**
 * POST /api/applications - Apply to a job
 */
export const applyToJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { jobId, fullName, email, coverLetter } = req.body;
    const userId = req.user.id;
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    console.log('[DEBUG] applyToJob payload:', { jobId, userId, fullName, resume: req.file?.filename });

    if (!resumeUrl) {
      return res.status(400).json({ error: 'Resume (PDF) is required' });
    }

    const numericJobId = Number(jobId);

    // Check if already applied
    const [existing] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [userId, numericJobId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    const [result] = await pool.query(
      `INSERT INTO applications (user_id, job_id, full_name, email, resume_url, cover_letter) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, numericJobId, fullName, email, resumeUrl, coverLetter]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Application submitted successfully' 
    });
  } catch (err) {
    console.error('applyToJob error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/applications/me - Get applications of current user
 */
export const getUserApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, j.title AS job_title, j.company AS job_company, j.location AS job_location
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error('getUserApplications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/applications/job/:jobId - Get all applicants for a specific job (recruiter only)
 */
export const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if the current user is the owner of the job
    const [jobs] = await pool.query('SELECT user_id FROM jobs WHERE id = ?', [jobId]);
    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (jobs[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view applicants for this job' });
    }

    const [applicants] = await pool.query(`
      SELECT a.*, u.profile_picture AS user_avatar
      FROM applications a
      JOIN users u ON a.user_id = u.id
      WHERE a.job_id = ?
      ORDER BY a.created_at DESC
    `, [jobId]);

    res.json(applicants);
  } catch (err) {
    console.error('getJobApplicants error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/applications/:id/status - Update status (recruiter only)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "viewed" | "shortlisted" | "rejected"

    // Check if the current user owns the job related to this application
    const [applications] = await pool.query(`
      SELECT a.job_id, j.user_id 
      FROM applications a 
      JOIN jobs j ON a.job_id = j.id 
      WHERE a.id = ?
    `, [id]);

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (applications[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Application status updated to ${status}` });
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

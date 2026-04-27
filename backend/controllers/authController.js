import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log('[Auth] Attempting registration for:', email);

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 2. Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      console.warn('[Auth] Registration failed: Email already exists:', email);
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save to Database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email.toLowerCase(), hashedPassword]
    );

    console.log('[Auth] User registered successfully:', result.insertId);

    // 5. Generate JWT
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('[Auth] Registration Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('[Auth] Attempting login for:', email);

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 2. Find user
    const [rows] = await pool.query(
      'SELECT id, name, email, password, bio, profile_picture FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (!rows || rows.length === 0) {
      console.warn('[Auth] Login failed: User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[Auth] Login failed: Incorrect password for:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log('[Auth] Login successful for user ID:', user.id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profile_picture: user.profile_picture
      }
    });
  } catch (error) {
    console.error('[Auth] Login Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

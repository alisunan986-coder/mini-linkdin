/**
 * Express app - middleware and route mounting
 */
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; // Added this
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS - allow frontend to connect
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API routes
app.use('/api/auth', authRoutes(express.Router()));
app.use('/api/users', userRoutes(express.Router()));
app.use('/api/posts', postRoutes(express.Router()));
app.use('/api/comments', commentRoutes(express.Router()));
app.use('/api/skills', skillRoutes(express.Router()));
app.use('/api/jobs', jobRoutes(express.Router()));
app.use('/api/connections', connectionRoutes(express.Router()));
app.use('/api/applications', applicationRoutes(express.Router()));
app.use('/api/ai', aiRoutes(express.Router())); // Added this

// Serve static profile pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads', 'resumes')));

// Health check for deployment
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]');
  console.error(`Method: ${req.method} | URL: ${req.originalUrl}`);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Server error', 
    message: err.message,
    path: req.originalUrl
  });
});

export default app;

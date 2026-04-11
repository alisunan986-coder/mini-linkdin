/**
 * Application Routes - Handle job applications and recruiter views
 */
import {
  applyToJob,
  getUserApplications,
  getJobApplicants,
  updateApplicationStatus
} from '../controllers/applicationController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure resumes directory exists
const resumesDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumesDir);
  },
  filename: function (req, file, cb) {
    cb(null, `resume-${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default function applicationRoutes(router) {
  // Candidate: Apply to a job
  router.post('/', authenticateToken, upload.single('resume'), applyToJob);

  // Candidate: My applications
  router.get('/me', authenticateToken, getUserApplications);

  // Recruiter: View applicants for my job
  router.get('/job/:jobId', authenticateToken, getJobApplicants);

  // Recruiter: Update applicant status
  router.patch('/:id/status', authenticateToken, updateApplicationStatus);

  return router;
}

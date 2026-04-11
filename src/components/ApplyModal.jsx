import { useState } from 'react';
import { api } from '../api/api.js';
import styles from './ApplyModal.module.css';

export default function ApplyModal({ job, user, onClose, onSuccess }) {
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) {
      alert('Please upload your resume (PDF)');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jobId', job.id);
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resume);

      await api.applications.apply(formData);
      alert('Application submitted successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Apply to {job.company}</h2>
          <p className={styles.jobSub}>{job.title} • {job.location}</p>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.field}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.field}>
            <label>Resume (PDF only)</label>
            <div className={styles.fileInputWrapper}>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setResume(e.target.files[0])} 
                required 
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className={styles.fileLabel}>
                {resume ? `📄 ${resume.name}` : '📁 Choose PDF Resume'}
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <label>Cover Letter (Optional)</label>
            <textarea 
              value={coverLetter} 
              onChange={(e) => setCoverLetter(e.target.value)} 
              rows={5}
              placeholder="Tell the recruiter why you're a great fit..."
            />
          </div>

          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

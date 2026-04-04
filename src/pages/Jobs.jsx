/**
 * Jobs Page - View and post job opportunities
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import styles from './Jobs.module.css';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await api.jobs.getAll();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newJob = await api.jobs.create({ title, company, location, type, description });
      setJobs([newJob, ...jobs]);
      setShowForm(false);
      // Reset form
      setTitle(''); setCompany(''); setLocation(''); setDescription('');
    } catch (err) {
      alert(err.error || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.jobs.delete(id);
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Job Board</h1>
        <button 
          className={styles.toggleBtn} 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close Form' : 'Post a Job'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.jobForm}>
          <div className={styles.formGrid}>
            <input 
              placeholder="Job Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
            <input 
              placeholder="Company" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
              required 
            />
            <input 
              placeholder="Location" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              required 
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <textarea 
            placeholder="Job Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            rows={4}
          />
          <button type="submit" disabled={submitting} className={styles.submitBtn}>
            {submitting ? 'Posting...' : 'List Job'}
          </button>
        </form>
      )}

      {loading ? (
        <p className={styles.msg}>Loading opportunities...</p>
      ) : jobs.length === 0 ? (
        <p className={styles.msg}>No jobs listed yet. Be the first!</p>
      ) : (
        <div className={styles.jobList}>
          {jobs.map((job) => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.companyInfo}>{job.company} • {job.location}</p>
                </div>
                <span className={`${styles.badge} ${styles[job.type.toLowerCase()]}`}>
                  {job.type}
                </span>
              </div>
              <p className={styles.description}>{job.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.postedBy}>Posted by: {job.poster_name || 'HR'}</span>
                {user?.id === job.user_id && (
                  <button onClick={() => handleDelete(job.id)} className={styles.deleteBtn}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

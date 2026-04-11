/**
 * Jobs Page - View and post job opportunities
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import ApplyModal from '../components/ApplyModal.jsx';
import styles from './Jobs.module.css';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Application Modal State
  const [applyingJob, setApplyingJob] = useState(null);
  
  // Recruiter: View Applicants State
  const [viewingApplicantsFor, setViewingApplicantsFor] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
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

  const fetchMyApplications = async () => {
    if (!user) return;
    try {
      const data = await api.applications.getMe();
      setMyApplications(data);
    } catch (err) {
      console.error('Failed to fetch my applications:', err);
    }
  };

  const fetchApplicants = async (jobId) => {
    setLoadingApplicants(true);
    setViewingApplicantsFor(jobId);
    try {
      const data = await api.applications.getJobApplicants(jobId);
      setApplicants(data);
    } catch (err) {
      alert('Failed to load applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      await api.applications.updateStatus(appId, status);
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    console.log('[DEBUG] Posting Job:', { title, company, location, type, description });
    try {
      const newJob = await api.jobs.create({ title, company, location, type, description });
      console.log('[DEBUG] Job Created:', newJob);
      setJobs([newJob, ...jobs]);
      setShowForm(false);
      // Reset form
      setTitle(''); setCompany(''); setLocation(''); setDescription('');
    } catch (err) {
      console.error('[DEBUG] Post Job Error:', err);
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || job.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleApply = () => alert('Apply functionality coming soon! For now, please contact the poster.');

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

      <div className={styles.searchBar}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by title, company, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select 
          className={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
        </select>
      </div>

      {loading ? (
        <p className={styles.msg}>Loading opportunities...</p>
      ) : filteredJobs.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📂</span>
          <p>No matching opportunities found.</p>
          {(searchTerm || filterType !== 'All') && (
            <button 
              className={styles.clearBtn}
              onClick={() => { setSearchTerm(''); setFilterType('All'); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className={styles.jobList}>
          {filteredJobs.map((job) => {
            const hasApplied = myApplications.some(app => app.job_id === job.id);
            const isMyJob = user?.id === job.user_id;

            return (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <p className={styles.companyInfo}>{job.company} • {job.location}</p>
                  </div>
                  <span className={`${styles.badge} ${styles[job.type.toLowerCase().replace('-', '')]}`}>
                    {job.type}
                  </span>
                </div>
                <p className={styles.description}>{job.description}</p>
                <div className={styles.cardFooter}>
                  <div className={styles.footerLeft}>
                    <span className={styles.postedBy}>Posted by: {job.poster_name || 'HR'}</span>
                    {isMyJob && (
                      <button 
                        onClick={() => fetchApplicants(job.id)}
                        className={styles.viewApplicantsBtn}
                      >
                        👥 View Applicants
                      </button>
                    )}
                  </div>
                  <div className={styles.footerRight}>
                    {hasApplied ? (
                      <button className={styles.appliedBtn} disabled>
                        ✓ Applied
                      </button>
                    ) : (
                      <button 
                        onClick={() => setApplyingJob(job)} 
                        className={styles.applyBtn}
                        disabled={isMyJob}
                      >
                        {isMyJob ? 'My Posting' : 'Apply Now'}
                      </button>
                    )}
                    {isMyJob && (
                      <button onClick={() => handleDelete(job.id)} className={styles.deleteBtn}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Recruiter: Applicants List */}
                {viewingApplicantsFor === job.id && (
                  <div className={styles.applicantsSection}>
                    <h4>Applicants for this role</h4>
                    {loadingApplicants ? (
                      <p>Loading talent...</p>
                    ) : applicants.length === 0 ? (
                      <p className={styles.noApps}>No applicants yet.</p>
                    ) : (
                      <div className={styles.applicantGrid}>
                        {applicants.map(app => (
                          <div key={app.id} className={styles.applicantCard}>
                            <div className={styles.appNameRow}>
                               <strong>{app.full_name}</strong>
                               <span className={`${styles.statusBadge} ${styles[app.status]}`}>
                                 {app.status}
                               </span>
                            </div>
                            <p className={styles.appEmail}>{app.email}</p>
                            <div className={styles.appActions}>
                              <a 
                                href={app.resume_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.resumeLink}
                              >
                                📄 View Resume
                              </a>
                              <div className={styles.statusButtons}>
                                <button onClick={() => handleUpdateStatus(app.id, 'shortlisted')} className={styles.shortlistBtn}>Shortlist</button>
                                <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className={styles.rejectBtn}>Reject</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setViewingApplicantsFor(null)} className={styles.closeApplicants}>Close</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {applyingJob && (
        <ApplyModal 
          job={applyingJob} 
          user={user} 
          onClose={() => setApplyingJob(null)} 
          onSuccess={fetchMyApplications}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { api } from '../api/api.js';
import styles from './MyApplications.module.css';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.applications.getMe();
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'applied': return styles.applied;
      case 'viewed': return styles.viewed;
      case 'shortlisted': return styles.shortlisted;
      case 'rejected': return styles.rejected;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Job Applications</h1>
        <p className={styles.subtitle}>Track the status of your professional journey</p>
      </div>

      {loading ? (
        <div className={styles.loader}>Tracking your submissions...</div>
      ) : applications.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📂</div>
          <h3>No applications yet</h3>
          <p>Start your career journey by applying to relevant jobs!</p>
        </div>
      ) : (
        <div className={styles.appList}>
          {applications.map((app) => (
            <div key={app.id} className={styles.appCard}>
              <div className={styles.appHeader}>
                <div>
                  <h3 className={styles.jobTitle}>{app.job_title}</h3>
                  <p className={styles.company}>{app.job_company} • {app.job_location}</p>
                </div>
                <div className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                  {app.status.toUpperCase()}
                </div>
              </div>

              <div className={styles.appDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Applied on:</span>
                  <span className={styles.value}>
                    {new Date(app.created_at).toLocaleDateString(undefined, { 
                       dateStyle: 'medium' 
                    })}
                  </span>
                </div>
                <div className={styles.detailItem}>
                   <span className={styles.label}>Resume submitted:</span>
                   <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className={styles.resumeLink}>
                     view_resume.pdf
                   </a>
                </div>
              </div>

              {app.status === 'shortlisted' && (
                <div className={styles.congratsBox}>
                  🎉 Congratulations! The recruiter has shortlisted you. Keep an eye on your email!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

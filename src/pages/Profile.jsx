/**
 * Profile page - View user profile with skills and their posts
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import ProfileHeader from '../components/ProfileHeader.jsx';
import SkillList from '../components/SkillList.jsx';
import PostCard from '../components/PostCard.jsx';
import styles from './Profile.module.css';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [posts, setPosts] = useState([]);
  const userId = id === 'me' || !id ? currentUser?.id : Number(id);
  const isOwnProfile = currentUser?.id === userId;
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'pending', 'accepted'
  const [isRequester, setIsRequester] = useState(false);

  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    
    // Determine connection status if not own profile
    const fetchStatus = !isOwnProfile ? api.connections.getPending().then(pends => {
      const isPend = pends.find(p => p.id === userId);
      if (isPend) return { status: 'pending', isRequester: false };
      
      return api.connections.getSuggestions().then(suggs => {
        const isSug = suggs.find(s => s.id === userId);
        if (isSug) return { status: null, isRequester: false };
        // If not in suggestions and not pending, they might be connected or WE sent the request
        // For now, let's assume they are connected if we can't find them in suggestions.
        // A more robust backend would return this in getUserById.
        return { status: 'accepted', isRequester: false };
      });
    }) : Promise.resolve({ status: null, isRequester: false });

    Promise.all([
      api.users.getById(userId),
      api.skills.getByUser(userId),
      api.users.getActivity(userId),
      fetchStatus
    ])
      .then(([userData, skillsData, activityData, statusData]) => {
        setProfile(userData);
        setSkills(skillsData);
        setPosts(activityData);
        setConnectionStatus(statusData.status);
        setIsRequester(statusData.isRequester);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, isOwnProfile]);

  const handleConnect = async () => {
    try {
      await api.connections.sendRequest(userId);
      setConnectionStatus('pending');
      setIsRequester(true);
    } catch (err) { alert(err.error || 'Failed to connect'); }
  };

  const handleAccept = async () => {
    try {
      await api.connections.accept(userId);
      setConnectionStatus('accepted');
    } catch (err) { alert('Failed to accept'); }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.connections.remove(userId);
      setConnectionStatus(null);
    } catch (err) { alert('Failed to remove connection'); }
  };

  const refreshSkills = () => {
    if (userId) api.skills.getByUser(userId).then(setSkills);
  };

  if (loading) return <p className={styles.loading}>Loading profile...</p>;
  if (!profile) return <p className={styles.error}>Profile not found.</p>;

  return (
    <div className={styles.profile}>
      <ProfileHeader user={profile} isOwnProfile={isOwnProfile} />
      
      {!isOwnProfile && (
        <div className={styles.connectionBar}>
          {connectionStatus === 'accepted' ? (
            <div className={styles.connectedState}>
              <span>✓ Connected</span>
              <button onClick={handleRemove} className={styles.removeBtn}>Remove</button>
            </div>
          ) : connectionStatus === 'pending' ? (
            isRequester ? (
              <button disabled className={styles.pendingBtn}>Request Sent</button>
            ) : (
              <div className={styles.pendingActions}>
                <button onClick={handleAccept} className={styles.acceptBtn}>Accept Invitation</button>
                <button onClick={handleRemove} className={styles.ignoreBtn}>Ignore</button>
              </div>
            )
          ) : (
            <button onClick={handleConnect} className={styles.connectBtn}>Connect</button>
          )}
        </div>
      )}

      <SkillList userId={userId} skills={skills} onUpdate={refreshSkills} />
      <section className={styles.postsSection}>
        <h2 className={styles.sectionTitle}>Posts</h2>
        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={`${post.id}-${post.activity_date}`}
              post={post}
              onUpdate={() => api.users.getActivity(userId).then(setPosts)}
              onDelete={(p) => setPosts((prev) => prev.filter((x) => x.id !== p.id))}
            />
          ))
        )}
      </section>
    </div>
  );
}

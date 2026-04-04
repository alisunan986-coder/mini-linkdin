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
  const userId = id === 'me' || !id ? currentUser?.id : id;
  const isOwnProfile = currentUser?.id === userId;

  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      api.users.getById(userId),
      api.skills.getByUser(userId),
      api.posts.getAll()
    ])
      .then(([userData, skillsData, allPosts]) => {
        setProfile(userData);
        setSkills(skillsData);
        setPosts(allPosts.filter((p) => Number(p.user_id) === Number(userId)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const refreshSkills = () => {
    if (userId) api.skills.getByUser(userId).then(setSkills);
  };

  if (loading) return <p className={styles.loading}>Loading profile...</p>;
  if (!profile) return <p className={styles.error}>Profile not found.</p>;

  return (
    <div className={styles.profile}>
      <ProfileHeader user={profile} isOwnProfile={isOwnProfile} />
      <SkillList userId={userId} skills={skills} onUpdate={refreshSkills} />
      <section className={styles.postsSection}>
        <h2 className={styles.sectionTitle}>Posts</h2>
        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={() => api.posts.getAll().then((all) => setPosts(all.filter((p) => Number(p.user_id) === Number(userId))))}
              onDelete={(p) => setPosts((prev) => prev.filter((x) => x.id !== p.id))}
            />
          ))
        )}
      </section>
    </div>
  );
}

/**
 * Dashboard - Feed of all posts with create post, like and comment
 * Optional: polling for simple "real-time" updates
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import PostCard from '../components/PostCard.jsx';
import styles from './Dashboard.module.css';

const POLL_INTERVAL_MS = 30000; // optional: refresh feed every 30s

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(() => {
    api.posts
      .getAll()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const id = setInterval(fetchPosts, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchPosts]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !user || submitting) return;
    setSubmitting(true);
    try {
      let body;
      if (postImage) {
        body = new FormData();
        body.append('content', newPost.trim());
        body.append('postImage', postImage);
      } else {
        body = { content: newPost.trim() };
      }
      const created = await api.posts.create(body);
      setPosts((prev) => [created, ...prev]);
      setNewPost('');
      setPostImage(null);
    } catch (err) {
      alert(err.error || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostUpdate = () => fetchPosts();
  const handlePostDelete = (post) => {
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Feed</h1>
      {user && (
        <form onSubmit={handleCreatePost} className={styles.createForm}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className={styles.textarea}
          />
          <div className={styles.createActions}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPostImage(e.target.files[0])}
              id="post-image-input"
              hidden
            />
            <label htmlFor="post-image-input" className={styles.imageLabel}>
              📷 {postImage ? 'Image selected' : 'Add photo'}
            </label>
            <button type="submit" className={styles.submitBtn} disabled={submitting || !newPost.trim()}>
              Post
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p className={styles.loading}>Loading feed...</p>
      ) : posts.length === 0 ? (
        <p className={styles.empty}>No posts yet. Be the first to share!</p>
      ) : (
        <div className={styles.feed}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={handlePostUpdate}
              onDelete={handlePostDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

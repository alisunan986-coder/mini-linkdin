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
  const [aiImproving, setAiImproving] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiMode, setAiMode] = useState('professional');

  const fetchPosts = useCallback(() => {
    api.posts
      .getAll()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPosts();
    const timer = setInterval(fetchPosts, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchPosts]);

  const handleImprovePost = async () => {
    if (!newPost.trim() || aiImproving) return;
    setAiImproving(true);
    setAiResult('');
    try {
      const resp = await api.ai.improvePost({ text: newPost, mode: aiMode });
      setAiResult(resp.improved);
    } catch (err) {
      alert(err.error || 'AI Assistant is currently busy. Please try again.');
    } finally {
      setAiImproving(false);
    }
  };

  const applyAiVersion = () => {
    setNewPost(aiResult);
    setAiResult('');
  };

  const handleCreatePost = async (e) => {
    if (e) e.preventDefault();
    console.log('[Dashboard] Attempting to create post...');
    
    if (!newPost.trim()) {
      console.warn('[Dashboard] Post content is empty.');
      return;
    }
    if (!user) {
      console.error('[Dashboard] No user logged in.');
      return;
    }
    if (submitting) {
      console.warn('[Dashboard] Already submitting...');
      return;
    }

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
      
      console.log('[Dashboard] Calling API with:', body);
      const created = await api.posts.create(body);
      console.log('[Dashboard] Post created successfully:', created);
      
      setPosts((prev) => [created, ...prev]);
      setNewPost('');
      setPostImage(null);
      setAiResult('');
    } catch (err) {
      console.error('[Dashboard] Create post failed:', err);
      const msg = err.message || err.error || 'Failed to create post';
      alert(msg);
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
      <aside className={styles.leftSidebar}>
        {user && (
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}></div>
            <div className={styles.cardInfo}>
              <div className={styles.avatarWrapper}>
                {user.profile_picture ? (
                  <img src={user.profile_picture} className={styles.sidebarAvatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{user.name.charAt(0)}</div>
                )}
              </div>
              <h2 className={styles.sidebarName}>{user.name}</h2>
              <p className={styles.sidebarBio}>{user.bio || 'Professional'}</p>
            </div>
            <div className={styles.cardStats}>
              <div className={styles.statRow}>
                <span>Who viewed your profile</span>
                <span className={styles.statValue}>42</span>
              </div>
              <div className={styles.statRow}>
                <span>Impressions of your post</span>
                <span className={styles.statValue}>1,204</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className={styles.mainFeed}>
        {user && (
          <div className={styles.createPostBox}>
            <div className={styles.inputWrapper}>
              {user.profile_picture ? (
                <img src={user.profile_picture} className={styles.tinyAvatar} />
              ) : (
                <div className={styles.tinyAvatarPlaceholder}>{user.name.charAt(0)}</div>
              )}
              <form onSubmit={handleCreatePost} className={styles.createForm}>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className={styles.postTextarea}
                  rows={3}
                />
                
                <div className={styles.postActionsRow}>
                  <div className={styles.aiControls}>
                    <select 
                      value={aiMode} 
                      onChange={(e) => setAiMode(e.target.value)}
                      className={styles.aiModeSelect}
                      title="Select AI improvement style"
                    >
                      <option value="professional">👔 Professional</option>
                      <option value="viral">🚀 Viral / Engaging</option>
                      <option value="short">✂️ Concise</option>
                      <option value="grammar">✍️ Fix Grammar</option>
                    </select>
                    <button 
                      type="button" 
                      onClick={handleImprovePost}
                      disabled={!newPost.trim() || aiImproving}
                      className={styles.aiAssistBtn}
                    >
                      {aiImproving ? '🪄 Improving...' : '🪄 Improve with AI'}
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    className={styles.postBtn}
                    disabled={!newPost.trim() || submitting}
                    onClick={handleCreatePost}
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>

            {aiResult && (
              <div className={styles.aiPreviewBox}>
                <div className={styles.aiPreviewHeader}>
                  <span className={styles.aiBadge}>AI SUGGESTION</span>
                  <div className={styles.aiPreviewActions}>
                    <button onClick={() => setAiResult('')} className={styles.aiDiscardBtn}>Discard</button>
                    <button onClick={applyAiVersion} className={styles.aiApplyBtn}>Use this text</button>
                  </div>
                </div>
                <div className={styles.aiPreviewContent}>
                  {aiResult}
                </div>
              </div>
            )}

            <div className={styles.createActions}>
              <label htmlFor="post-image-input" className={styles.actionBtn}>
                <span className={styles.icon}>📷</span> Photo
              </label>
              <button type="button" className={styles.actionBtn}>
                <span className={styles.icon}>🎥</span> Video
              </button>
              <button type="button" className={styles.actionBtn}>
                <span className={styles.icon}>💼</span> Job
              </button>
              <button type="button" className={styles.actionBtn}>
                <span className={styles.icon}>✍️</span> Write article
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPostImage(e.target.files[0])}
                id="post-image-input"
                hidden
              />
            </div>
            {postImage && (
              <p className={styles.imageNotify}>✓ Image selected: {postImage.name}</p>
            )}
          </div>
        )}

        {loading ? (
          <p className={styles.msg}>Discovering professional insights...</p>
        ) : posts.length === 0 ? (
          <p className={styles.msg}>No posts yet. Be the first to share!</p>
        ) : (
          <div className={styles.feed}>
            {posts.map((post) => (
              <PostCard
                key={post.feed_id || post.id}
                post={post}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            ))}
          </div>
        )}
      </main>

      <aside className={styles.rightSidebar}>
        <div className={styles.newsCard}>
          <h3 className={styles.newsTitle}>SmartHire News</h3>
          <ul className={styles.newsList}>
            <li>
              <span className={styles.newsHeadline}>The future of Remote Work 2026</span>
              <span className={styles.newsMeta}>4h ago • 12,042 readers</span>
            </li>
            <li>
              <span className={styles.newsHeadline}>Top 10 skills for AI Engineers</span>
              <span className={styles.newsMeta}>1d ago • 45,910 readers</span>
            </li>
            <li>
              <span className={styles.newsHeadline}>How to optimize your LinkedIn profile</span>
              <span className={styles.newsMeta}>2d ago • 8,110 readers</span>
            </li>
          </ul>
          <button className={styles.showMoreBtn}>Show more</button>
        </div>
      </aside>
    </div>
  );
}

/**
 * PostCard - Single post with like, comment, edit/delete for owner
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import CommentBox from './CommentBox.jsx';
import styles from './PostCard.module.css';

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(post.like_count) || 0);
  const [commentCount, setCommentCount] = useState(Number(post.comment_count) || 0);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [loading, setLoading] = useState(false);

  const isOwner = user?.id === post.user_id;

  useEffect(() => {
    if (user) {
      api.posts.getLikeStatus(post.id).then((r) => setLiked(r.liked)).catch(() => {});
    }
  }, [user, post.id]);

  const handleLike = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.posts.toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount((c) => (res.liked ? c + 1 : c - 1));
    } catch (err) {
      alert(err.error || 'Failed to like');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === post.content) {
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      await api.posts.update(post.id, { content: editContent.trim() });
      onUpdate?.();
      setEditing(false);
    } catch (err) {
      alert(err.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    setLoading(true);
    try {
      await api.posts.delete(post.id);
      onDelete?.(post);
    } catch (err) {
      alert(err.error || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  let date = '';
  try {
    const safeStr = post.created_at ? String(post.created_at).replace(' ', 'T') : '';
    const finalStr = safeStr.endsWith('Z') || !safeStr ? safeStr : safeStr + 'Z';
    if (finalStr) {
      date = new Date(finalStr).toLocaleDateString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      if (date === 'Invalid Date') date = '';
    }
  } catch (e) {
    date = 'Just now';
  }

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        {post.user_profile_picture ? (
          <img src={post.user_profile_picture} alt="" className={styles.avatar} />
        ) : (
          <span className={styles.avatarPlaceholder}>{post.user_name?.charAt(0) ?? '?'}</span>
        )}
        <div className={styles.meta}>
          <span className={styles.userName}>{post.user_name}</span>
          <span className={styles.date}>{date}</span>
        </div>
        {isOwner && !editing && (
          <div className={styles.actions}>
            <button type="button" onClick={() => setEditing(true)} className={styles.actionBtn}>
              Edit
            </button>
            <button type="button" onClick={handleDelete} className={styles.actionBtn} disabled={loading}>
              Delete
            </button>
          </div>
        )}
      </div>
      <div className={styles.body}>
        {editing ? (
          <>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={styles.editInput}
              rows={3}
            />
            <div className={styles.editActions}>
              <button type="button" onClick={handleSaveEdit} disabled={loading} className={styles.saveBtn}>
                Save
              </button>
              <button type="button" onClick={() => { setEditing(false); setEditContent(post.content); }}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.content}>{post.content}</p>
            {post.image_url && (
              <div className={styles.postImageWrapper}>
                <img src={post.image_url} alt="" className={styles.postImage} />
              </div>
            )}
          </>
        )}
      </div>
      <div className={styles.footer}>
        <button
          type="button"
          onClick={handleLike}
          disabled={!user || loading}
          className={liked ? styles.likeBtnActive : styles.likeBtn}
        >
          {liked ? '✓ Liked' : 'Like'} ({likeCount})
        </button>
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={styles.commentToggle}
        >
          Comments ({commentCount})
        </button>
      </div>
      {showComments && (
        <CommentBox
          postId={post.id}
          onCommentAdded={() => {
            setCommentCount((c) => c + 1);
            onUpdate?.();
          }}
        />
      )}
    </article>
  );
}

/**
 * PostCard - Single post with like, comment, repost, and send
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import CommentBox from './CommentBox.jsx';
import styles from './PostCard.module.css';

const MAX_CHAR_COLLAPSE = 250;

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(post.like_count) || 0);
  const [commentCount, setCommentCount] = useState(Number(post.comment_count) || 0);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwner = user?.id === post.user_id;
  const isTooLong = post.content.length > MAX_CHAR_COLLAPSE;
  const displayContent = (!isExpanded && isTooLong) 
    ? post.content.substring(0, MAX_CHAR_COLLAPSE) + '...' 
    : post.content;

  useEffect(() => {
    if (user) {
      api.posts.getLikeStatus(post.id).then((r) => setLiked(r.liked)).catch(() => {});
    }
  }, [user, post.id]);

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await api.posts.toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount((c) => (res.liked ? c + 1 : c - 1));
    } catch (err) {
      alert(err.error || 'Failed to like');
    }
  };

  const handleSaveEdit = async () => {
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
    try {
      await api.posts.delete(post.id);
      onDelete?.(post);
    } catch (err) {
      alert(err.error || 'Failed to delete');
    }
  };

  let date = '';
  try {
    const safeStr = post.created_at ? String(post.created_at).replace(' ', 'T') : '';
    const finalStr = safeStr.endsWith('Z') || !safeStr ? safeStr : safeStr + 'Z';
    if (finalStr) {
      date = new Date(finalStr).toLocaleDateString(undefined, { dateStyle: 'medium' });
    }
  } catch (e) { date = 'Recent'; }

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <Link to={`/profile/${post.user_id}`} className={styles.avatarLink}>
          {post.user_profile_picture ? (
            <img src={post.user_profile_picture} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatarPlaceholder}>{post.user_name?.charAt(0) ?? '?'}</span>
          )}
        </Link>
        <div className={styles.meta}>
          <div className={styles.nameRow}>
            <Link to={`/profile/${post.user_id}`} className={styles.userName}>{post.user_name}</Link>
            {!isOwner && (
              <span className={post.is_connection ? styles.connectedBadge : styles.suggestedBadge}>
                • {post.is_connection ? 'Connected' : 'Suggested'}
              </span>
            )}
          </div>
          <span className={styles.userBio}>{post.user_bio || 'Professional at SmartHire'}</span>
          <span className={styles.date}>{date} • 🌐</span>
        </div>
        {isOwner && (
          <div className={styles.topActions}>
             <button onClick={() => setEditing(!editing)} className={styles.dotBtn}>•••</button>
             {editing && (
               <div className={styles.popover}>
                 <button onClick={() => setEditing(true)}>Edit</button>
                 <button onClick={handleDelete} className={styles.deleteLink}>Delete</button>
               </div>
             )}
          </div>
        )}
      </div>

      <div className={styles.body}>
        {editing ? (
          <div className={styles.editWrap}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={styles.editInput}
              rows={4}
            />
            <div className={styles.editActions}>
              <button onClick={handleSaveEdit} disabled={loading} className={styles.saveBtn}>Save</button>
              <button onClick={() => setEditing(false)} className={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className={styles.content}>
              {displayContent}
              {!isExpanded && isTooLong && (
                <button onClick={() => setIsExpanded(true)} className={styles.seeMore}>...see more</button>
              )}
            </p>
            {post.image_url && (
              <div className={styles.postImageWrapper}>
                <img src={post.image_url} alt="" className={styles.postImage} />
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.stats}>
        <span className={styles.statItem}>👍 {likeCount}</span>
        <span className={styles.statItem}>{commentCount} comments</span>
      </div>

      <div className={styles.footer}>
        <button onClick={handleLike} className={liked ? styles.actionBtnActive : styles.actionBtn}>
          <span className={styles.footerIcon}>{liked ? '👍' : '👍'}</span> Like
        </button>
        <button onClick={() => setShowComments(!showComments)} className={styles.actionBtn}>
          <span className={styles.footerIcon}>💬</span> Comment
        </button>
        <button className={styles.actionBtn}>
          <span className={styles.footerIcon}>🔁</span> Repost
        </button>
        <button className={styles.actionBtn}>
          <span className={styles.footerIcon}>✈️</span> Send
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

/**
 * CommentBox - List comments and add new comment for a post
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import styles from './CommentBox.module.css';

export default function CommentBox({ postId, onCommentAdded }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const loadComments = () => {
    setLoadingList(true);
    api.posts
      .getComments(postId)
      .then(setComments)
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user || loading) return;
    setLoading(true);
    try {
      await api.posts.addComment(postId, { comment_text: text.trim() });
      setText('');
      loadComments();
      onCommentAdded?.();
    } catch (err) {
      alert(err.error || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.comments.delete(id);
      loadComments();
    } catch (err) {
      alert(err.error || 'Failed to delete');
    }
  };

  return (
    <div className={styles.commentBox}>
      {user && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className={styles.input}
          />
          <button type="submit" className={styles.submitBtn} disabled={loading || !text.trim()}>
            Comment
          </button>
        </form>
      )}
      {loadingList ? (
        <p className={styles.loading}>Loading comments...</p>
      ) : (
        <ul className={styles.list}>
          {comments.map((c) => (
            <li key={c.id} className={styles.item}>
              <div className={styles.commentHeader}>
                {c.user_profile_picture ? (
                  <img src={c.user_profile_picture} alt="" className={styles.avatar} />
                ) : (
                  <span className={styles.avatarPlaceholder}>{c.user_name?.charAt(0) ?? '?'}</span>
                )}
                <span className={styles.userName}>{c.user_name}</span>
                {user?.id === c.user_id && (
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className={styles.commentText}>{c.comment_text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

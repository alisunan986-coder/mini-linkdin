/**
 * CommentBox - List comments and add new comment for a post
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import styles from './CommentBox.module.css';

function CommentItem({ comment, user, onDelete, onReply, replies }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setShowReplyForm(false);
    } catch (err) {
      alert('Failed to reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <li className={comment.parent_id ? styles.replyItem : styles.item}>
      <div className={styles.commentContainer}>
        <div className={styles.commentHeader}>
          {comment.user_profile_picture ? (
            <img src={comment.user_profile_picture} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatarPlaceholder}>{comment.user_name?.charAt(0) ?? '?'}</span>
          )}
          <div className={styles.commentMain}>
            <div className={styles.nameRow}>
              <span className={styles.userName}>{comment.user_name}</span>
              {user?.id === comment.user_id && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => onDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>
            <p className={styles.commentText}>{comment.comment_text}</p>
            <div className={styles.commentActions}>
              <button 
                className={styles.replyBtn}
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                Reply
              </button>
            </div>
          </div>
        </div>

        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className={styles.replyForm}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={1}
              className={styles.replyInput}
              autoFocus
            />
            <div className={styles.replyActions}>
              <button 
                type="button" 
                onClick={() => setShowReplyForm(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!replyText.trim() || submitting}
                className={styles.submitReplyBtn}
              >
                {submitting ? '...' : 'Reply'}
              </button>
            </div>
          </form>
        )}

        {replies && replies.length > 0 && (
          <ul className={styles.repliesList}>
            {replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                user={user} 
                onDelete={onDelete} 
                onReply={onReply}
                replies={[]} // For now we only support 1 level of nesting deeply or keep it simple
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

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

  const handleReply = async (parentId, replyText) => {
    await api.posts.addComment(postId, { 
      comment_text: replyText, 
      parent_id: parentId 
    });
    loadComments();
    onCommentAdded?.();
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

  // Build comment tree (1 level nesting for clean UI)
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

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
          {rootComments.map((c) => (
            <CommentItem 
              key={c.id} 
              comment={c} 
              user={user} 
              onDelete={handleDelete} 
              onReply={handleReply}
              replies={getReplies(c.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

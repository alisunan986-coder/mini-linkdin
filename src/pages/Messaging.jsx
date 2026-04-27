import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import styles from './Messaging.module.css';

export default function Messaging() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userIdFromUrl = searchParams.get('userId');

    fetchConversations();
    
    if (userIdFromUrl) {
      handleChatWithUser(userIdFromUrl);
    }
  }, [location.search]);

  const handleChatWithUser = async (userId) => {
    try {
      const targetUser = await api.users.getById(userId);
      setActiveUser(targetUser);
    } catch (err) {
      console.error('Failed to pre-load user for chat');
    }
  };

  useEffect(() => {
    if (activeUser) {
      fetchMessages(activeUser.id);
      // Polling for new messages every 5 seconds
      const interval = setInterval(() => fetchMessages(activeUser.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const data = await api.messages.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await api.messages.getHistory(userId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;

    try {
      const resp = await api.messages.send({
        receiverId: activeUser.id,
        content: newMessage
      });
      setMessages([...messages, resp]);
      setNewMessage('');
      // Update conversations list to show last message
      fetchConversations();
    } catch (err) {
      alert('Failed to send message: ' + (err.error || 'Server error'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Messaging</h2>
        </div>
        <div className={styles.convList}>
          {loading ? (
            <p className={styles.loading}>Loading chats...</p>
          ) : conversations.length === 0 ? (
            <p className={styles.empty}>No messages yet.</p>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id} 
                className={`${styles.convItem} ${activeUser?.id === conv.id ? styles.active : ''}`}
                onClick={() => setActiveUser(conv)}
              >
                <img 
                  src={conv.profile_picture || 'https://via.placeholder.com/50'} 
                  alt={conv.name} 
                  className={styles.avatar}
                />
                <div className={styles.convInfo}>
                  <div className={styles.convTop}>
                    <span className={styles.convName}>{conv.name}</span>
                    <span className={styles.convTime}>
                      {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={styles.lastMsg}>{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && <span className={styles.unread}>{conv.unread_count}</span>}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.chatArea}>
        {activeUser ? (
          <>
            <div className={styles.chatHeader}>
              <img 
                src={activeUser.profile_picture || 'https://via.placeholder.com/40'} 
                alt={activeUser.name} 
                className={styles.smallAvatar}
              />
              <h3>{activeUser.name}</h3>
            </div>
            
            <div className={styles.messageList}>
              {messages.map((msg, i) => {
                const isMine = msg.sender_id === user.id;
                return (
                  <div key={msg.id || i} className={`${styles.messageWrapper} ${isMine ? styles.mine : styles.theirs}`}>
                    <div className={styles.messageBubble}>
                      <p>{msg.content}</p>
                      <span className={styles.msgTime}>
                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Write a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div className={styles.noActiveChat}>
            <div className={styles.chatPlaceholderIcon}>💬</div>
            <h3>Select a conversation to start messaging</h3>
            <p>Connect and chat with colleagues and recruiters individually.</p>
          </div>
        )}
      </div>
    </div>
  );
}

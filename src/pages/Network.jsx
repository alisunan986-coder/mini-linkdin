/**
 * Network Page - Manage connections and invitations
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Network.module.css';

export default function Network() {
  const { fetchNotifications } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [pending, setPending] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('suggestions'); // Tabs: 'suggestions' or 'connections'

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      const [suggs, pends, conns] = await Promise.all([
        api.connections.getSuggestions(),
        api.connections.getPending(),
        api.connections.getAllAccepted()
      ]);
      setSuggestions(suggs);
      setPending(pends);
      setConnections(conns);
    } catch (err) {
      console.error('Failed to fetch network:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await api.connections.sendRequest(userId);
      setSuggestions(suggestions.filter(s => s.id !== userId));
    } catch (err) {
      alert(err.error || 'Failed to send request');
    }
  };

  const handleAccept = async (userId) => {
    try {
      await api.connections.accept(userId);
      const acceptedUser = pending.find(p => p.id === userId);
      setPending(pending.filter(p => p.id !== userId));
      if (acceptedUser) {
        setConnections(prev => [...prev, acceptedUser]);
      }
      fetchNotifications();
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const handleIgnore = async (userId) => {
    try {
      await api.connections.remove(userId);
      setPending(pending.filter(p => p.id !== userId));
      fetchNotifications();
    } catch (err) {
      alert('Failed to ignore request');
    }
  };

  const handleRemoveConnection = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    try {
      await api.connections.remove(userId);
      setConnections(connections.filter(c => c.id !== userId));
      fetchNetwork();
    } catch (err) {
      alert('Failed to remove connection');
    }
  };

  const filteredSuggestions = suggestions.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.bio?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConnections = connections.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.bio?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', search);
  };

  return (
    <div className={styles.network}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Network</h1>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${view === 'suggestions' ? styles.activeTab : ''}`}
              onClick={() => { setView('suggestions'); setSearch(''); }}
            >
              Suggestions ({suggestions.length})
            </button>
            <button 
              className={`${styles.tab} ${view === 'connections' ? styles.activeTab : ''}`}
              onClick={() => { setView('connections'); setSearch(''); }}
            >
              Connections ({connections.length})
            </button>
          </div>
        </div>
        <form className={styles.searchBox} onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder={view === 'suggestions' ? "Find new people..." : "Search connections..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
      </div>

      {/* Incoming Invitations (Always show if present) */}
      {pending.length > 0 && (
        <section className={styles.pendingSection}>
          <h2 className={styles.sectionTitle}>Pending Invitations</h2>
          <div className={styles.pendingList}>
            {pending.map((p) => (
              <div key={p.id} className={styles.pendingCard}>
                <div className={styles.pendingInfo}>
                  {p.profile_picture ? (
                    <img src={p.profile_picture} className={styles.smallAvatar} />
                  ) : (
                    <div className={styles.smallAvatarPlaceholder}>{p.name.charAt(0)}</div>
                  )}
                  <div>
                    <Link to={`/profile/${p.id}`} className={styles.pendingName}>{p.name}</Link>
                    <p className={styles.pendingBio}>{p.bio || 'New Professional'}</p>
                  </div>
                </div>
                <div className={styles.pendingActions}>
                  <button onClick={() => handleIgnore(p.id)} className={styles.ignoreBtn}>Ignore</button>
                  <button onClick={() => handleAccept(p.id)} className={styles.acceptBtn}>Accept</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === 'connections' ? (
        <section className={styles.connectionsSection}>
          <h2 className={styles.sectionTitle}>Established Connections</h2>
          {connections.length === 0 ? (
            <div className={styles.msg}>
              <p>You haven't connected with anyone yet.</p>
              <button onClick={() => setView('suggestions')} className={styles.discoverBtn}>Discover People</button>
            </div>
          ) : (
            <div className={styles.connectionList}>
               {filteredConnections.map(c => (
                 <div key={c.id} className={styles.connectionItem}>
                    <div className={styles.connInfo}>
                      {c.profile_picture ? (
                        <img src={c.profile_picture} className={styles.connAvatar} />
                      ) : (
                        <div className={styles.connAvatarPlaceholder}>{c.name.charAt(0)}</div>
                      )}
                      <div>
                        <Link to={`/profile/${c.id}`} className={styles.connName}>{c.name}</Link>
                        <p className={styles.connBio}>{c.bio || 'Connected Professional'}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveConnection(c.id)} className={styles.removeBtn}>Remove</button>
                 </div>
               ))}
               {search && filteredConnections.length === 0 && <p className={styles.smallMsg}>No matching connections found.</p>}
            </div>
          )}
        </section>
      ) : (
        <section className={styles.suggestionsSection}>
          <h2 className={styles.sectionTitle}>People you may know</h2>
          {loading ? (
            <p className={styles.msg}>Searching for professionals...</p>
          ) : suggestions.length === 0 ? (
            <p className={styles.msg}>Check back later for more suggestions!</p>
          ) : (
            <div className={styles.grid}>
              {filteredSuggestions.map((u) => (
                <div key={u.id} className={styles.card}>
                  <div className={styles.headerBg}></div>
                  <div className={styles.avatarWrapper}>
                    {u.profile_picture ? (
                      <img src={u.profile_picture} alt="" className={styles.avatar} />
                    ) : (
                      <span className={styles.avatarPlaceholder}>{u.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className={styles.info}>
                    <h2 className={styles.name}>{u.name}</h2>
                    <p className={styles.bio}>{u.bio || 'SmartHire Joiner'}</p>
                    <div className={styles.actions}>
                      <button onClick={() => handleConnect(u.id)} className={styles.connectBtn}>Connect</button>
                      <Link to={`/profile/${u.id}`} className={styles.viewBtn}>View Profile</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {search && filteredSuggestions.length === 0 && suggestions.length > 0 && (
             <p className={styles.smallMsg}>No professionals match your search.</p>
          )}
        </section>
      )}
    </div>
  );
}

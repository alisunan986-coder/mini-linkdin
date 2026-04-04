/**
 * Network Page - Manage connections and invitations
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api.js';
import styles from './Network.module.css';

export default function Network() {
  const [suggestions, setSuggestions] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      const [suggs, pends] = await Promise.all([
        api.connections.getSuggestions(),
        api.connections.getPending()
      ]);
      setSuggestions(suggs);
      setPending(pends);
    } catch (err) {
      console.error('Failed to fetch network:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      await api.connections.sendRequest(userId);
      // Remove from suggestions and move to a "sent" or just filtered state
      setSuggestions(suggestions.filter(s => s.id !== userId));
    } catch (err) {
      alert(err.error || 'Failed to send request');
    }
  };

  const handleAccept = async (userId) => {
    try {
      await api.connections.accept(userId);
      setPending(pending.filter(p => p.id !== userId));
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const handleIgnore = async (userId) => {
    try {
      await api.connections.remove(userId);
      setPending(pending.filter(p => p.id !== userId));
    } catch (err) {
      alert('Failed to ignore request');
    }
  };

  const filteredSuggestions = suggestions.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.bio?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    // The filter is already reactive, but the button provides a UX affordance
    console.log('Searching for:', search);
  };

  return (
    <div className={styles.network}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Network</h1>
        <form onSubmit={handleSearch} className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search people you may know..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
      </div>

      {pending.length > 0 && (
        <section className={styles.pendingSection}>
          <h2 className={styles.sectionTitle}>Pending Invitations ({pending.length})</h2>
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
                    <p className={styles.pendingBio}>{p.bio || 'New to SmartHire'}</p>
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

      <section className={styles.suggestionsSection}>
        <h2 className={styles.sectionTitle}>People you may know</h2>
        {loading ? (
          <p className={styles.msg}>Discovering professional connections...</p>
        ) : filteredSuggestions.length === 0 ? (
          <p className={styles.msg}>No suggestions at the moment. Try searching!</p>
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
                  <p className={styles.bio}>{u.bio || 'Professional'}</p>
                  <div className={styles.actions}>
                    <button onClick={() => handleConnect(u.id)} className={styles.connectBtn}>
                      Connect
                    </button>
                    <Link to={`/profile/${u.id}`} className={styles.viewBtn}>View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

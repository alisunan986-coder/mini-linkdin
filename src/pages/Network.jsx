import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api.js';
import styles from './Network.module.css';

export default function Network() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchFunc = search.trim() ? api.users.search(search) : api.users.getAll();
    fetchFunc
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className={styles.network}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Network</h1>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>
      {loading ? (
        <p className={styles.loading}>Loading network...</p>
      ) : users.length === 0 ? (
        <p className={styles.empty}>No users found.</p>
      ) : (
        <div className={styles.grid}>
          {users.map((u) => (
            <div key={u.id} className={styles.card}>
              <div className={styles.headerBg}></div>
              <div className={styles.avatarWrapper}>
                {u.profile_picture ? (
                  <img src={u.profile_picture} alt="" className={styles.avatar} />
                ) : (
                  <span className={styles.avatarPlaceholder}>
                    {u.name?.charAt(0) ?? '?'}
                  </span>
                )}
              </div>
              <div className={styles.info}>
                <h2 className={styles.name}>{u.name}</h2>
                <p className={styles.bio}>{u.bio || 'No bio provided'}</p>
                <Link to={`/profile/${u.id}`} className={styles.viewBtn}>
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

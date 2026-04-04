/**
 * Edit Profile page - Update name, bio, email, profile picture URL
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/api.js';
import styles from './EditProfile.module.css';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.users
      .getMe()
      .then((data) => {
        setName(data.name ?? '');
        setBio(data.bio ?? '');
        setEmail(data.email ?? '');
        setProfilePicture(data.profile_picture ?? '');
      })
      .finally(() => setLoadingForm(false));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || loading) return;
    setLoading(true);
    try {
      let body;
      if (avatarFile) {
        body = new FormData();
        body.append('name', name);
        body.append('bio', bio);
        body.append('email', email);
        if (password.length >= 6) body.append('password', password);
        body.append('avatar', avatarFile);
      } else {
        body = { name, bio, email };
        if (profilePicture.trim() !== '') body.profile_picture = profilePicture.trim();
        if (password.length >= 6) body.password = password;
      }
      const updated = await api.users.updateMe(body);
      updateUser(updated);
      navigate(`/profile/${user.id}`);
    } catch (err) {
      console.error('Profile update error:', err);
      alert(err.error || err.errors?.[0]?.msg || 'Update failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (loadingForm) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.editProfile}>
      <h1 className={styles.title}>Edit profile</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={styles.textarea}
            placeholder="A short bio about you"
          />
        </label>
        <label className={styles.label}>
          Profile picture
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
            className={styles.input}
          />
          {profilePicture && !avatarFile && <small>Current: {profilePicture}</small>}
        </label>
        <label className={styles.label}>
          New password (leave blank to keep current)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="Min 6 characters"
            minLength={6}
          />
        </label>
        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

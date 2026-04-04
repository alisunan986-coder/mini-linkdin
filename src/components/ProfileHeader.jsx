/**
 * ProfileHeader - Displays user name, bio, profile picture
 * Used on Profile page and in post cards
 */
import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ user, isOwnProfile }) {
  const name = user?.name ?? 'Unknown';
  const bio = user?.bio ?? '';
  const profilePicture = user?.profile_picture;

  return (
    <header className={styles.profileHeader}>
      <div className={styles.avatarWrap}>
        {profilePicture ? (
          <img src={profilePicture} alt="" className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>{name.charAt(0).toUpperCase()}</div>
        )}
      </div>
      <div className={styles.info}>
        <h1 className={styles.name}>{name}</h1>
        {bio && <p className={styles.bio}>{bio}</p>}
        {user?.email && isOwnProfile && (
          <p className={styles.email}>{user.email}</p>
        )}
      </div>
    </header>
  );
}

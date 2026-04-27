/**
 * Layout - Navbar and outlet for authenticated pages
 */
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  const { logout, notificationCount } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>Mini LinkedIn</Link>
        <nav className={styles.nav}>
          <Link to="/">Feed</Link>
          <Link to="/network" className={styles.navLink}>
            Network
            {notificationCount > 0 && (
              <span className={styles.badge}>{notificationCount}</span>
            )}
          </Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/messaging">Messaging</Link>
          <Link to="/my-applications">My Apps</Link>
          <Link to="/profile/me">Profile</Link>
          <Link to="/profile/edit">Edit Profile</Link>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

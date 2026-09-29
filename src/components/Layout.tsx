import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout, user } = useAuth();

  return (
    <div className="app-layout">
      <nav className="app-nav">
        <div className="nav-content">
          <Link to="/dashboard" className="logo">FawnXStrava</Link>
          
          <div className="nav-menu">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/track" className="nav-link">Track</Link>
            <Link to="/activities" className="nav-link">Activities</Link>
            <Link to="/social" className="nav-link">Feed</Link>
            <Link to="/stats" className="nav-link">Stats</Link>
            <Link to="/achievements" className="nav-link">Achievements</Link>
            <Link to="/search" className="nav-link">Search</Link>
          </div>

          <div className="nav-actions">
            <Link to="/notifications" className="nav-icon" aria-label="Notifications">
              🔔
            </Link>
            <Link to="/profile" className="nav-profile">
              {user?.avatar ? <img src={user.avatar} alt={user.username} /> : user?.username?.[0]?.toUpperCase()}
            </Link>
            <Link to="/settings" className="nav-icon" aria-label="Settings">
              ⚙️
            </Link>
            <button onClick={logout} className="btn-text">Logout</button>
          </div>
        </div>
      </nav>

      <main className="app-main">{children}</main>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="container">
          <h1 className="logo">FawnXStrava</h1>
          <div className="nav-links">
            <Link to="/login" className="btn-text">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero">
          <div className="container">
            <h2 className="hero-title">Track Your Journey</h2>
            <p className="hero-subtitle">
              Record your activities, analyze your progress, and share your achievements
            </p>
            <Link to="/register" className="btn-primary btn-large">Start Tracking</Link>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <div className="feature-grid">
              <div className="feature">
                <div className="feature-icon">📍</div>
                <h3>GPS Tracking</h3>
                <p>Real-time location tracking with accurate route recording</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📊</div>
                <h3>Detailed Analytics</h3>
                <p>Track distance, pace, elevation, and more</p>
              </div>
              <div className="feature">
                <div className="feature-icon">🏆</div>
                <h3>Achievements</h3>
                <p>Unlock achievements as you progress</p>
              </div>
              <div className="feature">
                <div className="feature-icon">👥</div>
                <h3>Social Features</h3>
                <p>Follow friends and share your activities</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2026 FawnXStrava. Track your journey.</p>
        </div>
      </footer>
    </div>
  );
}

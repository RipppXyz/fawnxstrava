import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.stats.getDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (error) return <Layout><div className="error">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <Link to="/track" className="btn-primary">Start Activity</Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Today</h3>
            <div className="stat-value">{(stats.today.distance / 1000).toFixed(2)} km</div>
            <div className="stat-label">{stats.today.count} activities</div>
          </div>

          <div className="stat-card">
            <h3>This Week</h3>
            <div className="stat-value">{(stats.week.distance / 1000).toFixed(2)} km</div>
            <div className="stat-label">{stats.week.count} activities · {formatDuration(stats.week.duration)}</div>
          </div>

          <div className="stat-card">
            <h3>This Month</h3>
            <div className="stat-value">{(stats.month.distance / 1000).toFixed(2)} km</div>
            <div className="stat-label">{stats.month.count} activities · {formatDuration(stats.month.duration)}</div>
          </div>
        </div>

        <div className="recent-activities">
          <h2>Recent Activities</h2>
          {stats.recent.length === 0 ? (
            <div className="empty-state">
              <p>No activities yet</p>
              <Link to="/track" className="btn-primary">Start your first activity</Link>
            </div>
          ) : (
            <div className="activity-list">
              {stats.recent.map((activity: any) => (
                <Link key={activity.id} to={`/activities/${activity.id}`} className="activity-item">
                  <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                  <div className="activity-info">
                    <h4>{activity.name}</h4>
                    <p>{new Date(activity.started_at).toLocaleDateString()} · {(activity.distance / 1000).toFixed(2)} km · {formatDuration(activity.duration)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m ${seconds % 60}s`;
}

function getActivityIcon(type: string) {
  const icons: Record<string, string> = {
    run: '🏃',
    bike: '🚴',
    walk: '🚶',
    hike: '🥾',
    swim: '🏊',
  };
  return icons[type] || '📍';
}

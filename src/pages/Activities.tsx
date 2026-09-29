import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Activities() {
  const [activities, setActivities] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivities();
  }, [filter, sort]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const params: any = { sort };
      if (filter !== 'all') params.type = filter;
      
      const data = await api.activities.getAll(params);
      setActivities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="activities-page">
        <div className="page-header">
          <h1>My Activities</h1>
          <Link to="/track" className="btn-primary">New Activity</Link>
        </div>

        <div className="activities-filters">
          <div className="filter-group">
            <label>Type</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="run">Run</option>
              <option value="bike">Bike</option>
              <option value="walk">Walk</option>
              <option value="hike">Hike</option>
              <option value="swim">Swim</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="date">Date</option>
              <option value="distance">Distance</option>
            </select>
          </div>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && activities.length === 0 && (
          <div className="empty-state">
            <p>No activities yet</p>
            <Link to="/track" className="btn-primary">Start your first activity</Link>
          </div>
        )}

        <div className="activities-list">
          {activities.map((activity) => (
            <Link key={activity.id} to={`/activities/${activity.id}`} className="activity-card">
              <div className="activity-card-icon">{getActivityIcon(activity.type)}</div>
              <div className="activity-card-content">
                <h3>{activity.name}</h3>
                <div className="activity-card-stats">
                  <span>{(activity.distance / 1000).toFixed(2)} km</span>
                  <span>·</span>
                  <span>{formatDuration(activity.duration)}</span>
                  <span>·</span>
                  <span>{new Date(activity.started_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
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

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m ${seconds % 60}s`;
}

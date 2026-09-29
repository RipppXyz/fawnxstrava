import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Social() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const data = await api.activities.getFeed();
      setActivities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (activityId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await api.social.unlike(activityId.toString());
      } else {
        await api.social.like(activityId.toString());
      }
      loadFeed();
    } catch (err: any) {
      console.error('Like failed:', err);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (error) return <Layout><div className="error">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="social-page">
        <h1>Activity Feed</h1>

        {activities.length === 0 ? (
          <div className="empty-state">
            <p>No activities in your feed</p>
            <p>Follow others to see their activities here</p>
            <Link to="/search" className="btn-primary">Find People</Link>
          </div>
        ) : (
          <div className="feed-list">
            {activities.map((activity) => (
              <div key={activity.id} className="feed-item">
                <div className="feed-header">
                  <Link to={`/profile/${activity.user_id}`} className="feed-user">
                    {activity.avatar ? (
                      <img src={activity.avatar} alt={activity.username} className="avatar" />
                    ) : (
                      <div className="avatar">{activity.username[0].toUpperCase()}</div>
                    )}
                    <div>
                      <strong>{activity.display_name}</strong>
                      <div className="feed-date">{new Date(activity.started_at).toLocaleDateString()}</div>
                    </div>
                  </Link>
                </div>

                <Link to={`/activities/${activity.id}`} className="feed-content">
                  <h3>{activity.name}</h3>
                  <div className="feed-stats">
                    <span>📍 {(activity.distance / 1000).toFixed(2)} km</span>
                    <span>⏱️ {formatDuration(activity.duration)}</span>
                    <span>⚡ {activity.avg_speed?.toFixed(1) || 0} km/h</span>
                  </div>
                </Link>

                <div className="feed-actions">
                  <button
                    onClick={() => handleLike(activity.id, !!activity.user_liked)}
                    className={`btn-icon ${activity.user_liked ? 'active' : ''}`}
                  >
                    {activity.user_liked ? '❤️' : '🤍'} {activity.likes_count}
                  </button>
                  <Link to={`/activities/${activity.id}`} className="btn-icon">
                    💬 {activity.comments_count}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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
  return `${minutes}m`;
}

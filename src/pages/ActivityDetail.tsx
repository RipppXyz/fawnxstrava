import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import MapView from '../components/MapView';

export default function ActivityDetail() {
  const { id } = useParams();
  const [activity, setActivity] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivity();
    loadComments();
  }, [id]);

  const loadActivity = async () => {
    try {
      const data = await api.activities.getById(id!);
      setActivity(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.social.getComments(id!);
      setComments(data);
    } catch (err: any) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleLike = async () => {
    try {
      if (activity.user_liked) {
        await api.social.unlike(id!);
      } else {
        await api.social.like(id!);
      }
      loadActivity();
    } catch (err: any) {
      console.error('Like failed:', err);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.social.comment(id!, newComment);
      setNewComment('');
      loadComments();
      loadActivity();
    } catch (err: any) {
      console.error('Comment failed:', err);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (error) return <Layout><div className="error">Error: {error}</div></Layout>;
  if (!activity) return <Layout><div className="error">Activity not found</div></Layout>;

  return (
    <Layout>
      <div className="activity-detail">
        <div className="activity-header">
          <div className="activity-user">
            <Link to={`/profile/${activity.user_id}`}>
              {activity.avatar ? (
                <img src={activity.avatar} alt={activity.username} className="avatar" />
              ) : (
                <div className="avatar">{activity.username[0].toUpperCase()}</div>
              )}
            </Link>
            <div>
              <Link to={`/profile/${activity.user_id}`}>
                <strong>{activity.display_name}</strong>
              </Link>
              <div className="activity-date">{new Date(activity.started_at).toLocaleDateString()}</div>
            </div>
          </div>
          <h1>{activity.name}</h1>
        </div>

        <div className="activity-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Distance</div>
            <div className="stat-value">{(activity.distance / 1000).toFixed(2)} km</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Duration</div>
            <div className="stat-value">{formatDuration(activity.duration)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Speed</div>
            <div className="stat-value">{activity.avg_speed?.toFixed(1) || 0} km/h</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Max Speed</div>
            <div className="stat-value">{activity.max_speed?.toFixed(1) || 0} km/h</div>
          </div>
        </div>

        {activity.gpsPoints && activity.gpsPoints.length > 0 && (
          <div className="activity-map">
            <MapView route={activity.gpsPoints} />
          </div>
        )}

        <div className="activity-actions">
          <button onClick={handleLike} className={`btn-icon ${activity.user_liked ? 'active' : ''}`}>
            {activity.user_liked ? '❤️' : '🤍'} {activity.likes_count}
          </button>
          <button className="btn-icon">💬 {activity.comments_count}</button>
        </div>

        <div className="comments-section">
          <h3>Comments</h3>
          
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit" className="btn-primary">Post</button>
          </form>

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-avatar">
                  {comment.avatar ? (
                    <img src={comment.avatar} alt={comment.username} />
                  ) : (
                    <div>{comment.username[0].toUpperCase()}</div>
                  )}
                </div>
                <div className="comment-content">
                  <div className="comment-author">{comment.display_name}</div>
                  <div className="comment-text">{comment.content}</div>
                  <div className="comment-date">{new Date(comment.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
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
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  return `${minutes}m ${seconds % 60}s`;
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      loadNotifications();
    } catch (err: any) {
      console.error('Mark read failed:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      loadNotifications();
    } catch (err: any) {
      console.error('Mark all read failed:', err);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (error) return <Layout><div className="error">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="notifications-page">
        <div className="page-header">
          <h1>Notifications</h1>
          {notifications.some(n => !n.is_read) && (
            <button onClick={handleMarkAllRead} className="btn-text">
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                onClick={() => !notification.is_read && handleMarkRead(notification.id)}
              >
                <div className="notification-icon">{getNotificationIcon(notification.type)}</div>
                <div className="notification-content">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <div className="notification-date">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
                {notification.related_id && notification.type !== 'follow' && (
                  <Link to={`/activities/${notification.related_id}`} className="btn-text">
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function getNotificationIcon(type: string) {
  const icons: Record<string, string> = {
    like: '❤️',
    comment: '💬',
    follow: '👥',
    achievement: '🏆',
  };
  return icons[type] || '🔔';
}

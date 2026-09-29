import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('activities');

  const isOwnProfile = !id || id === currentUser?.id?.toString();

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const data = isOwnProfile ? await api.users.getMe() : await api.users.getById(id!);
      setUser(data);
      setDisplayName(data.display_name || '');
      setBio(data.bio || '');
      setAvatar(data.avatar || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.users.updateMe({ displayName, bio, avatar });
      setEditing(false);
      await refreshUser();
      loadProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFollow = async () => {
    try {
      if (user.isFollowing) {
        await api.social.unfollow(id!);
      } else {
        await api.social.follow(id!);
      }
      loadProfile();
    } catch (err: any) {
      console.error('Follow failed:', err);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (error) return <Layout><div className="error">Error: {error}</div></Layout>;
  if (!user) return <Layout><div className="error">User not found</div></Layout>;

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">{user.username[0].toUpperCase()}</div>
            )}
          </div>
          
          <div className="profile-info">
            <h1>{user.display_name || user.username}</h1>
            <p className="profile-username">@{user.username}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            
            <div className="profile-stats">
              <div className="profile-stat">
                <strong>{user.stats.activities}</strong>
                <span>Activities</span>
              </div>
              <div className="profile-stat">
                <strong>{(user.stats.distance / 1000).toFixed(0)}</strong>
                <span>km</span>
              </div>
              <div className="profile-stat">
                <strong>{user.stats.followers}</strong>
                <span>Followers</span>
              </div>
              <div className="profile-stat">
                <strong>{user.stats.following}</strong>
                <span>Following</span>
              </div>
            </div>

            {isOwnProfile ? (
              <button onClick={() => setEditing(!editing)} className="btn-secondary">
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : (
              <button onClick={handleFollow} className={user.isFollowing ? 'btn-secondary' : 'btn-primary'}>
                {user.isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {editing && (
          <div className="profile-edit">
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar">Avatar URL</label>
              <input
                id="avatar"
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>

            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>
        )}

        <div className="profile-tabs">
          <button
            className={tab === 'activities' ? 'active' : ''}
            onClick={() => setTab('activities')}
          >
            Activities
          </button>
          <button
            className={tab === 'achievements' ? 'active' : ''}
            onClick={() => setTab('achievements')}
          >
            Achievements
          </button>
        </div>

        <div className="profile-content">
          {tab === 'activities' && <ProfileActivities userId={id || currentUser?.id} />}
          {tab === 'achievements' && <ProfileAchievements userId={id || currentUser?.id} />}
        </div>
      </div>
    </Layout>
  );
}

function ProfileActivities({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      const data = await api.activities.getAll({ limit: 20 });
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <Link key={activity.id} to={`/activities/${activity.id}`} className="activity-item">
          <div className="activity-icon">{getActivityIcon(activity.type)}</div>
          <div className="activity-info">
            <h4>{activity.name}</h4>
            <p>
              {new Date(activity.started_at).toLocaleDateString()} · {(activity.distance / 1000).toFixed(2)} km
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProfileAchievements({ userId }: { userId: string }) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      const data = await api.achievements.getByUser(userId);
      setAchievements(data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="achievements-grid">
      {achievements.map((achievement) => (
        <div key={achievement.id} className={`achievement-card ${achievement.unlocked_at ? 'unlocked' : 'locked'}`}>
          <div className="achievement-icon">{achievement.icon}</div>
          <h4>{achievement.name}</h4>
          <p>{achievement.description}</p>
          {achievement.unlocked_at && (
            <div className="achievement-date">
              Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
            </div>
          )}
        </div>
      ))}
    </div>
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

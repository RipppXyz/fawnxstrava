import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await api.settings.update(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="settings-page">
        <h1>Settings</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Settings saved successfully</div>}

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked ? 1 : 0 })}
              />
              Enable notifications
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Location</h2>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.location_tracking}
                onChange={(e) => setSettings({ ...settings, location_tracking: e.target.checked ? 1 : 0 })}
              />
              Enable location tracking
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Privacy</h2>
          
          <div className="form-group">
            <label htmlFor="profilePrivacy">Profile Visibility</label>
            <select
              id="profilePrivacy"
              value={settings.privacy_profile}
              onChange={(e) => setSettings({ ...settings, privacy_profile: e.target.value })}
            >
              <option value="public">Public</option>
              <option value="followers">Followers Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="activitiesPrivacy">Activities Visibility</label>
            <select
              id="activitiesPrivacy"
              value={settings.privacy_activities}
              onChange={(e) => setSettings({ ...settings, privacy_activities: e.target.value })}
            >
              <option value="public">Public</option>
              <option value="followers">Followers Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </Layout>
  );
}

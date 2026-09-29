import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await api.achievements.getAll();
      setAchievements(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (error) return <Layout><div className="error">Error: {error}</div></Layout>;

  const unlocked = achievements.filter(a => a.unlocked_at);
  const locked = achievements.filter(a => !a.unlocked_at);

  return (
    <Layout>
      <div className="achievements-page">
        <h1>Achievements</h1>
        <p className="achievements-summary">
          {unlocked.length} of {achievements.length} unlocked
        </p>

        {unlocked.length > 0 && (
          <>
            <h2>Unlocked</h2>
            <div className="achievements-grid">
              {unlocked.map((achievement) => (
                <div key={achievement.id} className="achievement-card unlocked">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-date">
                    {new Date(achievement.unlocked_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {locked.length > 0 && (
          <>
            <h2>Locked</h2>
            <div className="achievements-grid">
              {locked.map((achievement) => (
                <div key={achievement.id} className="achievement-card locked">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.description}</p>
                  <div className="achievement-status">🔒 Locked</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

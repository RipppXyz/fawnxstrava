import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Stats() {
  const [period, setPeriod] = useState('week');
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrends();
  }, [period]);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const data = await api.stats.getTrends(period);
      setTrends(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (error) return <Layout><div className="error">Error: {error}</div></Layout>;

  const totalDistance = trends.reduce((sum, day) => sum + (day.distance || 0), 0);
  const totalActivities = trends.reduce((sum, day) => sum + (day.count || 0), 0);
  const totalDuration = trends.reduce((sum, day) => sum + (day.duration || 0), 0);

  return (
    <Layout>
      <div className="stats-page">
        <div className="page-header">
          <h1>Statistics</h1>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div className="stats-summary">
          <div className="stat-card">
            <h3>Total Distance</h3>
            <div className="stat-value">{(totalDistance / 1000).toFixed(2)} km</div>
          </div>
          <div className="stat-card">
            <h3>Activities</h3>
            <div className="stat-value">{totalActivities}</div>
          </div>
          <div className="stat-card">
            <h3>Total Time</h3>
            <div className="stat-value">{formatDuration(totalDuration)}</div>
          </div>
        </div>

        <div className="stats-chart">
          <h2>Daily Distance</h2>
          <div className="chart">
            {trends.map((day, index) => {
              const maxDistance = Math.max(...trends.map(d => d.distance || 0));
              const height = maxDistance > 0 ? ((day.distance || 0) / maxDistance) * 100 : 0;
              
              return (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar" style={{ height: `${height}%` }} title={`${(day.distance / 1000).toFixed(2)} km`} />
                  <div className="chart-label">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stats-list">
          <h2>Daily Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activities</th>
                <th>Distance</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((day, index) => (
                <tr key={index}>
                  <td>{new Date(day.date).toLocaleDateString()}</td>
                  <td>{day.count}</td>
                  <td>{(day.distance / 1000).toFixed(2)} km</td>
                  <td>{formatDuration(day.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  return `${minutes}m`;
}

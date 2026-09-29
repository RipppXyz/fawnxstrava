import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { useLocation } from '../hooks/useLocation';
import MapView from '../components/MapView';

export default function Track() {
  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [activityType, setActivityType] = useState('run');
  const [activityName, setActivityName] = useState('');
  const [gpsPoints, setGpsPoints] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { position, error: locationError, requestPermission } = useLocation();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const lastPositionRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tracking && !paused && position) {
      const point = {
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: position.altitude,
        accuracy: position.accuracy,
        speed: position.speed,
        timestamp: Date.now()
      };

      setGpsPoints(prev => [...prev, point]);

      if (lastPositionRef.current) {
        const dist = calculateDistance(
          lastPositionRef.current.latitude,
          lastPositionRef.current.longitude,
          position.latitude,
          position.longitude
        );
        setDistance(prev => prev + dist);
      }

      if (position.speed) {
        setSpeed(position.speed * 3.6);
      }

      lastPositionRef.current = position;
    }
  }, [position, tracking, paused]);

  useEffect(() => {
    if (tracking && !paused) {
      intervalRef.current = setInterval(() => {
        setDuration(Date.now() - startTimeRef.current - pausedTimeRef.current);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tracking, paused]);

  const handleStart = async () => {
    if (!position && !locationError) {
      const granted = await requestPermission();
      if (!granted) {
        setError('Location permission required');
        return;
      }
    }

    if (locationError) {
      setError('Location not available: ' + locationError);
      return;
    }

    setTracking(true);
    setPaused(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    setError('');
  };

  const handlePause = () => {
    setPaused(true);
    pausedTimeRef.current += Date.now() - startTimeRef.current;
  };

  const handleResume = () => {
    setPaused(false);
    startTimeRef.current = Date.now();
  };

  const handleFinish = async () => {
    if (gpsPoints.length < 2) {
      setError('Need more GPS data to save activity');
      return;
    }

    const name = activityName || `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} - ${new Date().toLocaleDateString()}`;
    
    const speeds = gpsPoints.filter(p => p.speed).map(p => p.speed * 3.6);
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;

    setSaving(true);

    try {
      const result = await api.activities.create({
        type: activityType,
        name,
        distance,
        duration,
        avgSpeed,
        maxSpeed,
        elevationGain: 0,
        elevationLoss: 0,
        startedAt: startTimeRef.current,
        finishedAt: Date.now(),
        gpsPoints
      });

      navigate(`/activities/${result.id}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="track-page">
        <div className="track-header">
          <h1>Track Activity</h1>
          {!tracking && (
            <div className="form-group">
              <label htmlFor="activityType">Activity Type</label>
              <select
                id="activityType"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
              >
                <option value="run">Run</option>
                <option value="bike">Bike</option>
                <option value="walk">Walk</option>
                <option value="hike">Hike</option>
                <option value="swim">Swim</option>
              </select>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="track-stats">
          <div className="track-stat">
            <div className="stat-value">{(distance / 1000).toFixed(2)}</div>
            <div className="stat-label">km</div>
          </div>
          <div className="track-stat">
            <div className="stat-value">{formatDuration(duration)}</div>
            <div className="stat-label">time</div>
          </div>
          <div className="track-stat">
            <div className="stat-value">{speed.toFixed(1)}</div>
            <div className="stat-label">km/h</div>
          </div>
        </div>

        <div className="track-map">
          <MapView route={gpsPoints} currentPosition={position} />
        </div>

        <div className="track-controls">
          {!tracking ? (
            <button onClick={handleStart} className="btn-primary btn-large">
              Start Activity
            </button>
          ) : (
            <>
              {!paused ? (
                <button onClick={handlePause} className="btn-secondary btn-large">
                  Pause
                </button>
              ) : (
                <button onClick={handleResume} className="btn-secondary btn-large">
                  Resume
                </button>
              )}
              <button onClick={handleFinish} className="btn-primary btn-large" disabled={saving}>
                {saving ? 'Saving...' : 'Finish'}
              </button>
            </>
          )}
        </div>

        {tracking && (
          <div className="form-group">
            <label htmlFor="activityName">Activity Name (optional)</label>
            <input
              id="activityName"
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder={`${activityType.charAt(0).toUpperCase() + activityType.slice(1)} - ${new Date().toLocaleDateString()}`}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const h = hours.toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  
  return `${h}:${m}:${s}`;
}

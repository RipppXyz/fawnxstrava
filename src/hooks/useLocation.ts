import { useState, useEffect } from 'react';

interface Position {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  speed: number | null;
  heading: number | null;
}

export function useLocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string>('');
  const [permission, setPermission] = useState<PermissionState | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (!navigator.permissions) return;

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setPermission(result.state);

      result.addEventListener('change', () => {
        setPermission(result.state);
      });
    } catch (err) {
      console.error('Permission check failed:', err);
    }
  };

  const requestPermission = async () => {
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPermission('granted');
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
          });
          setError('');
          resolve(true);
        },
        (err) => {
          setError(err.message);
          setPermission('denied');
          resolve(false);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  useEffect(() => {
    if (!navigator.geolocation || permission !== 'granted') return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
        });
        setError('');
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [permission]);

  return { position, error, permission, requestPermission };
}

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  route?: Array<{ latitude: number; longitude: number }>;
  currentPosition?: { latitude: number; longitude: number } | null;
  height?: string;
}

export default function MapView({ route, currentPosition, height = '400px' }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([0, 0], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetmap',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    if (route && route.length > 0) {
      const latLngs = route.map(p => [p.latitude, p.longitude] as [number, number]);
      
      L.polyline(latLngs, { color: '#007aff', weight: 4 }).addTo(mapRef.current);

      const bounds = L.latLngBounds(latLngs);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });

      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #34c759; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
      });

      const endIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #ff3b30; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
      });

      L.marker(latLngs[0], { icon: startIcon }).addTo(mapRef.current);
      L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).addTo(mapRef.current);
    } else if (currentPosition) {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background: #007aff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,122,255,0.5);"></div>',
        iconSize: [22, 22],
      });

      L.marker([currentPosition.latitude, currentPosition.longitude], { icon }).addTo(mapRef.current);
      mapRef.current.setView([currentPosition.latitude, currentPosition.longitude], 15);
    }
  }, [route, currentPosition]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}

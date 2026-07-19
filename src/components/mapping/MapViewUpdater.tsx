import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapViewUpdaterProps {
  center: [number, number];
  zoom: number;
}

/**
 * A sub-component helper for React Leaflet that allows programmatically
 * centering and zooming the map using Leaflet's setView method dynamically.
 */
export default function MapViewUpdater({ center, zoom }: MapViewUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 0.75 // Animation duration in seconds
    });
  }, [center, zoom, map]);

  return null;
}

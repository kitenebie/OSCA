import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

interface AddressMapPickerProps {
  value: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }) => void;
  defaultBarangayCoords?: { lat: number; lng: number };
}

// 100% bulletproof Custom Divine SVG Pin Marker to prevent Vite-Leaflet icon bugs
const customMarkerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div class="flex flex-col items-center select-none transform -translate-y-8 -translate-x-1/2">
      <div class="w-8 h-8 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center shadow-lg relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="absolute -bottom-1 w-2 h-2 bg-teal-600 rotate-45"></span>
      </div>
      <div class="w-2.5 h-1 bg-slate-900/30 blur-[1px] rounded-full mt-0.5"></div>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [0, 0] // Anchor matches the custom HTML offset
});

// Component to handle map clicks and marker dragging
function MapEventHandler({ onChange }: { onChange: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

// Component to fly map center when barangay changes
function ChangeMapCenter({ coords }: { coords: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 15, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

export default function AddressMapPicker({ value, onChange, defaultBarangayCoords }: AddressMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([value.lat, value.lng]);

  useEffect(() => {
    setPosition([value.lat, value.lng]);
  }, [value]);

  const handleMarkerDragEnd = (e: any) => {
    const marker = e.target;
    if (marker != null) {
      const latLng = marker.getLatLng();
      onChange({ lat: latLng.lat, lng: latLng.lng });
    }
  };

  const centerToDefault = () => {
    // Default center of Juban LGU (Municipal Hall)
    onChange({ lat: 12.8753, lng: 123.9878 });
  };

  return (
    <div className="relative border border-slate-200 rounded-xl overflow-hidden shadow-inner h-80 bg-slate-100 flex flex-col">
      {/* Mini Controls overlay */}
      <div className="absolute top-2.5 right-2.5 z-[500] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={centerToDefault}
          className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-md border border-slate-200/50 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
          title="Centering map to Juban LGU Hall"
        >
          <Navigation size={13} className="text-teal-600 fill-teal-600/10" />
          <span>LGU Hall</span>
        </button>
      </div>

      {/* Actual Map element */}
      <div className="flex-1 h-full w-full">
        <MapContainer 
          center={[value.lat, value.lng]} 
          zoom={14} 
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEventHandler onChange={onChange} />
          {defaultBarangayCoords && <ChangeMapCenter coords={defaultBarangayCoords} />}
          <Marker 
            position={position} 
            icon={customMarkerIcon}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
          />
        </MapContainer>
      </div>

      {/* Latitude / Longitude Indicator Bar */}
      <div className="bg-slate-900 px-4 py-2 text-[10px] text-slate-300 font-mono flex items-center justify-between shrink-0 border-t border-slate-800 relative z-30">
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-teal-400" />
          <span className="font-semibold text-white uppercase tracking-wider">Exact Geotag:</span>
        </div>
        <div className="flex gap-4">
          <span>LAT: <span className="text-teal-400 font-bold">{value.lat.toFixed(6)}</span></span>
          <span>LNG: <span className="text-teal-400 font-bold">{value.lng.toFixed(6)}</span></span>
        </div>
      </div>
    </div>
  );
}

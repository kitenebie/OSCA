import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { useSeniorsStore } from '../store/seniorsStore';
import { useUIStore } from '../store/uiStore';
import { MapPin, Users, Heart, Building2, Search, Map as MapIcon, ChevronRight } from 'lucide-react';
import { SeniorCitizen } from '../types';
import MapViewUpdater from '../components/mapping/MapViewUpdater';
import MarkerClusterGroup from '../components/mapping/MarkerClusterGroup';

// Import Leaflet MarkerCluster CSS files
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Coordinates for all Juban Sorsogon barangays in the database
const barangayCoordinates: Record<string, { lat: number; lng: number }> = {
  'Añog': { lat: 12.865, lng: 123.998 },
  'Bacolod': { lat: 12.872, lng: 123.981 },
  'Binanuahan': { lat: 12.898, lng: 123.992 },
  'Biriran': { lat: 12.855, lng: 123.975 },
  'Buraburan': { lat: 12.842, lng: 124.015 },
  'Calateo': { lat: 12.887, lng: 124.008 },
  'Calmayon': { lat: 12.835, lng: 123.989 },
  'Cogon': { lat: 12.891, lng: 123.982 },
  'Embarcadero': { lat: 12.895, lng: 123.972 },
  'Guruyan': { lat: 12.861, lng: 123.962 },
  'Lajong': { lat: 12.912, lng: 123.979 },
  'Maalo': { lat: 12.851, lng: 124.004 },
  'North Poblacion': { lat: 12.882, lng: 123.988 },
  'South Poblacion': { lat: 12.878, lng: 123.988 }
};

// Center of Juban, Sorsogon
const JUBAN_CENTER: [number, number] = [12.8797, 123.9878];

const getCoordinatesForBarangay = (brgy: string): { lat: number; lng: number } => {
  if (barangayCoordinates[brgy]) return barangayCoordinates[brgy];
  
  // Deterministic fallback generator for new/custom barangays
  let hash = 0;
  for (let i = 0; i < brgy.length; i++) {
    hash = brgy.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((hash & 0xFF) / 255 - 0.5) * 0.04;
  const lngOffset = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.04;
  
  return {
    lat: JUBAN_CENTER[0] + latOffset,
    lng: JUBAN_CENTER[1] + lngOffset
  };
};

export default function MappingPage() {
  const { seniors } = useSeniorsStore();
  const { setCurrentPage } = useUIStore();
  const [selectedBrgyName, setSelectedBrgyName] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(JUBAN_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [brgySearch, setBrgySearch] = useState<string>('');

  // Process mapping statistics
  const mappingData = useMemo(() => {
    const groups: Record<string, {
      name: string;
      seniors: SeniorCitizen[];
      coordinates: { lat: number; lng: number };
      approvedCount: number;
      pendingCount: number;
      pensionCount: number;
    }> = {};

    seniors.forEach((senior) => {
      const brgy = senior.barangay;
      if (!groups[brgy]) {
        groups[brgy] = {
          name: brgy,
          seniors: [],
          coordinates: getCoordinatesForBarangay(brgy),
          approvedCount: 0,
          pendingCount: 0,
          pensionCount: 0
        };
      }
      groups[brgy].seniors.push(senior);
      if (senior.status === 'Approved') groups[brgy].approvedCount++;
      if (senior.status === 'Pending') groups[brgy].pendingCount++;
      if (senior.pensionBeneficiary) groups[brgy].pensionCount++;
    });

    return Object.values(groups).sort((a, b) => b.seniors.length - a.seniors.length);
  }, [seniors]);

  // General metrics
  const totalSeniorsCount = seniors.length;
  const totalBarangaysCount = mappingData.length;
  
  const mostPopulatedBrgy = useMemo(() => {
    if (mappingData.length === 0) return { name: 'N/A', count: 0 };
    return {
      name: mappingData[0].name,
      count: mappingData[0].seniors.length
    };
  }, [mappingData]);

  const pensionerPercentage = useMemo(() => {
    if (totalSeniorsCount === 0) return 0;
    const count = seniors.filter((s) => s.pensionBeneficiary).length;
    return Math.round((count / totalSeniorsCount) * 100);
  }, [seniors, totalSeniorsCount]);

  // Filtered leaderboard list
  const filteredMappingData = useMemo(() => {
    return mappingData.filter((item) =>
      item.name.toLowerCase().includes(brgySearch.toLowerCase())
    );
  }, [mappingData, brgySearch]);

  // Currently selected barangay details
  const selectedBrgyInfo = useMemo(() => {
    if (!selectedBrgyName) return null;
    return mappingData.find((item) => item.name === selectedBrgyName) || null;
  }, [mappingData, selectedBrgyName]);

  const handleBarangaySelect = (brgyName: string, coords: { lat: number; lng: number }) => {
    setSelectedBrgyName(brgyName);
    setMapCenter([coords.lat, coords.lng]);
    setMapZoom(15);
  };

  const handleResetMap = () => {
    setSelectedBrgyName(null);
    setMapCenter(JUBAN_CENTER);
    setMapZoom(13);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#128f82]">
            <MapIcon size={18} />
            <span className="text-[10px] font-extrabold tracking-widest uppercase font-mono bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              Interactive Demographic Map
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
            Census Demographics Mapping Node
          </h2>
          <p className="text-xs text-slate-400">
            I-visualize at suriin ang density ng mga rehistradong Senior Citizens sa bawat barangay ng Juban, Sorsogon.
          </p>
        </div>
        
        <button
          onClick={handleResetMap}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-extrabold rounded-2xl shadow-sm border border-slate-200 transition-all cursor-pointer shrink-0"
        >
          I-reset ang Map (Center Juban)
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#128f82] flex items-center justify-center shrink-0 border border-teal-100">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Mapped Seniors</span>
            <p className="text-xl font-black text-slate-800 leading-tight">{totalSeniorsCount}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#02A952] flex items-center justify-center shrink-0 border border-emerald-100">
            <Building2 size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Barangays Covered</span>
            <p className="text-xl font-black text-slate-800 leading-tight">{totalBarangaysCount}</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <MapPin size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Most Populated Barangay</span>
            <p className="text-sm font-black text-slate-800 leading-tight truncate max-w-[150px] uppercase">
              {mostPopulatedBrgy.name} ({mostPopulatedBrgy.count})
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 border border-red-100">
            <Heart size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pensioner Coverage Rate</span>
            <p className="text-xl font-black text-slate-800 leading-tight">{pensionerPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Leaflet Map Card */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm relative">
          <div className="h-[480px] w-full rounded-2xl overflow-hidden relative z-10 border border-slate-100">
            <MapContainer
              center={JUBAN_CENTER}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
              scrollWheelZoom={true}
            >
              {/* OSM Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Individual Marker Clustering Group */}
              <MarkerClusterGroup 
                seniors={seniors} 
                onSelectSenior={(id) => setCurrentPage('SeniorProfile', id)} 
                getCoordinatesForBarangay={getCoordinatesForBarangay} 
              />

              {/* Dynamic View Update Agent */}
              <MapViewUpdater center={mapCenter} zoom={mapZoom} />
            </MapContainer>
          </div>
          
          {/* Map Overlay Badge */}
          <div className="absolute top-8 left-8 z-[1000] bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-bold font-mono text-slate-300 uppercase tracking-widest">
              Live GIS Node Active (Leaflet Mapping)
            </span>
          </div>
        </div>

        {/* Sidebar Leaders & Barangay Explorer */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Leaderboard Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">Barangay Density Rankings</h3>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Senior count per community sector</p>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Search size={13} />
              </span>
              <input
                type="text"
                value={brgySearch}
                onChange={(e) => setBrgySearch(e.target.value)}
                placeholder="Maghanap ng Barangay..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
              />
            </div>

            {/* Leaders list */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredMappingData.length > 0 ? (
                filteredMappingData.map((item) => {
                  const isSelected = selectedBrgyName === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleBarangaySelect(item.name, item.coordinates)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer
                        ${isSelected 
                          ? 'bg-teal-50 border-teal-200 text-teal-800 shadow-sm' 
                          : 'bg-slate-50 border-slate-150 hover:bg-slate-100/70 hover:border-slate-200 text-slate-600'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin size={14} className={isSelected ? 'text-[#128f82]' : 'text-slate-400'} />
                        <div>
                          <p className="text-xs font-black uppercase text-slate-700">{item.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            Pensioner Rate: {item.seniors.length > 0 ? Math.round((item.pensionCount / item.seniors.length) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md font-mono
                          ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {item.seniors.length}
                        </span>
                        <ChevronRight size={12} className="text-slate-400" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">Walang barangay na tumugma sa inyong paghahanap.</p>
              )}
            </div>
          </div>

          {/* Details explorer card */}
          {selectedBrgyInfo && (
            <div className="bg-white border border-[#128f82]/30 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[8px] font-extrabold text-[#128f82] uppercase tracking-widest font-mono">
                    Sector Details Active
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight mt-0.5">
                    Brgy. {selectedBrgyInfo.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBrgyName(null)}
                  className="text-[9px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Stats Grid inside card */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-2xl">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Approved</span>
                  <strong className="text-xs text-teal-600 font-black">{selectedBrgyInfo.approvedCount}</strong>
                </div>
                <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-2xl">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Pensioners</span>
                  <strong className="text-xs text-emerald-600 font-black">{selectedBrgyInfo.pensionCount}</strong>
                </div>
              </div>

              {/* Seniors list for this barangay */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registered Members ({selectedBrgyInfo.seniors.length})
                </span>
                
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {selectedBrgyInfo.seniors.map((senior) => (
                    <div
                      key={senior.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-150 hover:bg-teal-50/30 hover:border-teal-100 transition-colors text-[11px]"
                    >
                      <div className="truncate pr-2">
                        <p className="font-bold text-slate-700 truncate">{senior.firstName} {senior.lastName}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{senior.oscaNumber}</p>
                      </div>
                      <button
                        onClick={() => setCurrentPage('SeniorProfile', senior.id)}
                        className="px-2 py-1 bg-slate-100 text-slate-600 hover:bg-[#128f82] hover:text-white text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

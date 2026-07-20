import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { SeniorCitizen } from '../../types';
import 'leaflet.markercluster';

interface MarkerClusterGroupProps {
  seniors: SeniorCitizen[];
  onSelectSenior: (seniorId: string) => void;
  getCoordinatesForBarangay: (brgy: string) => { lat: number; lng: number };
}

/**
 * Custom deterministic coordinate generator to scatter individual seniors
 * slightly around their barangay center coordinates.
 */
const getIndividualCoordinates = (
  senior: SeniorCitizen,
  getCoordinatesForBarangay: (brgy: string) => { lat: number; lng: number }
): { lat: number; lng: number } => {
  const brgyCoords = getCoordinatesForBarangay(senior.barangay);
  
  let hash = 0;
  const str = senior.id + senior.oscaNumber;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Spread within ~400 meters of the center
  const latJitter = ((hash & 0xFF) / 255 - 0.5) * 0.005;
  const lngJitter = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.005;
  
  return {
    lat: brgyCoords.lat + latJitter,
    lng: brgyCoords.lng + lngJitter
  };
};

/**
 * Creates custom status-colored SVG map pin marker icons.
 */
const createSeniorIcon = (senior: SeniorCitizen) => {
  let color = '#128f82'; // Default Teal
  if (senior.status === 'Pending') color = '#eab308'; // Yellow
  if (senior.status === 'Rejected') color = '#ef4444'; // Red
  if (senior.pensionBeneficiary) color = '#10b981'; // Green

  if (senior.inRiskArea === 'yes') {
    if (senior.riskSeverity === 'critical') color = '#ef4444'; // Red (very critical)
    else if (senior.riskSeverity === 'high') color = '#f97316'; // Orange
    else if (senior.riskSeverity === 'medium') color = '#eab308'; // Yellow
    else if (senior.riskSeverity === 'low') color = '#3b82f6'; // Blue
  }
  
  const svgHtml = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgHtml,
    className: 'custom-senior-icon',
    iconSize: L.point(24, 24),
    iconAnchor: L.point(12, 22),
    popupAnchor: L.point(0, -20)
  });
};

/**
 * React Leaflet component that wraps raw Leaflet.markercluster plugin.
 * Renders individual markers for all seniors and clusters them dynamically.
 */
export default function MarkerClusterGroup({
  seniors,
  onSelectSenior,
  getCoordinatesForBarangay
}: MarkerClusterGroupProps) {
  const map = useMap();

  useEffect(() => {
    // Initialize the MarkerClusterGroup layer
    const markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 40 // Pixel radius cluster grouping size
    });

    // Populate cluster group with individual senior markers
    seniors.forEach((senior) => {
      const coords = getIndividualCoordinates(senior, getCoordinatesForBarangay);
      const icon = createSeniorIcon(senior);
      const marker = L.marker([coords.lat, coords.lng], { icon });

      marker.bindPopup(`
        <div class="p-1 font-sans text-xs min-w-[160px]">
          <h5 class="font-extrabold text-slate-800 uppercase mb-1 leading-normal border-b border-slate-100 pb-1">
            ${senior.firstName} ${senior.lastName}
          </h5>
          <div class="text-[10px] text-slate-600 space-y-1 mt-1.5">
            <div><span class="text-slate-400">OSCA:</span> <strong class="text-slate-700 font-mono">${senior.oscaNumber}</strong></div>
            <div><span class="text-slate-400">Barangay:</span> <strong class="text-slate-700">${senior.barangay}</strong></div>
            <div><span class="text-slate-400">Beneficiary:</span> <strong class="text-slate-700">${senior.pensionBeneficiary ? 'Yes' : 'No'}</strong></div>
            <div><span class="text-slate-400">Status:</span> <strong class="${senior.status === 'Approved' ? 'text-teal-600' : 'text-amber-500'}">${senior.status}</strong></div>
            ${senior.inRiskArea === 'yes' ? `
              <div>
                <span class="text-slate-400">Panganib:</span>
                <span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider
                  ${senior.riskSeverity === 'critical' ? 'bg-red-50 text-red-600 border border-red-100' : ''}
                  ${senior.riskSeverity === 'high' ? 'bg-orange-50 text-orange-600 border border-orange-100' : ''}
                  ${senior.riskSeverity === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : ''}
                  ${senior.riskSeverity === 'low' ? 'bg-blue-50 text-blue-600 border border-blue-100' : ''}
                ">
                  ${senior.riskType === 'Others' ? senior.riskDetails || 'Others' : senior.riskType}
                </span>
              </div>
            ` : ''}
          </div>
          <button id="btn-popup-${senior.id}" class="mt-3 w-full py-1.5 bg-[#128f82] text-white text-[9px] font-bold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer text-center">
            Tingnan ang Profile
          </button>
        </div>
      `);

      // Bind dynamic profile click handler when popup mounts
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${senior.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectSenior(senior.id);
          };
        }
      });

      markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [seniors, map, onSelectSenior, getCoordinatesForBarangay]);

  return null;
}

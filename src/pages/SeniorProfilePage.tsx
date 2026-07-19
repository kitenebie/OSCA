import React from 'react';
import { useSeniorsStore } from '../store/seniorsStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import IDCardPreview from '../components/id-generation/IDCardPreview';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ChevronLeft, MapPin, CreditCard, ShieldCheck, UserCheck, ShieldAlert, Check, X } from 'lucide-react';

// Custom Map pin icon matching our AddressMapPicker style
const profileMarkerIcon = L.divIcon({
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
  iconAnchor: [0, 0]
});

export default function SeniorProfilePage() {
  const { seniors, approveSenior, rejectSenior } = useSeniorsStore();
  const { selectedSeniorId, setCurrentPage, showToast } = useUIStore();
  const { currentUser, hasPermission } = useAuthStore();

  const senior = seniors.find((s) => s.id === selectedSeniorId);
  const canApprove = hasPermission('canApproveReject');

  if (!senior) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-white border border-slate-200 rounded-3xl">
        <ShieldAlert size={48} className="text-slate-300 stroke-[1.5] mb-3" />
        <p className="text-xs font-semibold">Error: Hindi nahanap ang record ng Senior Citizen.</p>
        <button
          onClick={() => setCurrentPage('SeniorsList')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl"
        >
          Bumalik sa Listahan
        </button>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!currentUser) return;
    await approveSenior(senior.id, currentUser.fullName);
    showToast(`Matagumpay na naaprubahan si ${senior.firstName}!`, 'success');
  };

  const handleReject = () => {
    if (!currentUser) return;
    const reason = prompt(`Mataas na Paunawa: Isulat ang dahilan ng pag-reject kay ${senior.firstName}:`, 'Kulang sa patunay o dokumento');
    if (reason === null) return; // cancelled
    rejectSenior(senior.id, reason || 'Kulang sa dokumento', currentUser.fullName);
    showToast(`Tinanggihan ang aplikasyon ni ${senior.firstName}.`, 'warning');
  };

  const isPending = senior.status === 'Pending' || senior.status === 'For Verification';

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Back controls row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setCurrentPage('SeniorsList')}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-150 active:scale-95"
        >
          <ChevronLeft size={14} />
          <span>Bumalik sa Listahan</span>
        </button>

        {/* Verification quick bar for Officers */}
        {isPending && canApprove && (
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mr-2">MSWDO Action Desk:</span>
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              <X size={13} className="stroke-[3]" />
              <span>Tanggihan (Reject)</span>
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/10 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check size={13} className="stroke-[3]" />
              <span>Aprubahan (Approve)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Info Sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Personal Card & Geotag Map */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Visual card summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            {/* Status Floating Badge */}
            <span className={`absolute top-4 right-4 text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border
              ${senior.status === 'Approved' ? 'bg-teal-50 border-teal-200 text-teal-600' : ''}
              ${senior.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse' : ''}
              ${senior.status === 'For Verification' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}
              ${senior.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-600' : ''}
              ${senior.status === 'Deactivated' ? 'bg-slate-50 border-slate-200 text-slate-500' : ''}
            `}>
              {senior.status}
            </span>

            {senior.profilePhoto ? (
              <img 
                referrerPolicy="no-referrer"
                src={senior.profilePhoto} 
                alt={senior.firstName} 
                className="w-24 h-24 rounded-full object-cover border-2 border-teal-500 shadow-md mb-4 shrink-0" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl border border-teal-100 shadow-inner mb-4 shrink-0">
                {senior.firstName.charAt(0)}{senior.lastName.charAt(0)}
              </div>
            )}

            <h3 className="font-extrabold text-slate-800 text-base leading-tight uppercase">
              {senior.firstName} {senior.lastName}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono font-bold mt-1 tracking-wider uppercase">{senior.oscaNumber}</p>
            
            <div className="w-full h-px bg-slate-100 my-4"></div>

            <div className="w-full text-left space-y-2.5 text-[11px] font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Kasarian (Sex):</span>
                <span className="text-slate-800 font-bold uppercase">{senior.sex}</span>
              </div>
              <div className="flex justify-between">
                <span>Edad (Age):</span>
                <span className="text-slate-800 font-bold">{senior.age} y/o</span>
              </div>
              <div className="flex justify-between">
                <span>Kaarawan (Bday):</span>
                <span className="text-slate-800 font-bold">{senior.birthdate}</span>
              </div>
              <div className="flex justify-between">
                <span>Status ng Program:</span>
                <span className={`font-bold ${senior.pensionBeneficiary ? 'text-teal-600 font-mono' : 'text-slate-700'}`}>
                  {senior.pensionBeneficiary ? 'SocPen Pensioner' : 'No Grant'}
                </span>
              </div>
            </div>
          </div>

          {/* Map Residence geotag summary */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-72">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-150 mb-3 text-slate-700 font-sans">
              <MapPin size={15} className="text-teal-600" />
              <span className="font-bold text-xs uppercase tracking-wide">Residence Geotag Point</span>
            </div>
            
            {/* Embedded Leaflet map container */}
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <MapContainer
                center={[senior.coordinates.lat, senior.coordinates.lng]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker 
                  position={[senior.coordinates.lat, senior.coordinates.lng]} 
                  icon={profileMarkerIcon}
                >
                  <Popup>
                    <div className="text-[10px] font-sans text-slate-800">
                      <p className="font-bold uppercase leading-none">{senior.firstName} {senior.lastName}</p>
                      <p className="text-slate-500 mt-1">{senior.barangay}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Double Sided Smart ID Card and full census details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* OSCA ID Card Preview widget */}
          <IDCardPreview senior={senior} />

          {/* Extended demographic details block */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wide">Pagsusuri ng Census Sheet</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] font-medium text-slate-600 leading-normal">
              
              <div className="space-y-3.5">
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Tirahan (Street Address)</span>
                  <p className="text-slate-800 font-bold uppercase text-[11.5px]">{senior.address}, Brgy. {senior.barangay}, Juban, Sorsogon</p>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Civil Status</span>
                  <p className="text-slate-800 font-bold uppercase">{senior.civilStatus}</p>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Lugar ng Kapanganakan</span>
                  <p className="text-slate-800 font-bold uppercase">{senior.remarks || 'Juban, Sorsogon'}</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Numero ng Mobile (Contact)</span>
                  <p className="text-slate-800 font-bold font-mono text-[11.5px]">{senior.contactNumber || 'WALANG MATALANG CONTACT'}</p>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Petsa ng Pagkarehistro</span>
                  <p className="text-slate-800 font-bold font-mono">{senior.registeredDate}</p>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Biometrics Enrolled Template ID</span>
                  <p className="text-slate-800 font-bold font-mono text-[10px] truncate max-w-xs">{senior.thumbprintData || 'WALANG MATALANG BIOMETRICS'}</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

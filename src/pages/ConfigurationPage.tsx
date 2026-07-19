import React from 'react';
import { useUIStore } from '../store/uiStore';
import { Sliders, HelpCircle, ToggleLeft, ToggleRight, Radio, Cpu } from 'lucide-react';

export default function ConfigurationPage() {
  const { nfcEnabled, setNfcEnabled, showToast } = useUIStore();

  const handleToggle = () => {
    const nextState = !nfcEnabled;
    setNfcEnabled(nextState);
    showToast(
      nextState 
        ? 'NFC-enabled features have been fully activated across the system.' 
        : 'NFC features deactivated. Interface reverted to standard RFID / barcode mode.',
      'info'
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Page Title Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm md:text-base">System Configuration & Settings</h4>
        <p className="text-[11px] text-slate-400">Configure core hardware parameters, smart card protocols, and user portal integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Toggle Configuration Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-teal-600" />
              <h5 className="font-bold text-slate-800 text-xs md:text-sm">Hardware & Smart Card Parameters</h5>
            </div>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-100 uppercase">
              {nfcEnabled ? 'Active Mode: Smart NFC' : 'Active Mode: Standard'}
            </span>
          </div>

          <div className="p-6 space-y-6">
            
            {/* The Main NFC Toggle Option */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-200/60 hover:border-teal-500/30 hover:bg-teal-500/[0.01] transition-all gap-4">
              <div className="space-y-1 max-w-md">
                <span className="font-extrabold text-slate-800 text-xs md:text-sm block">
                  the card is uses NFC?
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toggle whether the printed OSCA ID cards utilize Near Field Communication (NFC / NDEF NTAG213) chips for biometric scans, automated logging, and quick profile retrieval.
                </p>
              </div>

              {/* High-fidelity custom toggle switch */}
              <button 
                id="toggle-nfc-config"
                onClick={handleToggle}
                className="flex items-center gap-3 self-start md:self-auto shrink-0 group focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-lg p-1.5"
              >
                <div 
                  className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 relative ${
                    nfcEnabled ? 'bg-teal-600 shadow-inner' : 'bg-slate-200'
                  }`}
                >
                  <div 
                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                      nfcEnabled ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </div>
                <span className={`text-xs font-bold font-mono tracking-wide ${nfcEnabled ? 'text-teal-600' : 'text-slate-400'}`}>
                  {nfcEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </button>
            </div>

            {/* Supplementary Configuration Help/Notes */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl flex gap-3">
              <HelpCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h6 className="font-bold text-slate-700 text-[11px]">Automatic Interface Synchronization</h6>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  When enabled, all smart scanner components, biometric transponder modules, and writing facilities will display full "NFC" labels and allow active contactless emulation. When disabled, NFC nomenclature is automatically stripped from the LGU portal to present a simplified RFID-Barcode flow.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          <div className="bg-white text-slate-800 rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] text-teal-600">
              <Cpu size={140} />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Radio size={16} className="text-teal-600 animate-pulse" />
              <span className="text-[10px] tracking-wider uppercase font-mono font-bold text-teal-700">Node Configuration</span>
            </div>

            <h5 className="font-extrabold text-sm tracking-tight mb-2 text-slate-800">Contactless Ecosystem</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Juban's smart portal supports both magnetic induction tags and high frequency transceiver nodes. This setting dynamically optimizes resource utilization in real-time.
            </p>

            <div className="space-y-2 border-t border-slate-100 pt-4 font-mono text-[10px]">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Firmware Protocol:</span>
                <span className="text-teal-600 font-semibold">ISO/IEC 14443-A</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Antenna Node:</span>
                <span className="text-slate-700">Virtual Port 3000</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Transceiver Range:</span>
                <span className="text-slate-700">10cm Proximity</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

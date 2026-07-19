import React, { useState } from 'react';
import { Fingerprint, Check, AlertCircle, RefreshCw, Cpu, Link2, Info } from 'lucide-react';

interface ThumbprintCaptureProps {
  value: string | null;
  onChange: (base64OrId: string | null) => void;
}

export default function ThumbprintCapture({ value, onChange }: ThumbprintCaptureProps) {
  const [deviceConnected, setDeviceConnected] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('Ready for scanning.');

  // --- HARDWARE SDK INTEGRATION ARCHITECTURE NOTES ---
  /**
   * INTEGRATION TO HARDWARE (DigitalPersona / Suprema Scanner):
   * 
   * In a future production backend development phase:
   * 1. On Windows/Linux PCs, install the SDK drivers (e.g., DigitalPersona U.are.U SDK or Suprema BioMini SDK).
   * 2. Build a local native client (e.g. using Electron + Node Native Addons, or a local WebSocket agent server in C#/Go).
   * 3. The local client listens to USB events, calls the scanner SDK's `Enroll()` or `Capture()` methods, 
   *    and yields the binary template or high-res ANSI-378 / ISO-19794-2 biometric template formats.
   * 4. This React frontend connects to the local WebSocket agent (e.g. `ws://localhost:8282`), triggers 
   *    the scan, and receives the Base64 image template and template byte string back.
   */

  const triggerScan = async () => {
    if (!deviceConnected || isScanning) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setScanStatus('Please place thumb firmly on the scanner glass...');

    // Simulate real-time progress increments
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate scanning network timeout
    await new Promise((resolve) => setTimeout(resolve, 2200));
    
    setIsScanning(false);
    setScanStatus('Biometric fingerprint template extracted successfully!');
    
    // Save a mock unique template ID string
    const mockFingerprintTemplateId = `Captured Biometrics (Template ANSI-378 ID: FP-${Math.floor(Math.random() * 900000 + 100000)})`;
    onChange(mockFingerprintTemplateId);
  };

  const handleDisconnectToggle = () => {
    setDeviceConnected((prev) => {
      const next = !prev;
      setScanStatus(next ? 'Ready for scanning.' : 'Device disconnected.');
      if (!next) onChange(null);
      return next;
    });
  };

  const resetCapture = () => {
    onChange(null);
    setScanProgress(0);
    setScanStatus('Ready for scanning.');
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4">
      
      {/* Driver / Device Status header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-teal-600" />
          <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">Biometric Fingerprint Hardware Control</span>
        </div>
        
        {/* Toggle connection mockup for testing */}
        <button
          type="button"
          onClick={handleDisconnectToggle}
          className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider border transition-all
            ${deviceConnected 
              ? 'bg-teal-50 border-teal-200 text-teal-600' 
              : 'bg-red-50 border-red-200 text-red-600'}`}
        >
          {deviceConnected ? '● Connected (USB: DigitalPersona)' : '○ Not Detected'}
        </button>
      </div>

      {/* Main Biometric UI Stage */}
      <div className="flex flex-col items-center justify-center py-6 bg-white border border-slate-200 rounded-xl shadow-inner relative overflow-hidden min-h-[190px]">
        
        {/* Pulsing indicator ring when scanning */}
        {isScanning && (
          <div className="absolute inset-0 m-auto w-24 h-24 rounded-full border border-teal-500/20 bg-teal-500/5 animate-ping"></div>
        )}

        {value ? (
          /* CAPTURED SUCCESS STATE */
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm relative">
              <Fingerprint size={32} className="stroke-[1.5]" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                <Check size={10} className="stroke-[3]" />
              </div>
            </div>
            <div className="text-center">
              <h5 className="font-bold text-xs text-slate-800">Biometrics Locked</h5>
              <p className="text-[9px] text-slate-400 mt-0.5 font-mono truncate max-w-xs">{value}</p>
            </div>
          </div>
        ) : (
          /* SCAN READY / SCANNING STATE */
          <div className="flex flex-col items-center gap-3.5">
            <button
              type="button"
              disabled={!deviceConnected || isScanning}
              onClick={triggerScan}
              className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-300 relative group
                ${!deviceConnected 
                  ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed' 
                  : isScanning 
                    ? 'bg-teal-50 border-teal-400 text-teal-500 animate-pulse' 
                    : 'bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-500 hover:text-teal-600 cursor-pointer active:scale-95'}`}
            >
              <Fingerprint size={30} className="stroke-[1.5]" />
              
              {/* Scan overlay guide line */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-0.5 bg-teal-500/60 shadow shadow-teal-500 animate-bounce top-1/3"></div>
              )}
            </button>
            <div className="text-center">
              <h5 className="font-semibold text-xs text-slate-700">
                {isScanning ? 'Impe-print ang hinlalaki...' : 'Place thumb on scanner glass'}
              </h5>
              <p className="text-[10px] text-slate-400 mt-1">
                {isScanning ? `Scan in progress: ${scanProgress}%` : 'Suriin kung umiilaw ang scanner bago idikit.'}
              </p>
            </div>
          </div>
        )}

        {/* Scan Progress Bar */}
        {isScanning && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-100">
            <div 
              className="h-full bg-teal-600 transition-all duration-200" 
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Control Actions & Error Prompt */}
      <div className="flex items-center justify-between gap-3 text-slate-500 text-[11px] font-medium p-3 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-1.5 font-mono truncate">
          <div className={`w-1.5 h-1.5 rounded-full ${!deviceConnected ? 'bg-red-400' : isScanning ? 'bg-teal-400 animate-pulse' : 'bg-teal-500'}`}></div>
          <span className="truncate">{scanStatus}</span>
        </div>

        {value && (
          <button
            type="button"
            onClick={resetCapture}
            className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 hover:underline shrink-0"
          >
            <RefreshCw size={11} />
            <span>Kuhang Muli</span>
          </button>
        )}
      </div>

      {/* Technical Footnote info bar */}
      <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100/50 p-2.5 rounded-xl text-[10px] text-amber-800 leading-normal">
        <Info size={12} className="text-amber-500 shrink-0 mt-0.5" />
        <p>
          <strong>Mock Integration Note:</strong> All captured finger ridge minutiae coordinates are encoded as simulated ISO templates in the browser context for UI evaluation. No actual biometrics data is leaked.
        </p>
      </div>

    </div>
  );
}

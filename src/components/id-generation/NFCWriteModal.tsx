import React, { useState } from 'react';
import { SeniorCitizen } from '../../types';
import { writeToNFCTag, isWebNFCSupported, NFCPayload } from '../../utils/nfcSimulator';
import { X, Radio, Check, AlertCircle, Terminal, HelpCircle, AlertTriangle } from 'lucide-react';

interface NFCWriteModalProps {
  senior: SeniorCitizen;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NFCWriteModal({ senior, onClose, onSuccess }: NFCWriteModalProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [writeError, setWriteError] = useState(false);
  const [writeCompleted, setWriteCompleted] = useState(false);

  const handleStartNFCWrite = async () => {
    setIsWriting(true);
    setWriteError(false);
    setWriteCompleted(false);
    setLogs([]);

    const payload: NFCPayload = {
      oscaNumber: senior.oscaNumber,
      fullName: `${senior.firstName} ${senior.lastName}`,
      barangay: senior.barangay,
      birthdate: senior.birthdate,
      pensioner: senior.pensionBeneficiary,
      timestamp: new Date().toISOString()
    };

    // Callback to append logs
    const updateLogs = (statusText: string, isErr = false) => {
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${statusText}`]);
      if (isErr) setWriteError(true);
    };

    const success = await writeToNFCTag(payload, updateLogs);
    
    setIsWriting(false);
    if (success) {
      setWriteCompleted(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  const isNFCSupported = isWebNFCSupported();

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[1010] animate-fadeIn">
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-teal-600 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-800 tracking-wide uppercase">NFC Transponder Programming</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Stage Body */}
        <div className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto max-h-[480px]">
          
          {/* Target details summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60">
            <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest font-mono">Target NDEF Payload</span>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-[8px] text-slate-400 uppercase leading-none font-bold">OSCA ID</p>
                <p className="text-xs font-bold font-mono text-slate-800 mt-1">{senior.oscaNumber}</p>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 uppercase leading-none font-bold">Senior Name</p>
                <p className="text-xs font-bold text-slate-700 mt-1 truncate">{senior.firstName} {senior.lastName}</p>
              </div>
            </div>
          </div>

          {/* Device Type warning fallback badge */}
          {!isNFCSupported && (
            <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase font-mono">LGU Simulation Active</span>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Web NFC API is Chrome-Android only. Desktop admin mode utilizes local Virtual USB drivers to simulate raw physical card programming.
                </p>
              </div>
            </div>
          )}

          {/* Interactive Tap Zone */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200/60 rounded-2xl relative min-h-[140px]">
            {isWriting ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full border border-teal-500/20 bg-teal-50 flex items-center justify-center animate-spin">
                  <Radio size={28} className="text-teal-600" />
                </div>
                <span className="text-xs text-teal-600 font-bold tracking-wide animate-pulse uppercase font-mono">Writing sectors...</span>
              </div>
            ) : writeCompleted ? (
              <div className="flex flex-col items-center gap-3 animate-bounce">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/5">
                  <Check size={28} className="stroke-[3]" />
                </div>
                <span className="text-xs text-emerald-600 font-bold tracking-wide uppercase font-mono">NDEF Sync Successful!</span>
              </div>
            ) : writeError ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                  <AlertCircle size={28} />
                </div>
                <span className="text-xs text-red-600 font-bold tracking-wide uppercase font-mono">Sector Write Failed</span>
              </div>
            ) : (
              <button
                onClick={handleStartNFCWrite}
                className="w-full flex flex-col items-center justify-center gap-3.5 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-slate-200 group-hover:border-teal-500 group-hover:text-teal-600 text-slate-400 flex items-center justify-center shadow-sm transition-all duration-300">
                  <Radio size={28} />
                </div>
                <div className="text-center">
                  <h5 className="text-xs font-bold text-slate-700 group-hover:text-teal-600 transition-colors">Start Sector Sync</h5>
                  <p className="text-[10px] text-slate-400 mt-1 leading-none">Press to program RFID transponder antenna</p>
                </div>
              </button>
            )}
          </div>

          {/* Live Terminal outputs */}
          {logs.length > 0 && (
            <div className="bg-slate-950 rounded-xl border border-slate-900 p-3.5 font-mono text-[9px] text-slate-300 leading-normal flex-1 max-h-[140px] overflow-y-auto">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 mb-2 font-bold uppercase tracking-wider text-slate-400 shrink-0">
                <Terminal size={10} />
                <span>Console RFID Outputs</span>
              </div>
              <div className="space-y-1.5">
                {logs.map((log, idx) => (
                  <div key={idx} className={log.includes('SUCCESS') || log.includes('verified') ? 'text-emerald-400 font-semibold' : log.includes('Failed') ? 'text-red-400' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

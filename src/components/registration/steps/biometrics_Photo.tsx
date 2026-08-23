import React, { useState, useRef, useCallback } from 'react';
import InlineFaceCapture from '../../profiling/InlineFaceCapture';
import { Fingerprint, RotateCcw, Check, X, Loader2, Usb, ShieldCheck, AlertCircle, Wifi, WifiOff } from 'lucide-react';

// OSCA Fingerprint Bridge endpoint (.NET Windows Service)
const BRIDGE_URL = 'http://localhost:8000';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function BiometricsPhoto({ form, setForm }: StepProps) {
  const [scanStatus, setScanStatus] = useState<'idle' | 'connecting' | 'scanning' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [bridgeOnline, setBridgeOnline] = useState<boolean | null>(null);

  // Check if the Fingerprint Bridge service is online
  const checkBridgeStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/api/status`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        setBridgeOnline(true);
        return true;
      }
      setBridgeOnline(false);
      return false;
    } catch {
      setBridgeOnline(false);
      return false;
    }
  }, []);

  // Capture fingerprint via Bridge (.NET → WinBio API → Scanner)
  const startFingerprintScan = useCallback(async () => {
    setScanStatus('connecting');
    setScanMessage('Kumokonekta sa OSCA Fingerprint Bridge...');

    try {
      // Step 1: Check if bridge is reachable
      const isOnline = await checkBridgeStatus();
      if (!isOnline) {
        throw new Error('Hindi ma-reach ang Fingerprint Bridge service. Siguraduhing running ang service sa port 8000.');
      }

      setScanStatus('scanning');
      setScanMessage('Ilagay ang kanang hinlalaki (right thumb) sa scanner...');

      // Step 2: Call capture endpoint — this blocks until finger is placed on sensor
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for user to place finger

      const res = await fetch(`${BRIDGE_URL}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok && data.success) {
        // Store the Base64 fingerprint template and metadata
        setForm({
          ...form,
          fingerprintTemplate: data.template,
          fingerprintId: data.id,
          fingerprintQuality: data.quality
        });
        setScanStatus('success');
        setScanMessage(`Fingerprint captured! Quality: ${data.quality}% | ID: ${data.id}`);
      } else {
        throw new Error(data.error || 'Capture failed. Subukan ulit.');
      }
    } catch (err: any) {
      setScanStatus('error');
      if (err.name === 'AbortError') {
        setScanMessage('Timeout — hindi nadetect ang daliri sa loob ng 30 segundo. Subukan ulit.');
      } else {
        setScanMessage(err.message || 'Hindi ma-capture ang fingerprint. I-check ang scanner connection.');
      }
    }
  }, [form, setForm, checkBridgeStatus]);

  // Remove fingerprint
  const removeFingerprint = () => {
    setForm({ ...form, fingerprintTemplate: null, fingerprintId: null, fingerprintQuality: null });
    setScanStatus('idle');
    setScanMessage('');
  };

  // Rescan
  const rescan = () => {
    removeFingerprint();
    setTimeout(() => startFingerprintScan(), 100);
  };

  const hasFingerprint = !!form.fingerprintTemplate;

  return (
    <div className="space-y-6 max-w-full animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">VII. Biometrics & Photo</h5>
          <p className="text-sm text-slate-400">Capture profile photo and scan right thumbprint for the NCSC form.</p>
        </div>
        <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
          Step 7 of 11
        </span>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN — Camera Profile Picture                   */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <div>
              <h6 className="text-sm font-bold text-slate-800">Profile Photo (2×2)</h6>
              <p className="text-[11px] text-slate-400">Camera capture</p>
            </div>
          </div>
          <InlineFaceCapture
            value={form.profilePhoto}
            onChange={(img) => setForm({ ...form, profilePhoto: img })}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN — Fingerprint Scanner via Bridge          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Fingerprint size={16} className="text-indigo-600" />
            </div>
            <div>
              <h6 className="text-sm font-bold text-slate-800">Right Thumb Print</h6>
              <p className="text-[11px] text-slate-400">via OSCA Fingerprint Bridge</p>
            </div>
            {hasFingerprint && (
              <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <Check size={10} /> Captured
              </span>
            )}
          </div>

          {/* Scanner Body */}
          <div className="flex flex-col items-center gap-4">
            {/* Fingerprint Visual Area */}
            <div className={`relative rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ${
              hasFingerprint
                ? 'bg-slate-900 border-2 border-indigo-400 shadow-lg shadow-indigo-100'
                : scanStatus === 'scanning'
                ? 'bg-gradient-to-b from-indigo-50 to-slate-50 border-2 border-indigo-300 animate-pulse'
                : scanStatus === 'connecting'
                ? 'bg-gradient-to-b from-amber-50 to-slate-50 border-2 border-amber-200'
                : 'bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-dashed border-slate-300'
            }`} style={{ width: 200, height: 220 }}>

              {/* Success State — Show fingerprint icon with ID */}
              {hasFingerprint && (
                <div className="flex flex-col items-center justify-center gap-3 text-white">
                  <div className="w-20 h-20 rounded-full bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center">
                    <Fingerprint size={44} strokeWidth={1.2} className="text-indigo-300" />
                  </div>
                  <div className="text-center px-3">
                    <p className="text-[10px] text-indigo-200 font-mono truncate max-w-[180px]">{form.fingerprintId}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Quality: {form.fingerprintQuality}%</p>
                  </div>
                </div>
              )}

              {/* Idle State */}
              {!hasFingerprint && scanStatus === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-slate-200/60 flex items-center justify-center">
                    <Fingerprint size={36} strokeWidth={1.3} className="text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Awaiting scan</span>
                  <span className="text-[10px] text-slate-300">Fingerprint Bridge (Port 8000)</span>
                </div>
              )}

              {/* Connecting State */}
              {scanStatus === 'connecting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 gap-2">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-amber-600" />
                  </div>
                  <span className="text-xs font-semibold text-amber-700">Connecting to bridge...</span>
                </div>
              )}

              {/* Scanning State */}
              {scanStatus === 'scanning' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 gap-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Fingerprint size={32} className="text-indigo-600" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-40"></div>
                  </div>
                  <span className="text-xs font-semibold text-indigo-700">Ilagay ang kanang hinlalaki</span>
                  <span className="text-[10px] text-indigo-400">sa scanner pad</span>
                </div>
              )}

              {/* Remove button */}
              {hasFingerprint && (
                <button
                  type="button"
                  onClick={removeFingerprint}
                  className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition hover:scale-110"
                  title="Remove fingerprint"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status Message */}
            {scanMessage && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium max-w-full ${
                scanStatus === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : scanStatus === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-teal-50 text-teal-700 border border-teal-200'
              }`}>
                {scanStatus === 'success' && <ShieldCheck size={14} className="shrink-0" />}
                {scanStatus === 'error' && <AlertCircle size={14} className="shrink-0" />}
                {(scanStatus === 'connecting' || scanStatus === 'scanning') && <Loader2 size={14} className="animate-spin shrink-0" />}
                <span className="break-words">{scanMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 w-full justify-center">
              {!hasFingerprint ? (
                <button
                  type="button"
                  onClick={startFingerprintScan}
                  disabled={scanStatus === 'connecting' || scanStatus === 'scanning'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Fingerprint size={15} />
                  {scanStatus === 'error' ? 'Retry Scan' : 'Scan Fingerprint'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={rescan}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  <RotateCcw size={15} />
                  Rescan
                </button>
              )}

              {/* Bridge Status Check Button */}
              {!hasFingerprint && scanStatus === 'idle' && (
                <button
                  type="button"
                  onClick={checkBridgeStatus}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                  title="Check bridge connection"
                >
                  {bridgeOnline === true && <Wifi size={13} className="text-green-500" />}
                  {bridgeOnline === false && <WifiOff size={13} className="text-red-400" />}
                  {bridgeOnline === null && <Wifi size={13} className="text-slate-400" />}
                  Status
                </button>
              )}
            </div>

            {/* Bridge Info Footer */}
            {!hasFingerprint && scanStatus === 'idle' && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 w-full">
                <Usb size={12} className="shrink-0 text-slate-400" />
                <span>
                  Gumagamit ng <strong className="text-slate-600">OSCA Fingerprint Bridge</strong> (Windows Service, Port 8000) para ma-capture ang fingerprint gamit ang Windows Biometric Framework.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

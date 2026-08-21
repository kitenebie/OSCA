import React, { useState, useRef, useCallback, useEffect } from 'react';
import InlineFaceCapture from '../../profiling/InlineFaceCapture';
import { Fingerprint, RotateCcw, Check, X, Loader2, Usb, ShieldCheck, AlertCircle } from 'lucide-react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function BiometricsPhoto({ form, setForm }: StepProps) {
  const [scanStatus, setScanStatus] = useState<'idle' | 'connecting' | 'scanning' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deviceRef = useRef<USBDevice | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        try { deviceRef.current.close(); } catch (_) {}
      }
    };
  }, []);

  // Connect to USB fingerprint scanner and scan
  const startFingerprintScan = useCallback(async () => {
    setScanStatus('connecting');
    setScanMessage('Connecting to fingerprint scanner...');

    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x1162 }, // SecuGen
          { vendorId: 0x147e }, // Upek/AuthenTec
          { vendorId: 0x04f3 }, // Elan Microelectronics
          { vendorId: 0x1c7a }, // LighTuning
          { vendorId: 0x05ba }, // DigitalPersona
          { vendorId: 0x2109 }, // Generic HID fingerprint
        ],
      });

      deviceRef.current = device;
      await device.open();

      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);

      setScanStatus('scanning');
      setScanMessage('Place your right thumb on the scanner...');

      const scanCommand = new Uint8Array([0x40, 0x01, 0x00, 0x00]);
      const outEndpoint = device.configuration!.interfaces[0]?.alternate?.endpoints?.find(
        (ep) => ep.direction === 'out'
      );
      const inEndpoint = device.configuration!.interfaces[0]?.alternate?.endpoints?.find(
        (ep) => ep.direction === 'in'
      );

      if (outEndpoint) {
        await device.transferOut(outEndpoint.endpointNumber, scanCommand);
      }

      if (inEndpoint) {
        const result = await device.transferIn(inEndpoint.endpointNumber, 64000);
        if (result.data && result.data.byteLength > 0) {
          renderFingerprintToCanvas(new Uint8Array(result.data.buffer));
        } else {
          throw new Error('No data received from scanner.');
        }
      } else {
        const result = await device.controlTransferIn(
          { requestType: 'vendor', recipient: 'interface', request: 0x01, value: 0, index: 0 },
          64000
        );
        if (result.data && result.data.byteLength > 0) {
          renderFingerprintToCanvas(new Uint8Array(result.data.buffer));
        } else {
          throw new Error('No fingerprint data received.');
        }
      }

      await device.close();
      deviceRef.current = null;
      setScanStatus('success');
      setScanMessage('Fingerprint captured successfully!');
    } catch (err: any) {
      setScanStatus('error');
      if (err.name === 'NotFoundError') {
        setScanMessage('No scanner selected. Connect your USB scanner and try again.');
      } else if (err.name === 'SecurityError') {
        setScanMessage('USB access denied. Allow USB device access in browser settings.');
      } else {
        setScanMessage(err.message || 'Failed to capture fingerprint. Please try again.');
      }
      if (deviceRef.current) {
        try { deviceRef.current.close(); } catch (_) {}
        deviceRef.current = null;
      }
    }
  }, [form, setForm]);

  // Render raw fingerprint data onto canvas and save as PNG
  const renderFingerprintToCanvas = useCallback((rawData: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 256;
    const height = 288;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < width * height; i++) {
      const val = rawData[i] || 0;
      imageData.data[i * 4] = val;
      imageData.data[i * 4 + 1] = val;
      imageData.data[i * 4 + 2] = val;
      imageData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');
    setForm({ ...form, fingerprintTemplate: dataUrl });
  }, [form, setForm]);

  // Remove fingerprint
  const removeFingerprint = () => {
    setForm({ ...form, fingerprintTemplate: null });
    setScanStatus('idle');
    setScanMessage('');
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Rescan
  const rescan = () => {
    removeFingerprint();
    setTimeout(() => startFingerprintScan(), 100);
  };

  const hasFingerprint = form.fingerprintTemplate &&
    form.fingerprintTemplate.startsWith('data:image');

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
        {/* RIGHT COLUMN — USB Fingerprint Scanner                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Fingerprint size={16} className="text-indigo-600" />
            </div>
            <div>
              <h6 className="text-sm font-bold text-slate-800">Right Thumb Print</h6>
              <p className="text-[11px] text-slate-400">USB fingerprint scanner</p>
            </div>
            {hasFingerprint && (
              <span className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <Check size={10} /> Captured
              </span>
            )}
          </div>

          {/* Scanner Body */}
          <div className="flex flex-col items-center gap-4">
            {/* Fingerprint Canvas Area */}
            <div className={`relative rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ${
              hasFingerprint
                ? 'bg-slate-900 border-2 border-indigo-400 shadow-lg shadow-indigo-100'
                : scanStatus === 'scanning'
                ? 'bg-gradient-to-b from-indigo-50 to-slate-50 border-2 border-indigo-300 animate-pulse'
                : scanStatus === 'connecting'
                ? 'bg-gradient-to-b from-amber-50 to-slate-50 border-2 border-amber-200'
                : 'bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-dashed border-slate-300'
            }`} style={{ width: 200, height: 220 }}>
              
              {/* Canvas */}
              <canvas
                ref={canvasRef}
                className={`w-full h-full object-contain ${hasFingerprint ? 'opacity-100' : 'opacity-0'}`}
                width={256}
                height={288}
              />

              {/* Idle State */}
              {!hasFingerprint && scanStatus === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-slate-200/60 flex items-center justify-center">
                    <Fingerprint size={36} strokeWidth={1.3} className="text-slate-400" />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Awaiting scan</span>
                  <span className="text-[10px] text-slate-300">Connect USB device</span>
                </div>
              )}

              {/* Connecting State */}
              {scanStatus === 'connecting' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 gap-2">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-amber-600" />
                  </div>
                  <span className="text-xs font-semibold text-amber-700">Connecting device...</span>
                </div>
              )}

              {/* Scanning State */}
              {scanStatus === 'scanning' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 gap-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Fingerprint size={32} className="text-indigo-600" />
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-40"></div>
                  </div>
                  <span className="text-xs font-semibold text-indigo-700">Place right thumb</span>
                  <span className="text-[10px] text-indigo-400">on the scanner pad</span>
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
                <span>{scanMessage}</span>
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
                  <Usb size={15} />
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
            </div>

            {/* USB Info Footer */}
            {!hasFingerprint && scanStatus === 'idle' && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 w-full">
                <Usb size={12} className="shrink-0 text-slate-400" />
                <span>Plug in USB fingerprint scanner, then click <strong className="text-slate-600">Scan Fingerprint</strong> to begin.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

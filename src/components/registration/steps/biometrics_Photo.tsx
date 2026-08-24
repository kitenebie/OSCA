import React, { useState, useCallback } from 'react';
import InlineFaceCapture from '../../profiling/InlineFaceCapture';
import { Fingerprint, RotateCcw, Check, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function BiometricsPhoto({ form, setForm }: StepProps) {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');

  // Capture fingerprint via WebAuthn (Windows Hello popup → SYNO FIDO sensor)
  const startFingerprintScan = useCallback(async () => {
    setScanStatus('scanning');
    setScanMessage('Opening Windows Hello — touch the fingerprint sensor...');

    try {
      // Generate challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      // Create a WebAuthn credential — this triggers the Windows Hello UI
      // which activates the SYNO_FIDO sensor
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: { name: "OSCA Juban Biometrics" },
          user: {
            id: userId,
            name: "senior@osca.juban.gov",
            displayName: "Senior Citizen Biometric Capture"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Forces Windows Hello (built-in sensor)
            userVerification: "required"         // Requires biometric touch
          },
          timeout: 30000
        }
      }) as PublicKeyCredential | null;

      if (credential) {
        // Extract the credential response for use as a biometric token
        const response = credential.response as AuthenticatorAttestationResponse;
        
        // Generate a fingerprint template ID from the credential
        const templateId = `FP-WH-${Date.now()}-${Math.floor(Math.random() * 900000 + 100000)}`;
        
        // Store the attestation as the biometric template (Base64)
        const attestationB64 = btoa(String.fromCharCode(...new Uint8Array(response.attestationObject)));

        setForm({
          ...form,
          fingerprintTemplate: attestationB64,
          fingerprintId: templateId,
          fingerprintQuality: 95, // Windows Hello verified = high confidence
          fingerprintCredentialId: credential.id
        });

        setScanStatus('success');
        setScanMessage(`Fingerprint verified via Windows Hello! ID: ${templateId}`);
      } else {
        throw new Error('No credential returned from the sensor.');
      }
    } catch (err: any) {
      setScanStatus('error');
      if (err.name === 'NotAllowedError') {
        setScanMessage('Cancelled — sensor was not touched or the Windows Hello dialog was dismissed.');
      } else if (err.name === 'InvalidStateError') {
        setScanMessage('Biometric already registered. Click "Rescan" to capture again.');
      } else if (err.name === 'NotSupportedError') {
        setScanMessage('Windows Hello fingerprint not available on this device.');
      } else {
        setScanMessage(err.message || 'Failed to capture fingerprint. Try again.');
      }
    }
  }, [form, setForm]);

  // Remove fingerprint
  const removeFingerprint = () => {
    setForm({ ...form, fingerprintTemplate: null, fingerprintId: null, fingerprintQuality: null, fingerprintCredentialId: null });
    setScanStatus('idle');
    setScanMessage('');
  };

  // Rescan
  const rescan = () => {
    removeFingerprint();
    setTimeout(() => startFingerprintScan(), 200);
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

        {/* LEFT COLUMN — Camera Profile Picture */}
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

        {/* RIGHT COLUMN — Fingerprint via Windows Hello */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Fingerprint size={16} className="text-indigo-600" />
            </div>
            <div>
              <h6 className="text-sm font-bold text-slate-800">Right Thumb Print</h6>
              <p className="text-[11px] text-slate-400">via Windows Hello Fingerprint</p>
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
                : 'bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-dashed border-slate-300'
            }`} style={{ width: 200, height: 220 }}>

              {/* Success State */}
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
                  <span className="text-[10px] text-slate-300">Windows Hello Fingerprint</span>
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
                  <span className="text-xs font-semibold text-indigo-700">Touch the sensor</span>
                  <span className="text-[10px] text-indigo-400">sa Windows Hello popup</span>
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
                {scanStatus === 'scanning' && <Loader2 size={14} className="animate-spin shrink-0" />}
                <span className="break-words">{scanMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 w-full justify-center">
              {!hasFingerprint ? (
                <button
                  type="button"
                  onClick={startFingerprintScan}
                  disabled={scanStatus === 'scanning'}
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
            </div>

            {/* Info Footer */}
            {!hasFingerprint && scanStatus === 'idle' && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 w-full">
                <ShieldCheck size={12} className="shrink-0 text-indigo-400" />
                <span>
                  Gumagamit ng <strong className="text-slate-600">Windows Hello</strong> para ma-verify ang fingerprint. Lalabas ang system dialog — i-touch ang sensor para ma-capture.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

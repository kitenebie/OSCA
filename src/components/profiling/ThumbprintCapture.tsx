import React, { useState, useEffect } from 'react';
import { Fingerprint, Check, AlertCircle, RefreshCw, Cpu, Info, Wifi, WifiOff, Upload, Image } from 'lucide-react';
import { uploadFingerprintImage } from '../../services/storageService';

// OSCA Fingerprint Bridge endpoint (localhost — required for HTTPS mixed-content exemption)
const BRIDGE_URL = 'http://localhost:8000';

interface ThumbprintCaptureProps {
  value: string | null;         // Stores the Supabase image URL (or null)
  onChange: (imageUrl: string | null) => void;
  seniorId?: string;            // Senior citizen ID for file naming
}

type ScanMode = 'bridge' | 'webauthn' | 'simulator';

interface BridgeStatus {
  connected: boolean;
  version?: string;
  digitalPersona?: { available: boolean; count: number };
  serialPortCount?: number;
}

export default function ThumbprintCapture({ value, onChange, seniorId }: ThumbprintCaptureProps) {
  const [scanMode, setScanMode] = useState<ScanMode>('bridge');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('Ready for scanning.');
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>({ connected: false });
  const [fingerprintImage, setFingerprintImage] = useState<string | null>(null); // base64 image for preview
  const [captureMethod, setCaptureMethod] = useState<string>('');

  // Check bridge connection on mount and mode switch
  useEffect(() => {
    if (scanMode === 'bridge') {
      checkBridgeStatus();
    }
  }, [scanMode]);

  const checkBridgeStatus = async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/api/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        setBridgeStatus({
          connected: true,
          version: data.version,
          digitalPersona: data.devices?.digitalPersona,
          serialPortCount: data.devices?.serialPortCount ?? data.serialPortCount ?? 0
        });
        setScanStatus(
          data.devices?.digitalPersona?.available
            ? `U.are.U scanner detected ✓ — Ready to capture.`
            : 'Bridge connected. Place finger on scanner to capture.'
        );
      } else {
        setBridgeStatus({ connected: false });
        setScanStatus('Bridge not responding. Start the Fingerprint Bridge service.');
      }
    } catch {
      setBridgeStatus({ connected: false });
      setScanStatus('Hindi makonekta sa Fingerprint Bridge. Buksan ang FingerprintBridge.exe.');
    }
  };

  // Main capture via Fingerprint Bridge — returns image + template
  const startBridgeScan = async () => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStatus('Kumokonekta sa Fingerprint Bridge...');
    setCaptureMethod('');
    setFingerprintImage(null);

    try {
      setScanProgress(20);
      const statusRes = await fetch(`${BRIDGE_URL}/api/status`, { signal: AbortSignal.timeout(3000) });

      if (!statusRes.ok) {
        throw new Error('Bridge not responding');
      }

      setScanProgress(30);
      setScanStatus('Ilagay ang daliri sa scanner... (hinihintay ang fingerprint)');

      // Capture fingerprint (bridge returns both image and template)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(`${BRIDGE_URL}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      setScanProgress(70);

      if (res.ok) {
        const data = await res.json();
        if (data.success !== false) {
          setCaptureMethod(data.method || 'unknown');

          // Show the fingerprint image preview
          if (data.image) {
            // Bridge returns base64 BMP image
            const imageDataUri = `data:image/bmp;base64,${data.image}`;
            setFingerprintImage(imageDataUri);
            setScanProgress(80);
            setScanStatus('✓ Fingerprint image captured! Uploading...');

            // Upload image to Supabase Storage
            setIsUploading(true);
            try {
              const id = seniorId || `temp_${Date.now()}`;
              const publicUrl = await uploadFingerprintImage(imageDataUri, id);

              setScanProgress(100);
              setIsScanning(false);
              setIsUploading(false);
              setScanStatus(`✓ Fingerprint saved! URL stored in database.`);

              // Return the public URL to parent (this gets saved to the database)
              onChange(publicUrl);
            } catch (uploadErr: any) {
              setIsUploading(false);
              setIsScanning(false);
              setScanProgress(90);
              setScanStatus(`⚠ Captured but upload failed: ${uploadErr.message}. Retake or try again.`);
              // Still show the image even if upload failed
            }
          } else {
            // No image returned (older bridge or serial scanner) — fallback
            setScanProgress(100);
            setIsScanning(false);
            setScanStatus(`✓ Fingerprint captured via ${data.method} (no image available from this device).`);
            // Store template ID as fallback
            onChange(data.template || data.id || 'captured');
          }
        } else {
          throw new Error(data.error || 'Capture failed');
        }
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Bridge returned an error');
      }
    } catch (err: any) {
      console.warn('OSCA Fingerprint Bridge error:', err);
      setIsScanning(false);
      setIsUploading(false);
      setScanProgress(0);

      if (err.name === 'AbortError') {
        setScanStatus('Timeout — walang daliring na-detect. Subukan ulit at ilagay ang daliri nang maigi.');
      } else if (err.message?.includes('Bridge not responding')) {
        setScanStatus('Hindi makonekta sa bridge. Siguraduhing nakabukas ang FingerprintBridge.exe.');
      } else {
        setScanStatus(err.message || 'Capture failed. Try again.');
      }
    }
  };

  // WebAuthn fallback
  const startWebAuthnScan = async () => {
    setIsScanning(true);
    setScanProgress(20);
    setScanStatus('Launching Windows Hello biometric prompt...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setScanProgress(50);

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: { name: "OSCA Juban Biometrics" },
          user: {
            id: userId,
            name: "senior@osca.juban.gov",
            displayName: "Registered Senior Citizen"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 30000
        }
      });

      setScanProgress(100);
      setIsScanning(false);

      if (credential) {
        setCaptureMethod('webauthn');
        setScanStatus('✓ Biometric identity verified via Windows Hello!');
        onChange('WebAuthn:' + credential.id);
      } else {
        throw new Error('No credential returned.');
      }
    } catch (err: any) {
      console.error(err);
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('Failed: ' + (err.message || 'Verification cancelled.'));
    }
  };

  // Simulated capture (testing only)
  const triggerSimulatorScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatus("Place the senior's thumb on the scanner glass...");

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    await new Promise((resolve) => setTimeout(resolve, 2200));
    clearInterval(interval);

    setIsScanning(false);
    setCaptureMethod('simulator');
    setFingerprintImage(null);
    setScanStatus('✓ Simulated (no real fingerprint image generated).');
    onChange('SIM:FP-' + Math.floor(Math.random() * 900000 + 100000));
  };

  const startScan = () => {
    if (scanMode === 'bridge') startBridgeScan();
    else if (scanMode === 'webauthn') startWebAuthnScan();
    else triggerSimulatorScan();
  };

  const resetCapture = () => {
    onChange(null);
    setFingerprintImage(null);
    setScanProgress(0);
    setCaptureMethod('');
    setScanStatus('Ready for scanning.');
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4">

      {/* Header & Source Mode Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-teal-600" />
          <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">Biometric Fingerprint Capture</span>
        </div>

        {/* Connection/Source select buttons */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => { setScanMode('bridge'); resetCapture(); }}
            className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (scanMode === 'bridge' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
          >
            U.are.U / Bridge
          </button>
          <button
            type="button"
            onClick={() => { setScanMode('webauthn'); resetCapture(); }}
            className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (scanMode === 'webauthn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
          >
            Windows Hello
          </button>
          <button
            type="button"
            onClick={() => { setScanMode('simulator'); resetCapture(); }}
            className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (scanMode === 'simulator' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
          >
            Simulator
          </button>
        </div>
      </div>

      {/* Bridge Connection Status Indicator */}
      {scanMode === 'bridge' && (
        <div className={'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium ' +
          (bridgeStatus.connected
            ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
            : 'bg-red-50 border border-red-100 text-red-600')}>
          {bridgeStatus.connected ? <Wifi size={11} /> : <WifiOff size={11} />}
          <span>
            {bridgeStatus.connected
              ? `Bridge v${bridgeStatus.version || '?'} connected` +
                (bridgeStatus.digitalPersona?.available
                  ? ` — U.are.U ${bridgeStatus.digitalPersona.count > 0 ? '✓ detected' : '(no device)'}`
                  : ` — ${bridgeStatus.serialPortCount || 0} serial port(s)`)
              : 'Bridge disconnected — buksan ang FingerprintBridge.exe'}
          </span>
          {bridgeStatus.connected && (
            <button type="button" onClick={checkBridgeStatus} className="ml-auto text-emerald-500 hover:text-emerald-700">
              <RefreshCw size={10} />
            </button>
          )}
        </div>
      )}

      {/* Main Biometric UI Stage */}
      <div className="flex flex-col items-center justify-center py-6 bg-white border border-slate-200 rounded-xl shadow-inner relative overflow-hidden min-h-[220px]">

        {isScanning && !fingerprintImage && (
          <div className="absolute inset-0 m-auto w-24 h-24 rounded-full border border-teal-500/20 bg-teal-500/5 animate-ping"></div>
        )}

        {/* ═══ STATE: Fingerprint captured — show image ═══ */}
        {(value || fingerprintImage) ? (
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            
            {/* Fingerprint Image Display */}
            {fingerprintImage ? (
              <div className="relative">
                <div className="w-28 h-36 rounded-lg border-2 border-emerald-200 shadow-md overflow-hidden bg-slate-900">
                  <img
                    src={fingerprintImage}
                    alt="Captured fingerprint"
                    className="w-full h-full object-contain opacity-90"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1.5 border-2 border-white shadow">
                  <Check size={12} className="stroke-[3]" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm relative">
                <Fingerprint size={32} className="stroke-[1.5]" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                  <Check size={10} className="stroke-[3]" />
                </div>
              </div>
            )}

            <div className="text-center">
              <h5 className="font-bold text-xs text-slate-800">
                {isUploading ? 'Uploading to storage...' : 'Fingerprint Saved ✓'}
              </h5>
              
              {isUploading && (
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-teal-600">
                  <Upload size={10} className="animate-bounce" />
                  <span>Saving fingerprint image to Supabase Storage...</span>
                </div>
              )}
              
              {value && !isUploading && (
                <p className="text-[9px] text-emerald-600 mt-1 font-medium max-w-[240px] truncate">
                  {value.startsWith('http') ? '✓ Image saved to cloud storage' : value.substring(0, 50)}
                </p>
              )}

              {value && value.startsWith('http') && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-blue-500 hover:text-blue-700 underline mt-0.5 inline-flex items-center gap-0.5"
                >
                  <Image size={9} />
                  View saved image
                </a>
              )}
            </div>
          </div>
        ) : (
          /* ═══ STATE: Ready to capture ═══ */
          <div className="flex flex-col items-center gap-3.5">
            <button
              type="button"
              disabled={isScanning || (scanMode === 'bridge' && !bridgeStatus.connected)}
              onClick={startScan}
              className={'w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-300 relative group ' +
                (isScanning
                  ? 'bg-teal-50 border-teal-400 text-teal-500 animate-pulse'
                  : (scanMode === 'bridge' && !bridgeStatus.connected)
                  ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-500 hover:text-teal-600 cursor-pointer active:scale-95')}
            >
              <Fingerprint size={30} className="stroke-[1.5]" />

              {isScanning && (
                <div className="absolute left-0 right-0 h-0.5 bg-teal-500/60 shadow shadow-teal-500 animate-bounce top-1/3"></div>
              )}
            </button>
            <div className="text-center px-4">
              <h5 className="font-semibold text-xs text-slate-700">
                {isScanning
                  ? 'Ilagay ang daliri sa scanner...'
                  : scanMode === 'bridge'
                  ? (bridgeStatus.connected ? 'Scanner Ready — Click to Capture' : 'Bridge Disconnected')
                  : scanMode === 'webauthn'
                  ? 'Windows Hello Ready'
                  : 'Simulator Ready'}
              </h5>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                {isScanning
                  ? `Capturing fingerprint... ${scanProgress}%`
                  : scanMode === 'bridge'
                    ? (bridgeStatus.connected
                        ? 'Fingerprint image will be captured, displayed, and saved to cloud storage'
                        : 'Start FingerprintBridge.exe to enable capture')
                    : scanMode === 'webauthn'
                    ? 'Windows Hello verification (no image saved)'
                    : 'Generates mock data for UI testing only'}
              </p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {(isScanning || isUploading) && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-100">
            <div
              className="h-full bg-teal-600 transition-all duration-300 rounded-r"
              style={{ width: scanProgress + '%' }}
            ></div>
          </div>
        )}
      </div>

      {/* Control Actions & Status */}
      <div className="flex items-center justify-between gap-3 text-slate-500 text-[11px] font-medium p-3 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-1.5 font-mono truncate">
          <div className={'w-1.5 h-1.5 rounded-full ' + (
            isScanning || isUploading ? 'bg-teal-400 animate-pulse' 
            : value ? 'bg-emerald-500' 
            : 'bg-slate-300'
          )}></div>
          <span className="truncate">{scanStatus}</span>
        </div>

        {value && !isScanning && !isUploading && (
          <button
            type="button"
            onClick={resetCapture}
            className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 hover:underline shrink-0"
          >
            <RefreshCw size={11} />
            <span>Retake</span>
          </button>
        )}
      </div>

      {/* Mode Advisory footer */}
      <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100/50 p-2.5 rounded-xl text-[10px] text-amber-800 leading-normal">
        <Info size={12} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          {scanMode === 'bridge' ? (
            <p>
              <strong>U.are.U / Bridge Mode (Recommended):</strong> Captures the actual fingerprint image,
              displays it for verification, then uploads to Supabase Storage. The image URL is saved to the database.
              Supports <strong>DigitalPersona U.are.U 4500</strong> and serial scanners.
              Requires FingerprintBridge.exe running locally.
            </p>
          ) : scanMode === 'webauthn' ? (
            <p>
              <strong>Windows Hello Mode:</strong> Verifies biometric identity through the browser but does NOT
              produce a fingerprint image. Use only for authentication, not senior citizen registration.
            </p>
          ) : (
            <p>
              <strong>Simulator Mode:</strong> Generates mock data for UI testing. No real fingerprint image is captured.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}

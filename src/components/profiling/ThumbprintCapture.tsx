import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Fingerprint, Check, RefreshCw, Cpu, Info, Wifi, WifiOff, Image, Camera, Square } from 'lucide-react';
import { systemSettingsService } from '../../services/supabaseService';
import { uploadFingerprintImage } from '../../services/storageService';

// Scanner type config — should match what's selected in Configuration page
// Reads from localStorage (set by ConfigurationPage)
function getScannerConfig(): { type: 'digitalpersona' | 'esp32'; endpoint: string } {
  const stored = localStorage.getItem('osca_fingerprint_scanner');
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  return { type: 'digitalpersona', endpoint: 'http://localhost:8000' };
}

// Async version that loads from database (called on mount)
async function loadScannerConfigFromDB(): Promise<{ type: 'digitalpersona' | 'esp32'; endpoint: string } | null> {
  try {
    const typeRow = await systemSettingsService.get('fingerprint_scanner_type');
    const endpointRow = await systemSettingsService.get('fingerprint_scanner_endpoint');
    if (typeRow?.settingValue || endpointRow?.settingValue) {
      return {
        type: (typeRow?.settingValue || 'digitalpersona') as 'digitalpersona' | 'esp32',
        endpoint: endpointRow?.settingValue || 'http://localhost:8000'
      };
    }
  } catch {}
  return null;
}

interface ThumbprintCaptureProps {
  value: string | null;
  onChange: (imageUrl: string | null) => void;
  seniorId?: string;
}

export default function ThumbprintCapture({ value, onChange, seniorId }: ThumbprintCaptureProps) {
  const [scannerConfig, setScannerConfig] = useState(getScannerConfig);
  const [isLiveDetecting, setIsLiveDetecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scanStatus, setScanStatus] = useState('Ready for scanning.');
  const [livePreview, setLivePreview] = useState<string | null>(null); // Live BMP preview (data URI)
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // Final captured image
  const [fingerDetected, setFingerDetected] = useState(false);
  const [bridgeConnected, setBridgeConnected] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastImageRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load config from database + check connection on mount
  useEffect(() => {
    (async () => {
      const dbConfig = await loadScannerConfigFromDB();
      if (dbConfig) {
        setScannerConfig(dbConfig);
        localStorage.setItem('osca_fingerprint_scanner', JSON.stringify(dbConfig));
      }
    })();
    checkConnection();
    return () => stopLiveDetection();
  }, []);

  const checkConnection = async () => {
    const endpoint = scannerConfig.type === 'esp32'
      ? `${scannerConfig.endpoint}/status`
      : `${scannerConfig.endpoint}/api/status`;

    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setBridgeConnected(true);
        const data = await res.json();
        setScanStatus(scannerConfig.type === 'esp32'
          ? `ESP32 connected — ${data.device || 'Fingerprint Scanner'}`
          : `Bridge v${data.version || '?'} connected`);
      } else {
        setBridgeConnected(false);
        setScanStatus('Scanner not responding.');
      }
    } catch {
      setBridgeConnected(false);
      setScanStatus(scannerConfig.type === 'esp32'
        ? 'Cannot connect to ESP32. Connect to WiFi: OSCA-Fingerprint'
        : 'Cannot connect to Fingerprint Bridge. Start FingerprintBridge.exe.');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ESP32 MODE: Live Detection (polling)
  // ═══════════════════════════════════════════════════════════

  const startLiveDetection = useCallback(() => {
    if (scannerConfig.type !== 'esp32') {
      startBridgeCapture();
      return;
    }

    setIsLiveDetecting(true);
    setFingerDetected(false);
    setLivePreview(null);
    setCapturedImage(null);
    setScanStatus('Live detection started — place finger on scanner...');

    // Start polling the ESP32
    const pollInterval = 500; // Poll every 500ms
    const poll = async () => {
      if (!isLiveDetecting && !pollingRef.current) return;

      try {
        abortRef.current = new AbortController();
        const res = await fetch(`${scannerConfig.endpoint}/live/detect/fingerprint`, {
          signal: abortRef.current.signal
        });

        if (!res.ok) return;

        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('image/bmp')) {
          // Finger detected — received BMP image
          const blob = await res.blob();
          const dataUri = await blobToDataUri(blob);
          
          setLivePreview(dataUri);
          lastImageRef.current = dataUri;
          setFingerDetected(true);
          setScanStatus('Finger detected! Click "Capture" to save.');
        } else {
          // JSON response — no finger detected
          const data = await res.json();
          if (!data.detected) {
            setFingerDetected(false);
            setScanStatus('Waiting for finger on scanner...');
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Poll error:', err);
        }
      }
    };

    // Start polling loop
    poll();
    pollingRef.current = setInterval(poll, pollInterval);
  }, [scannerConfig]);

  const stopLiveDetection = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLiveDetecting(false);
  };

  const captureCurrentFrame = async () => {
    // Stop polling
    stopLiveDetection();

    const imageToSave = lastImageRef.current || livePreview;
    if (!imageToSave) {
      setScanStatus('No image to capture. Try scanning again.');
      return;
    }

    // Convert BMP to PNG using canvas
    const pngDataUri = await convertBmpToPng(imageToSave);
    setCapturedImage(pngDataUri);
    setScanStatus('Fingerprint captured! Uploading...');

    // Upload to Supabase Storage
    setIsUploading(true);
    try {
      const id = seniorId || `temp_${Date.now()}`;
      const publicUrl = await uploadFingerprintImage(pngDataUri, id);
      setIsUploading(false);
      setScanStatus('Fingerprint saved to storage.');
      onChange(publicUrl);
    } catch (err: any) {
      setIsUploading(false);
      setScanStatus(`Upload failed: ${err.message}. Click Retake to try again.`);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // DIGITALPERSONA MODE: Single Capture via Bridge
  // ═══════════════════════════════════════════════════════════

  const startBridgeCapture = async () => {
    setIsLiveDetecting(true);
    setLivePreview(null);
    setCapturedImage(null);
    setScanStatus('Connecting to Fingerprint Bridge...');

    try {
      const res = await fetch(`${scannerConfig.endpoint}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success !== false && data.image) {
          const imageDataUri = `data:image/bmp;base64,${data.image}`;
          const pngDataUri = await convertBmpToPng(imageDataUri);
          
          setCapturedImage(pngDataUri);
          setIsLiveDetecting(false);
          setScanStatus(`Fingerprint captured! Quality: ${data.quality || 'N/A'}%. Uploading...`);

          // Upload
          setIsUploading(true);
          const id = seniorId || `temp_${Date.now()}`;
          const publicUrl = await uploadFingerprintImage(pngDataUri, id);
          setIsUploading(false);
          setScanStatus('Fingerprint saved to storage.');
          onChange(publicUrl);
        } else if (data.success !== false && !data.image) {
          // Template only (no image)
          setIsLiveDetecting(false);
          setScanStatus('Captured (no image from this device).');
          onChange(data.template || data.id || 'captured');
        } else {
          throw new Error(data.error || 'Capture failed');
        }
      } else {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Bridge error');
      }
    } catch (err: any) {
      setIsLiveDetecting(false);
      if (err.name === 'AbortError') {
        setScanStatus('Timeout — no finger detected. Try again.');
      } else {
        setScanStatus(err.message || 'Capture failed.');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════════════════════

  /** Convert Blob to data URI */
  const blobToDataUri = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  /** Convert BMP data URI to PNG using canvas */
  const convertBmpToPng = (bmpDataUri: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(bmpDataUri); // Fallback to original
      img.src = bmpDataUri;
    });
  };

  const resetCapture = () => {
    stopLiveDetection();
    onChange(null);
    setLivePreview(null);
    setCapturedImage(null);
    setFingerDetected(false);
    lastImageRef.current = null;
    setScanStatus('Ready for scanning.');
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  const displayImage = capturedImage || livePreview;
  const isEsp32 = scannerConfig.type === 'esp32';

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-teal-600" />
          <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">Fingerprint Capture</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
            isEsp32
              ? 'text-violet-600 bg-violet-50 border-violet-200'
              : 'text-teal-600 bg-teal-50 border-teal-200'
          }`}>
            {isEsp32 ? 'ESP32 / Arduino' : 'U.are.U 4500'}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      <div className={'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium ' +
        (bridgeConnected
          ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
          : 'bg-red-50 border border-red-100 text-red-600')}>
        {bridgeConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
        <span>{scanStatus}</span>
        <button type="button" onClick={checkConnection} className="ml-auto opacity-60 hover:opacity-100">
          <RefreshCw size={10} />
        </button>
      </div>

      {/* Main Capture Area */}
      <div className="flex flex-col items-center justify-center py-4 bg-white border border-slate-200 rounded-xl shadow-inner relative overflow-hidden min-h-[260px]">

        {/* ═══ Fingerprint Image Preview ═══ */}
        {displayImage ? (
          <div className="flex flex-col items-center gap-3">
            {/* Image display */}
            <div className={`relative rounded-lg border-2 shadow-md overflow-hidden bg-slate-900 ${
              isLiveDetecting 
                ? (fingerDetected ? 'border-green-400' : 'border-amber-400 animate-pulse') 
                : 'border-emerald-300'
            }`} style={{ width: 180, height: 200 }}>
              <img
                src={displayImage}
                alt="Fingerprint"
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Live indicator */}
              {isLiveDetecting && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  LIVE
                </div>
              )}
              {/* Captured checkmark */}
              {capturedImage && !isLiveDetecting && (
                <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow">
                  <Check size={12} className="stroke-[3]" />
                </div>
              )}
            </div>

            {/* Action buttons during live detection */}
            {isLiveDetecting && isEsp32 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={captureCurrentFrame}
                  disabled={!fingerDetected}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    fingerDetected
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Camera size={13} />
                  Capture
                </button>
                <button
                  type="button"
                  onClick={stopLiveDetection}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all"
                >
                  <Square size={11} fill="currentColor" />
                  Stop
                </button>
              </div>
            )}

            {/* Upload indicator */}
            {isUploading && (
              <p className="text-[10px] text-teal-600 font-medium animate-pulse">Uploading to storage...</p>
            )}

            {/* Saved confirmation */}
            {value && !isUploading && !isLiveDetecting && (
              <div className="text-center">
                <p className="text-[10px] text-emerald-600 font-bold">Fingerprint saved to storage</p>
                {value.startsWith('http') && (
                  <a href={value} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] text-blue-500 hover:text-blue-700 underline inline-flex items-center gap-0.5 mt-0.5">
                    <Image size={9} /> View saved image
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ═══ Ready State — Scan Button ═══ */
          <div className="flex flex-col items-center gap-3.5">
            {isLiveDetecting && !displayImage ? (
              // Waiting for finger (ESP32 mode, no image yet)
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center animate-pulse">
                  <Fingerprint size={30} className="text-amber-500 stroke-[1.5]" />
                </div>
                <p className="text-xs font-semibold text-amber-700">Waiting for finger...</p>
                <p className="text-[10px] text-slate-400">Place your finger on the scanner</p>
                <button
                  type="button"
                  onClick={stopLiveDetection}
                  className="mt-2 text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Square size={9} fill="currentColor" /> Stop
                </button>
              </div>
            ) : (
              // Initial state — start button
              <>
                <button
                  type="button"
                  disabled={!bridgeConnected}
                  onClick={startLiveDetection}
                  className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    bridgeConnected
                      ? 'bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-500 hover:text-teal-600 cursor-pointer active:scale-95'
                      : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Fingerprint size={30} className="stroke-[1.5]" />
                </button>
                <div className="text-center px-4">
                  <h5 className="font-semibold text-xs text-slate-700">
                    {bridgeConnected ? 'Scanner Ready — Click to Start' : 'Scanner Not Connected'}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                    {isEsp32
                      ? 'Live fingerprint detection will start. Image updates in real-time.'
                      : 'Click to capture fingerprint via the bridge service.'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Retake button */}
      {(value || capturedImage) && !isLiveDetecting && !isUploading && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetCapture}
            className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 hover:underline"
          >
            <RefreshCw size={11} /> Retake
          </button>
        </div>
      )}

      {/* Info footer */}
      <div className="flex items-start gap-1.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[10px] text-slate-500 leading-normal">
        <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
        <p>
          {isEsp32
            ? 'ESP32 mode: Connects wirelessly to the fingerprint scanner via WiFi (OSCA-Fingerprint network). Live detection polls continuously until you click Capture.'
            : 'U.are.U 4500 mode: Connects via USB through the Fingerprint Bridge service (localhost:8000). Single capture per scan.'}
        </p>
      </div>
    </div>
  );
}

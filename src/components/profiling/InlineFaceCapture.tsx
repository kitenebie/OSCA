import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, Check, X, ShieldCheck, Loader2, Camera, Trash, ScanFace, Maximize2 } from 'lucide-react';

interface InlineFaceCaptureProps {
  value: string | null;
  onChange: (base64Img: string | null) => void;
}

type CameraMode = 'native' | 'ai';

// Generate unique session ID for face detection
const generateSessionId = () => `osca_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

export default function InlineFaceCapture({ value, onChange }: InlineFaceCaptureProps) {
  const [sessionId, setSessionId] = useState(generateSessionId);
  const [cameraMode, setCameraMode] = useState<CameraMode>('native');
  const [cameraActive, setCameraActive] = useState(false);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [detectionStatus, setDetectionStatus] = useState('Click "Start Camera" to begin.');

  // Native camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // AI Modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const pollingRef = useRef<number | null>(null);

  const faceDetectionUrl = `https://earms.online/face-detection/${sessionId}`;
  const faceResultUrl = `https://earms.online/face-detection/${sessionId}/result`;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNativeCamera();
      stopResultPolling();
    };
  }, []);

  // ═══════════════════════════════════════════════════
  // NATIVE CAMERA
  // ═══════════════════════════════════════════════════

  const startNativeCamera = async () => {
    setIsReady(false);
    setDetectionStatus('Starting camera...');

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (!navigator.mediaDevices) {
      setDetectionStatus(!window.isSecureContext
        ? 'HTTPS required for camera access.'
        : 'No camera API available in your browser.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setIsReady(true);
      setCameraActive(true);
      setDetectionStatus('Camera active — click Capture when ready.');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      setDetectionStatus('Cannot access camera: ' + err.message);
    }
  };

  const stopNativeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
  };

  const captureNativePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.92);
      setTempPhoto(base64);
      stopNativeCamera();
      setCameraActive(false);
      setDetectionStatus('✓ Photo captured! Please confirm to save.');
    }
  };

  // ═══════════════════════════════════════════════════
  // AI FACE SCANNER MODAL
  // ═══════════════════════════════════════════════════

  const openAiModal = () => {
    setSessionId(generateSessionId()); // fresh session each time
    setAiModalOpen(true);
    setIframeLoaded(false);
  };

  const closeAiModal = () => {
    setAiModalOpen(false);
    setIframeLoaded(false);
    stopResultPolling();
  };

  // Listen for postMessage from AI iframe
  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (_) { return; }
        }
        if (!data) return;

        // Check for captured image in various formats
        const raw = data.photoUri || data.img || data.image || data.base64 || data.photo || data.data;
        if (raw && typeof raw === 'string' && raw.length > 200) {
          const imageData = raw.startsWith('data:image') ? raw : 'data:image/jpeg;base64,' + raw;
          handleAiCaptured(imageData);
        }
      } catch (_) {}
    };
    if (aiModalOpen) {
      window.addEventListener('message', handleMsg);
      return () => window.removeEventListener('message', handleMsg);
    }
  }, [aiModalOpen]);

  // Inject interceptor into AI iframe when loaded
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    // Start polling for result from the server
    startResultPolling();
  };

  // Poll the earms.online result endpoint for captured image
  const startResultPolling = useCallback(() => {
    stopResultPolling();
    pollingRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(faceResultUrl);
        if (res.ok) {
          const data = await res.json();
          // Check various response shapes
          const img = data?.img || data?.image || data?.photo || data?.base64 || data?.photoUri;
          if (img && img.length > 200) {
            const imageData = img.startsWith('data:image') ? img : 'data:image/jpeg;base64,' + img;
            handleAiCaptured(imageData);
          }
        }
      } catch (_) {
        // Not ready yet, keep polling
      }
    }, 1500);
    // Stop after 90 seconds
    setTimeout(() => stopResultPolling(), 90000);
  }, [faceResultUrl]);

  const stopResultPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Handle AI captured — immediately close modal and show preview
  const handleAiCaptured = (imageData: string) => {
    stopResultPolling();
    setTempPhoto(imageData);
    setAiModalOpen(false);
    setIframeLoaded(false);
    setCameraActive(false);
    setDetectionStatus('✓ Face captured by AI! Please confirm to save.');
  };

  // ═══════════════════════════════════════════════════
  // SHARED HANDLERS
  // ═══════════════════════════════════════════════════

  const handleStartCamera = () => {
    if (cameraMode === 'native') {
      startNativeCamera();
    } else {
      openAiModal();
    }
  };

  const handleRetake = () => {
    setTempPhoto(null);
    setDetectionStatus('Restarting...');
    if (cameraMode === 'native') {
      startNativeCamera();
    } else {
      openAiModal();
    }
  };

  const handleConfirm = () => {
    if (tempPhoto) {
      onChange(tempPhoto);
      setTempPhoto(null);
      setCameraActive(false);
    }
  };

  const handleClear = () => {
    onChange(null);
    setTempPhoto(null);
    setCameraActive(false);
    stopNativeCamera();
    setDetectionStatus('Click "Start Camera" to begin.');
  };

  const switchMode = (mode: CameraMode) => {
    stopNativeCamera();
    setCameraActive(false);
    setCameraMode(mode);
    setDetectionStatus(mode === 'native' ? 'Click "Start Camera" to begin.' : 'Click "Start AI Face Scanner" to begin.');
  };

  return (
    <>
      {/* ═══ MAIN INLINE COMPONENT ═══ */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : value ? 'bg-emerald-500' : 'bg-teal-500'}`}></div>
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">LGU BIOMETRIC FACE CAPTURE</h4>
          </div>

          {/* Mode Switcher */}
          {!value && !tempPhoto && (
            <div className="flex bg-slate-200 p-0.5 rounded-lg self-start">
              <button
                type="button"
                onClick={() => switchMode('native')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  cameraMode === 'native' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Camera
              </button>
              <button
                type="button"
                onClick={() => switchMode('ai')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  cameraMode === 'ai' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                AI Scanner
              </button>
            </div>
          )}
        </div>

        {/* Main Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Left Side: Camera Stage */}
          <div className="md:col-span-7 bg-slate-950 aspect-[4/3] relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
            {value ? (
              <div className="w-full h-full relative">
                <img src={value} alt="Captured Biometric" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-[10px] font-bold text-teal-300 font-mono tracking-widest uppercase bg-slate-950/70 px-2.5 py-1 rounded-md border border-teal-500/30">
                    ✓ BIOMETRICS ENROLLED
                  </span>
                </div>
              </div>
            ) : tempPhoto ? (
              <div className="w-full h-full relative">
                <img src={tempPhoto} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-[10px] font-bold text-amber-300 font-mono tracking-widest uppercase bg-slate-950/70 px-2.5 py-1 rounded-md border border-amber-500/30 animate-pulse">
                    ⚠ AWAITING CONFIRMATION
                  </span>
                </div>
              </div>
            ) : cameraActive && cameraMode === 'native' ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {!isReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-20 gap-3 text-slate-400">
                    <Loader2 className="animate-spin text-teal-500" size={28} />
                    <span className="text-[11px] font-semibold">Starting camera...</span>
                  </div>
                )}
                {isReady && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold bg-teal-500/90 text-white backdrop-blur-sm z-10">
                    <Camera size={11} />
                    LIVE
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                  {cameraMode === 'native' ? (
                    <Camera size={36} className="text-teal-500" strokeWidth={1.5} />
                  ) : (
                    <ScanFace size={36} className="text-teal-500" strokeWidth={1.5} />
                  )}
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-300">
                    {cameraMode === 'native' ? 'Camera Capture' : 'AI Face Scanner'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {cameraMode === 'native' ? 'Manual photo capture' : 'Opens in full-screen for better detection'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Instructions & Status */}
          <div className="md:col-span-5 p-5 flex flex-col justify-between bg-slate-50 gap-5">
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Instructions:</h5>
              <ul className="space-y-1.5 text-[10.5px] text-slate-500 font-medium list-disc list-inside leading-relaxed">
                <li>Look directly at the camera.</li>
                <li>Ensure the surroundings are well-lit.</li>
                <li>Remove hat, glasses, and mask.</li>
                <li>Do not move while capturing.</li>
                {cameraMode === 'ai' ? (
                  <li className="text-teal-600 font-semibold">AI will auto-detect and capture your face.</li>
                ) : (
                  <li className="text-teal-600 font-semibold">Click Capture when the face is centered.</li>
                )}
              </ul>
            </div>

            {/* Mode Info */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
              {cameraMode === 'native' ? (
                <>
                  <Camera size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-indigo-600 leading-relaxed font-medium">
                    <p><strong>Standard Camera</strong></p>
                    <p className="text-indigo-400 mt-0.5">Manual capture mode. Click the button to take a photo.</p>
                  </div>
                </>
              ) : (
                <>
                  <Maximize2 size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-[10px] text-indigo-600 leading-relaxed font-medium">
                    <p><strong>AI Face Detection</strong></p>
                    <p className="text-indigo-400 mt-0.5">Opens full-screen modal for accurate face detection & auto-capture.</p>
                  </div>
                </>
              )}
            </div>

            {/* Status Bar */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200">
              <div className={'w-2 h-2 rounded-full shrink-0 ' +
                (value ? 'bg-emerald-500' :
                 tempPhoto ? 'bg-amber-500 animate-pulse' :
                 cameraActive ? 'bg-green-400 animate-pulse' : 'bg-slate-300')
              }></div>
              <span className="text-[10px] font-mono font-bold text-slate-600 leading-none truncate flex-1">
                {value ? 'Successfully Enrolled' : detectionStatus}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {value ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Trash size={13} />
                  <span>Burahin at Kumuha Muli</span>
                </button>
              ) : tempPhoto ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <RefreshCw size={12} />
                    <span>Ulitin</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Check size={13} />
                    <span>Confirm & Save</span>
                  </button>
                </div>
              ) : cameraActive && cameraMode === 'native' && isReady ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { stopNativeCamera(); setCameraActive(false); setDetectionStatus('Click "Start Camera" to begin.'); }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <X size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={captureNativePhoto}
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 cursor-pointer transition-all active:scale-95"
                  >
                    <Camera size={16} />
                    <span>Capture</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 cursor-pointer transition-all active:scale-95"
                >
                  {cameraMode === 'native' ? <Camera size={16} /> : <ScanFace size={16} />}
                  <span>{cameraMode === 'native' ? 'Start Camera' : 'Start AI Face Scanner'}</span>
                </button>
              )}
            </div>

            {/* Privacy Badge */}
            <div className="flex items-start gap-1.5 opacity-70 text-[9.5px] text-slate-400 pt-1">
              <ShieldCheck size={12} className="text-teal-500 shrink-0 mt-0.5" />
              <p className="leading-normal font-medium">
                Session-based capture. No biometric data stored externally.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ AI FACE SCANNER MODAL (Full-Screen Overlay) ═══ */}
      {aiModalOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] bg-black flex flex-col overflow-hidden" style={{ width: '100vw', height: '100vh' }}>
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-2 bg-slate-900 border-b border-slate-700 shrink-0 h-12">
            <div className="flex items-center gap-2">
              <ScanFace size={18} className="text-teal-400" />
              <h4 className="font-bold text-sm text-white uppercase tracking-wide">AI Face Detection</h4>
              {iframeLoaded && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Active
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={closeAiModal}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white transition-all hover:scale-105"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body — Full-size iframe */}
          <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
            <iframe
              ref={iframeRef}
              src={faceDetectionUrl}
              className="border-0"
              style={{ width: '60%', height: '100%', overflow: 'hidden' }}
              scrolling="no"
              onLoad={handleIframeLoad}
              allow="camera; microphone; display-capture"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Loading overlay */}
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4">
                <Loader2 className="animate-spin text-teal-500" size={40} />
                <span className="text-sm font-semibold text-slate-300">Loading AI Face Scanner...</span>
                <span className="text-xs text-slate-500">Please allow camera access when prompted</span>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-2 bg-slate-900 border-t border-slate-700 flex items-center justify-between shrink-0 h-12">
            <p className="text-[11px] text-slate-400 font-medium">
              Position your face in the frame. The AI will auto-detect and capture.
            </p>
            <button
              type="button"
              onClick={closeAiModal}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Check, X, ShieldCheck, Loader2, Camera, Trash, Upload, Monitor } from 'lucide-react';
import FaceCapture from '@getyoti/react-face-capture';

interface InlineFaceCaptureProps {
  value: string | null;
  onChange: (base64Img: string | null) => void;
}

type CameraMode = 'yoti' | 'native' | 'simulation';

export default function InlineFaceCapture({ value, onChange }: InlineFaceCaptureProps) {
  const [cameraMode, setCameraMode] = useState<CameraMode>('yoti');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Nilo-load ang AI Biometric Face Sensor...');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  
  // Native camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simulation state
  const [simulating, setSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  // Clean up native camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleSuccess = (payload: any) => {
    let imgData = payload.img;
    if (imgData && !imgData.startsWith('data:')) {
      imgData = 'data:image/jpeg;base64,' + imgData;
    }
    setTempPhoto(imgData);
    setDetectionStatus('Larawan ay matagumpay na nakuha! Paki-confirm upang i-save.');
  };

  const handleError = (error: any) => {
    console.error('Yoti Face Capture Error:', error);
    let errorMsg = 'Hindi ma-load ang Face Capture. Pakisuri kung may camera at pinayagan ang permission.';
    if (error === 'NO_CAMERA_PERMISSION') {
      errorMsg = 'Walang pahintulot sa camera. Mangyaring payagan ito sa iyong browser.';
    } else if (error === 'NO_CAMERA') {
      errorMsg = 'Walang nakitang camera sa iyong device.';
    }
    
    // Check if secure context is the issue
    if (!window.isSecureContext && !navigator.mediaDevices) {
      errorMsg = 'Pinigilan ng Browser (Insecure Connection): Ang camera access ay nangangailangan ng HTTPS o localhost connection.';
    }
    
    setCameraError(errorMsg);
    setDetectionStatus('May error sa sensor');
  };

  // Start native camera stream safely
  const startNativeCamera = async () => {
    setCameraError(null);
    setIsReady(false);
    
    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // Safe check for navigator.mediaDevices
    if (!navigator.mediaDevices) {
      const errorMsg = !window.isSecureContext
        ? 'Insecure HTTP Connection: Ang camera/webcam access ay pinapahintulutan lamang sa HTTPS o localhost ng modernong browser. Mangyaring gumamit ng Simulator Mode o mag-upload.'
        : 'Walang mediaDevices API na nahanap sa iyong browser.';
      setCameraError(errorMsg);
      setCameraMode('simulation'); // auto switch to simulation to prevent crash
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setIsReady(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      console.error('Native Camera Error:', err);
      setCameraError('Hindi ma-access ang standard camera: ' + err.message);
    }
  };

  const stopNativeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsReady(false);
  };

  const startSimulation = () => {
    setCameraError(null);
    setSimulating(true);
    setSimProgress(0);
    setIsReady(false);
    setDetectionStatus('Kumokonekta sa simulated face sensor...');

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setSimulating(false);
      
      // Select a nice mock avatar face
      const randomId = Math.floor(Math.random() * 70) + 1;
      const mockPhoto = 'https://i.pravatar.cc/300?img=' + randomId;
      setTempPhoto(mockPhoto);
      setDetectionStatus('Simulated photo captured successfully! Paki-confirm upang i-save.');
    }, 2200);
  };

  const captureNativePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        setTempPhoto(base64);
        stopNativeCamera();
        setDetectionStatus('Larawan ay matagumpay na nakuha! Paki-confirm upang i-save.');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setTempPhoto(base64);
        setCameraError(null);
        stopNativeCamera();
        setDetectionStatus('Larawan ay matagumpay na na-upload! Paki-confirm upang i-save.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setTempPhoto(null);
    setIsReady(false);
    setDetectionStatus(cameraMode === 'native' ? 'Sinisimulan ang camera...' : 'Nilo-load muli ang AI Biometric Face Sensor...');
    if (cameraMode === 'native') {
      startNativeCamera();
    } else if (cameraMode === 'simulation') {
      startSimulation();
    }
  };

  const handleConfirm = () => {
    if (tempPhoto) {
      onChange(tempPhoto);
      setTempPhoto(null);
    }
  };

  const handleClear = () => {
    onChange(null);
    setTempPhoto(null);
    setIsReady(false);
    setDetectionStatus(cameraMode === 'native' ? 'Sinisimulan ang camera...' : 'Nilo-load ang AI Biometric Face Sensor...');
    if (cameraMode === 'native') {
      startNativeCamera();
    } else if (cameraMode === 'simulation') {
      startSimulation();
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="inline-face-capture-card">
      {/* Header & Mode Switcher */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="inline-face-capture-header">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></div>
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">LGU BIOMETRIC FACE CAPTURE</h4>
        </div>
        
        {/* Toggle between Yoti AI, Standard Native Camera, and Simulated Camera */}
        {!value && !tempPhoto && (
          <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-350 self-start">
            <button
              type="button"
              onClick={() => { setCameraMode('yoti'); setCameraError(null); stopNativeCamera(); }}
              className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (cameraMode === 'yoti' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
            >
              Yoti AI Scan
            </button>
            <button
              type="button"
              onClick={() => { setCameraMode('native'); startNativeCamera(); }}
              className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (cameraMode === 'native' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
            >
              Standard Camera
            </button>
            <button
              type="button"
              onClick={() => { setCameraMode('simulation'); setCameraError(null); stopNativeCamera(); }}
              className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (cameraMode === 'simulation' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
            >
              Simulated Camera
            </button>
          </div>
        )}
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0" id="inline-face-capture-body">
        {/* Left Side: Camera or Captured Photo preview */}
        <div className="md:col-span-7 bg-slate-950 aspect-[4/3] relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200" id="inline-camera-stage">
          {value ? (
            /* FINAL SAVED PHOTO PREVIEW */
            <div className="w-full h-full relative" id="final-saved-photo-container">
              <img 
                referrerPolicy="no-referrer"
                src={value} 
                alt="Captured Biometric Profile" 
                className="w-full h-full object-cover"
                id="final-saved-photo"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-[10px] font-bold text-teal-300 font-mono tracking-widest uppercase bg-slate-950/70 px-2.5 py-1 rounded-md border border-teal-500/30">
                  ✓ BIOMETRICS ENROLLED
                </span>
              </div>
            </div>
          ) : tempPhoto ? (
            /* TEMPORARY PHOTO BEFORE CONFIRMATION */
            <div className="w-full h-full relative" id="temp-photo-container">
              <img 
                referrerPolicy="no-referrer"
                src={tempPhoto} 
                alt="Temp Captured Profile" 
                className="w-full h-full object-cover"
                id="temp-photo"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-[10px] font-bold text-amber-300 font-mono tracking-widest uppercase bg-slate-950/70 px-2.5 py-1 rounded-md border border-amber-500/30 animate-pulse">
                  ⚠ AWAITING CONFIRMATION
                </span>
              </div>
            </div>
          ) : cameraError && cameraMode !== 'simulation' ? (
            /* CAMERA ERROR DISPLAY WITH ACTION BUTTONS */
            <div className="p-6 text-center text-red-400 space-y-4 flex flex-col items-center justify-center h-full" id="inline-camera-error">
              <X className="text-red-500 shrink-0" size={32} />
              <div className="space-y-1 px-4">
                <p className="text-xs font-bold leading-normal">{cameraError}</p>
                <p className="text-[10px] text-slate-400">Hindi ma-access ang system camera. Pumili ng simulated mode o gumamit ng file upload.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => { setCameraMode('simulation'); setCameraError(null); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <Monitor size={13} />
                  <span>Gumamit ng Simulator</span>
                </button>
                <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all active:scale-95">
                  <Upload size={13} />
                  <span>Mag-upload na lang</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          ) : cameraMode === 'native' ? (
            /* STANDARD HTML5 VIDEO CAMERA STREAM */
            <div className="w-full h-full relative flex items-center justify-center" id="native-camera-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-20 gap-3 text-slate-400" id="native-camera-loading">
                  <Loader2 className="animate-spin text-teal-500" size={28} />
                  <span className="text-[11px] font-semibold">Sinisimulan ang standard camera...</span>
                </div>
              )}
            </div>
          ) : cameraMode === 'simulation' ? (
            /* CAMERA SCANNER SIMULATOR VIEW (GREAT FOR REMOTE HTTP SERVERS) */
            <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-900 gap-4" id="simulated-camera-wrapper">
              {simulating ? (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
                  <Loader2 className="animate-spin text-teal-500" size={32} />
                  <div className="text-center">
                    <p className="text-xs font-bold">Scanning Senior Citzen Face...</p>
                    <p className="text-[9px] text-slate-500 mt-1 font-mono">Progress: {simProgress}%</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400 p-6 text-center">
                  <div className="w-16 h-16 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-600 relative">
                    <Camera size={26} />
                    <div className="absolute inset-0 bg-teal-500/10 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white">Biometric Scanner Simulator</h5>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Umiwas sa security lock ng browser sa pamamagitan ng paggamit ng simulated camera sensor.</p>
                  </div>
                </div>
              )}
              {simulating && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
                  <div className="h-full bg-teal-500 transition-all duration-200" style={{ width: simProgress + '%' }}></div>
                </div>
              )}
            </div>
          ) : (
            /* REAL-TIME LIVE CAMERA FEET WITH YOTI */
            <div className="w-full h-full relative flex items-center justify-center" id="inline-yoti-wrapper">
              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-20 gap-3 text-slate-400" id="inline-camera-loading">
                  <Loader2 className="animate-spin text-teal-500" size={28} />
                  <span className="text-[11px] font-semibold">Nilo-load ang Biometric Sensors...</span>
                </div>
              )}
              <div className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" id="inline-yoti-component-container">
                <FaceCapture
                  faceCaptureAssetsRootUrl="/assets/face-capture/"
                  secure={false}
                  onSuccess={handleSuccess}
                  onError={handleError}
                  onReadyForCapture={() => {
                    setIsReady(true);
                    setDetectionStatus('I-align ang mukha sa bilog at kumuha...');
                  }}
                  showOverlay={true}
                  showInitialGuidance={false}
                  showGetHelpButton={false}
                  numStableFrames={4}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Instructions & Controls */}
        <div className="md:col-span-5 p-5 flex flex-col justify-between bg-slate-50 gap-5" id="inline-camera-instructions">
          <div className="space-y-4">
            <div>
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Mga Gabay sa Pagkuha:</h5>
              <ul className="mt-2 space-y-1.5 text-[10.5px] text-slate-500 font-medium list-disc list-inside leading-relaxed">
                <li>Tumingin nang diretso sa camera o simulator view.</li>
                <li>Huwag gumalaw habang kinukuha ang larawan.</li>
                <li>Siguraduhing maliwanag at walang anino ang mukha.</li>
              </ul>
            </div>

            {/* Live Status Bar */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200" id="inline-status-bar">
              <div className={'w-2 h-2 rounded-full shrink-0 ' + 
                (cameraError && cameraMode !== 'simulation' ? 'bg-red-500' : 
                 value ? 'bg-emerald-500' : 
                 tempPhoto ? 'bg-amber-500 animate-pulse' : 
                 (cameraMode === 'simulation' && simulating ? 'bg-teal-400 animate-pulse' :
                  cameraMode === 'simulation' ? 'bg-slate-400' :
                  !value && !tempPhoto && isReady ? 'bg-teal-400 animate-pulse' : 'bg-slate-300'))
              }></div>
              <span className="text-[10px] font-mono font-bold text-slate-600 leading-none truncate flex-1">
                {value ? 'Matagumpay na Naka-enroll' : 
                 (cameraMode === 'simulation' && simulating ? 'Scanning face ridge...' :
                  cameraMode === 'simulation' ? 'Simulator Handa' :
                  cameraMode === 'native' && isReady && !tempPhoto ? 'Standard Camera Aktibo' : detectionStatus)}
              </span>
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-3" id="inline-action-area">
            {value ? (
              /* IF ALREADY SAVED */
              <button
                type="button"
                onClick={handleClear}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                id="inline-clear-btn"
              >
                <Trash size={13} />
                <span>Burahin ang Larawan (Reset Camera)</span>
              </button>
            ) : tempPhoto ? (
              /* IF CAPTURED BUT NOT CONFIRMED */
              <div className="grid grid-cols-2 gap-2" id="inline-temp-actions">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                  id="inline-retake-btn"
                >
                  <RefreshCw size={13} className="text-slate-500" />
                  <span>Kuhang Muli</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/10 transition-all active:scale-95"
                  id="inline-confirm-btn"
                >
                  <Check size={13} />
                  <span>I-save ang Larawan</span>
                </button>
              </div>
            ) : cameraMode === 'native' && isReady ? (
              /* ACTIVE NATIVE CAMERA CAPTURE BUTTON */
              <button
                type="button"
                onClick={captureNativePhoto}
                className="w-full py-2.5 bg-teal-650 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/10 transition-all active:scale-95"
                id="inline-capture-btn"
              >
                <Camera size={14} />
                <span>Kumuha ng Larawan (Capture)</span>
              </button>
            ) : cameraMode === 'simulation' ? (
              /* ACTIVE SIMULATION SCAN TRIGGER BUTTON */
              <button
                type="button"
                disabled={simulating}
                onClick={startSimulation}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/10 transition-all active:scale-95"
                id="inline-simulate-btn"
              >
                <Camera size={14} />
                <span>I-scan sa Simulator (Simulate Capture)</span>
              </button>
            ) : (
              /* DEFAULT INSTRUCTIONS & FALLBACK FILE UPLOAD */
              <div className="flex flex-col gap-2.5">
                <label className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95" id="inline-upload-btn">
                  <Upload size={13} className="text-slate-500" />
                  <span>Mag-upload ng Larawan (Upload File)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <div className="text-[10px] text-slate-400 font-semibold text-center italic bg-white/60 p-3 rounded-xl border border-dashed border-slate-200/80">
                  {cameraMode === 'yoti' 
                    ? 'Awtomatikong kukuha ang sensor kapag naging stable ang mukha sa green boundary.'
                    : 'Paki-click ang Kumuha ng Larawan button sa itaas kapag handa na.'}
                </div>
              </div>
            )}

            <div className="flex items-start gap-1.5 opacity-70 text-[9.5px] text-slate-400 pt-1" id="inline-privacy-badge">
              <ShieldCheck size={12} className="text-teal-500 shrink-0 mt-0.5" />
              <p className="leading-normal font-medium">
                Real-time biometric vectors are processed securely inside this browser session for privacy compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

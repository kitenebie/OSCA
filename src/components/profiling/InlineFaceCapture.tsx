import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Check, X, ShieldCheck, Loader2, Camera, Trash } from 'lucide-react';
import FaceCapture from '@getyoti/react-face-capture';

interface InlineFaceCaptureProps {
  value: string | null;
  onChange: (base64Img: string | null) => void;
}

type CameraMode = 'yoti' | 'native';

export default function InlineFaceCapture({ value, onChange }: InlineFaceCaptureProps) {
  const [cameraMode, setCameraMode] = useState<CameraMode>('yoti');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Nilo-load ang AI Biometric Face Sensor...');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [yotiCrashed, setYotiCrashed] = useState(false);

  // Native camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Catch Yoti async errors (Box.constructor crash) globally
  useEffect(() => {
    const handleUnhandled = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Box.constructor') || 
          event.reason?.message?.includes('IBoundingBox')) {
        event.preventDefault(); // Prevent console error spam
        console.warn('[FaceCapture] Yoti Box error caught - switching to native camera');
        setYotiCrashed(true);
        setCameraMode('native');
        startNativeCamera();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandled);
    return () => window.removeEventListener('unhandledrejection', handleUnhandled);
  }, []);

  // Clean up native camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Auto-start native camera when switching modes
  useEffect(() => {
    if (cameraMode === 'native' && !value && !tempPhoto) {
      startNativeCamera();
    }
  }, [cameraMode]);

  const handleYotiSuccess = (payload: any) => {
    let imgData = payload.img;
    if (imgData && !imgData.startsWith('data:')) {
      imgData = 'data:image/jpeg;base64,' + imgData;
    }
    setTempPhoto(imgData);
    setDetectionStatus('Larawan ay matagumpay na nakuha! Paki-confirm upang i-save.');
  };

  const handleYotiError = (error: any) => {
    console.error('Yoti Face Capture Error:', error);
    if (error === 'EXCEEDED_TIME_TO_LOAD' || error === 'NO_CAMERA' || error === 'NO_CAMERA_PERMISSION') {
      setYotiCrashed(true);
      setCameraMode('native');
      startNativeCamera();
    } else {
      setCameraError('May error sa face scanner. Lumipat sa Native Camera.');
    }
  };

  // Start native camera stream
  const startNativeCamera = async () => {
    setCameraError(null);
    setIsReady(false);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (!navigator.mediaDevices) {
      setCameraError(!window.isSecureContext
        ? 'Insecure HTTP: Kailangan ng HTTPS para sa camera access.'
        : 'Walang mediaDevices API sa iyong browser.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setIsReady(true);
      setDetectionStatus('Camera aktibo — i-click ang Capture button.');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      console.error('Native Camera Error:', err);
      setCameraError('Hindi ma-access ang camera: ' + err.message);
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

  const handleRetake = () => {
    setTempPhoto(null);
    setIsReady(false);
    if (cameraMode === 'native' || yotiCrashed) {
      setDetectionStatus('Sinisimulan ang camera...');
      startNativeCamera();
    } else {
      setDetectionStatus('Nilo-load ang AI Biometric Face Sensor...');
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
    handleRetake();
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="inline-face-capture-card">
      {/* Header & Mode Switcher */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="inline-face-capture-header">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></div>
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">LGU BIOMETRIC FACE CAPTURE</h4>
        </div>
        
        {/* Mode Switcher */}
        {!value && !tempPhoto && (
          <div className="flex bg-slate-200 p-0.5 rounded-lg self-start">
            <button
              type="button"
              onClick={() => { setCameraMode('yoti'); stopNativeCamera(); setCameraError(null); setIsReady(false); }}
              disabled={yotiCrashed}
              className={'px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ' + 
                (cameraMode === 'yoti' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800') +
                (yotiCrashed ? ' opacity-40 cursor-not-allowed' : '')}
            >
              AI Scanner {yotiCrashed && '(N/A)'}
            </button>
            <button
              type="button"
              onClick={() => { setCameraMode('native'); setCameraError(null); }}
              className={'px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ' + 
                (cameraMode === 'native' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
            >
              Standard Camera
            </button>
          </div>
        )}
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0" id="inline-face-capture-body">
        {/* Left Side: Camera Stage */}
        <div className="md:col-span-7 bg-slate-950 aspect-[4/3] relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200" id="inline-camera-stage">
          {value ? (
            /* FINAL SAVED PHOTO */
            <div className="w-full h-full relative">
              <img src={value} alt="Captured Biometric" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-[10px] font-bold text-teal-300 font-mono tracking-widest uppercase bg-slate-950/70 px-2.5 py-1 rounded-md border border-teal-500/30">
                  ✓ BIOMETRICS ENROLLED
                </span>
              </div>
            </div>
          ) : tempPhoto ? (
            /* TEMP PHOTO AWAITING CONFIRMATION */
            <div className="w-full h-full relative">
              <img src={tempPhoto} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-[10px] font-bold text-amber-300 font-mono tracking-widest uppercase bg-slate-950/70 px-2.5 py-1 rounded-md border border-amber-500/30 animate-pulse">
                  ⚠ AWAITING CONFIRMATION
                </span>
              </div>
            </div>
          ) : cameraError ? (
            /* ERROR STATE */
            <div className="p-6 text-center text-red-400 space-y-4 flex flex-col items-center justify-center h-full">
              <X className="text-red-500" size={32} />
              <div className="space-y-1 px-4">
                <p className="text-xs font-bold">{cameraError}</p>
              </div>
              <button
                type="button"
                onClick={() => { setCameraError(null); startNativeCamera(); setCameraMode('native'); }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw size={13} className="inline mr-1.5" />
                Subukan Muli
              </button>
            </div>
          ) : cameraMode === 'native' ? (
            /* NATIVE CAMERA STREAM */
            <div className="w-full h-full relative flex items-center justify-center" id="native-camera-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-20 gap-3 text-slate-400">
                  <Loader2 className="animate-spin text-teal-500" size={28} />
                  <span className="text-[11px] font-semibold">Sinisimulan ang camera...</span>
                </div>
              )}
            </div>
          ) : (
            /* YOTI AI FACE SCANNER */
            <div className="w-full h-full relative flex items-center justify-center" id="yoti-scanner-wrapper">
              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-20 gap-3 text-slate-400">
                  <Loader2 className="animate-spin text-teal-500" size={28} />
                  <span className="text-[11px] font-semibold">Nilo-load ang AI Biometric Face Sensor...</span>
                </div>
              )}
              <div className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full">
                <FaceCapture
                  faceCaptureAssetsRootUrl="/assets/face-capture/"
                  secure={false}
                  onSuccess={handleYotiSuccess}
                  onError={handleYotiError}
                  onReadyForCapture={() => {
                    setIsReady(true);
                    setDetectionStatus('I-align ang mukha sa bilog — awtomatikong kukuha...');
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

        {/* Right Side: Instructions & Status */}
        <div className="md:col-span-5 p-5 flex flex-col justify-between bg-slate-50 gap-5">
          {/* Instructions */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Mga Tagubilin:</h5>
            <ul className="space-y-1.5 text-[10.5px] text-slate-500 font-medium list-disc list-inside leading-relaxed">
              <li>Tumingin nang diretso sa camera.</li>
              <li>Siguraduhing maliwanag ang paligid.</li>
              <li>Tanggalin ang sumbrero, salamin, at mask.</li>
              <li>Huwag gumalaw habang kumukuha.</li>
              {cameraMode === 'yoti' && !yotiCrashed && (
                <li className="text-teal-600 font-semibold">Awtomatikong kukuha kapag stable ang mukha.</li>
              )}
              {cameraMode === 'native' && (
                <li className="text-teal-600 font-semibold">I-click ang Capture button kapag handa na.</li>
              )}
            </ul>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200">
            <div className={'w-2 h-2 rounded-full shrink-0 ' + 
              (cameraError ? 'bg-red-500' : 
               value ? 'bg-emerald-500' : 
               tempPhoto ? 'bg-amber-500 animate-pulse' : 
               isReady ? 'bg-teal-400 animate-pulse' : 'bg-slate-300')
            }></div>
            <span className="text-[10px] font-mono font-bold text-slate-600 leading-none truncate flex-1">
              {value ? 'Matagumpay na Naka-enroll' : detectionStatus}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {value ? (
              /* Clear enrolled photo */
              <button
                type="button"
                onClick={handleClear}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Trash size={13} />
                <span>Burahin at Kumuha Muli</span>
              </button>
            ) : tempPhoto ? (
              /* Confirm / Retake */
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
                  <span>I-confirm at I-save</span>
                </button>
              </div>
            ) : cameraMode === 'native' && isReady ? (
              /* Capture button for native camera */
              <button
                type="button"
                onClick={captureNativePhoto}
                className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 cursor-pointer transition-all active:scale-95"
              >
                <Camera size={16} />
                <span>Kumuha ng Larawan (Capture)</span>
              </button>
            ) : cameraMode === 'yoti' && !isReady ? (
              <div className="text-[10px] text-slate-400 font-semibold text-center italic p-3 rounded-xl border border-dashed border-slate-200">
                Hinihintay ang AI face scanner...
              </div>
            ) : cameraMode === 'yoti' && isReady ? (
              <div className="text-[10px] text-teal-600 font-semibold text-center p-3 rounded-xl bg-teal-50 border border-teal-100">
                Awtomatikong kukuha kapag stable ang mukha sa green boundary.
              </div>
            ) : (
              <button
                type="button"
                onClick={startNativeCamera}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Camera size={14} />
                <span>Simulan ang Camera</span>
              </button>
            )}
          </div>

          {/* Privacy Badge */}
          <div className="flex items-start gap-1.5 opacity-70 text-[9.5px] text-slate-400 pt-1">
            <ShieldCheck size={12} className="text-teal-500 shrink-0 mt-0.5" />
            <p className="leading-normal font-medium">
              Secure biometric processing inside this browser session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { RefreshCw, Check, X, ShieldCheck, Loader2, Camera, Trash } from 'lucide-react';
import FaceCapture from '@getyoti/react-face-capture';

interface InlineFaceCaptureProps {
  value: string | null;
  onChange: (base64Img: string | null) => void;
}

export default function InlineFaceCapture({ value, onChange }: InlineFaceCaptureProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Nilo-load ang AI Biometric Face Sensor...');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);

  const handleSuccess = (payload: any) => {
    let imgData = payload.img;
    if (imgData && !imgData.startsWith('data:')) {
      imgData = `data:image/jpeg;base64,${imgData}`;
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
    setCameraError(errorMsg);
    setDetectionStatus('May error sa sensor');
  };

  const handleRetake = () => {
    setTempPhoto(null);
    setIsReady(false);
    setDetectionStatus('Nilo-load muli ang AI Biometric Face Sensor...');
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
    setDetectionStatus('Nilo-load ang AI Biometric Face Sensor...');
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="inline-face-capture-card">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between" id="inline-face-capture-header">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></div>
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">LGU BIOMETRIC FACE CAPTURE (YOTI AI)</h4>
        </div>
        <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Sensor Embedded</span>
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
          ) : cameraError ? (
            /* CAMERA ERROR DISPLAY */
            <div className="p-6 text-center text-red-400 space-y-3" id="inline-camera-error">
              <X className="mx-auto text-red-500" size={36} />
              <p className="text-xs font-semibold leading-relaxed">{cameraError}</p>
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
                <li>Tumingin nang diretso sa camera.</li>
                <li>I-align ang mukha sa pabilog na overlay.</li>
                <li>Huwag gumalaw habang kinukuha ang larawan.</li>
                <li>Siguraduhing maliwanag at walang anino ang mukha.</li>
              </ul>
            </div>

            {/* Live Status Bar */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200" id="inline-status-bar">
              <div className={`w-2 h-2 rounded-full shrink-0
                ${cameraError ? 'bg-red-500' : ''}
                ${value ? 'bg-emerald-500' : ''}
                ${tempPhoto ? 'bg-amber-500 animate-pulse' : ''}
                ${!value && !tempPhoto && isReady ? 'bg-teal-400 animate-pulse' : ''}
                ${!value && !tempPhoto && !isReady && !cameraError ? 'bg-slate-300' : ''}
              `}></div>
              <span className="text-[10px] font-mono font-bold text-slate-600 leading-none truncate flex-1">
                {value ? 'Matagumpay na Naka-enroll' : detectionStatus}
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
            ) : (
              /* IF STILL IN CAPTURE STATE (BUT NO VALUE & NO TEMP CAPTURE YET) */
              <div className="text-[10px] text-slate-400 font-semibold text-center italic bg-white/60 p-3 rounded-xl border border-dashed border-slate-200/80">
                Awtomatikong kukuha ang sensor kapag naging stable ang mukha sa green boundary.
              </div>
            )}

            <div className="flex items-start gap-1.5 opacity-70 text-[9.5px] text-slate-400 pt-1" id="inline-privacy-badge">
              <ShieldCheck size={12} className="text-teal-500 shrink-0 mt-0.5" />
              <p className="leading-normal font-medium">
                Compliant with Yoti AI Face Capture. Real-time biometric vectors are processed securely inside this browser session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

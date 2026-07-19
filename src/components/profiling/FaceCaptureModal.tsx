import React, { useState } from 'react';
import { RefreshCw, Check, X, ShieldCheck, Loader2 } from 'lucide-react';
import FaceCapture from '@getyoti/react-face-capture';

interface FaceCaptureModalProps {
  onCapture: (base64Img: string) => void;
  onClose: () => void;
}

export default function FaceCaptureModal({ onCapture, onClose }: FaceCaptureModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Nilo-load ang AI Biometric Face Sensor...');

  const handleSuccess = (payload: any) => {
    // payload.img contains the base64-encoded string
    let imgData = payload.img;
    if (imgData && !imgData.startsWith('data:')) {
      imgData = `data:image/jpeg;base64,${imgData}`;
    }
    setCapturedPhoto(imgData);
    setDetectionStatus('Larawan ay matagumpay na nakuha!');
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
    setCapturedPhoto(null);
    setIsReady(false);
    setDetectionStatus('Nilo-load muli ang AI Biometric Face Sensor...');
  };

  const handleSave = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-fadeIn" id="face-capture-modal-container">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl" id="face-capture-modal-card">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between" id="face-capture-modal-header">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></div>
            <h3 className="font-bold text-sm text-slate-200 tracking-wide">LGU BIOMETRIC FACE CAPTURE (YOTI AI)</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            id="close-face-capture-modal-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Camera Stage */}
        <div className="relative bg-black aspect-[4/3] w-full flex items-center justify-center overflow-hidden border-b border-slate-800" id="face-capture-camera-stage">
          {cameraError ? (
            <div className="p-6 text-center text-red-400 space-y-3" id="camera-error-display">
              <X className="mx-auto" size={40} />
              <p className="text-xs font-semibold leading-relaxed">{cameraError}</p>
            </div>
          ) : capturedPhoto ? (
            /* PHOTO PREVIEW STAGE text-align center, contain or cover scale */
            <img 
              referrerPolicy="no-referrer"
              src={capturedPhoto} 
              alt="Captured Profile" 
              className="w-full h-full object-cover"
              id="captured-photo-preview"
            />
          ) : (
            /* YOTI REAL-TIME CAMERA STAGE */
            <div className="w-full h-full relative flex items-center justify-center" id="yoti-camera-wrapper">
              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 gap-3 text-slate-400" id="camera-loading-spinner">
                  <Loader2 className="animate-spin text-teal-500" size={32} />
                  <span className="text-xs font-semibold">Nilo-load ang Face Detection...</span>
                </div>
              )}
              <div className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" id="yoti-component-container">
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

        {/* Control Desk */}
        <div className="p-5 bg-slate-950 flex flex-col gap-4" id="face-capture-control-desk">
          
          {/* Status logs */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800/80" id="face-capture-status-bar">
            <div className={`w-2 h-2 rounded-full shrink-0
              ${cameraError ? 'bg-red-500' : ''}
              ${capturedPhoto ? 'bg-emerald-500' : ''}
              ${!capturedPhoto && isReady ? 'bg-teal-400 animate-pulse' : 'bg-amber-400 animate-pulse'}
            `}></div>
            <span className="text-[11px] font-mono font-medium text-slate-300 leading-none truncate">
              {detectionStatus}
            </span>
          </div>

          {/* Action Buttons row */}
          <div className="flex items-center justify-end gap-3.5" id="face-capture-action-row">
            {capturedPhoto ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                  id="yoti-retake-btn"
                >
                  <RefreshCw size={13} />
                  <span>Kuhang Muli (Retake)</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-teal-600/20 transition-all active:scale-95"
                  id="yoti-save-btn"
                >
                  <Check size={13} />
                  <span>Gamitin ang Larawan</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-400 hover:text-white transition-all"
                id="yoti-cancel-btn"
              >
                Bumalik
              </button>
            )}
          </div>

          <div className="flex items-start gap-1.5 opacity-60 text-slate-400 text-[10px]" id="yoti-privacy-badge">
            <ShieldCheck size={12} className="text-teal-500 mt-0.5" />
            <p className="leading-normal">
              Government-grade compliance: Integrated with Yoti AI Face Capture. No face vectors leave this client-sandbox.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

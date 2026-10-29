import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, RefreshCw, Trash, X } from 'lucide-react';

interface InlineFaceCaptureProps {
  value: string | null;
  onChange: (base64Img: string | null) => void;
}

export default function InlineFaceCapture({ value, onChange }: InlineFaceCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState('Click "Start Camera" to begin.');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, [stream]);

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCameraActive(false);
  };

  const startCamera = async () => {
    setStatus('Starting camera...');
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus(!window.isSecureContext ? 'HTTPS required for camera access.' : 'No camera API available in this browser.');
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
      setStream(mediaStream);
      setCameraActive(true);
      setStatus('Camera active — center the senior and capture.');
    } catch (error) {
      setStatus(`Cannot access camera: ${error instanceof Error ? error.message : 'permission denied'}`);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext('2d');
    if (!context) {
      setStatus('Unable to capture a photo. Please try again.');
      return;
    }
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setTempPhoto(canvas.toDataURL('image/jpeg', 0.92));
    stopCamera();
    setStatus('Photo captured. Confirm to save it.');
  };

  const clearPhoto = () => {
    onChange(null);
    setTempPhoto(null);
    stopCamera();
    setStatus('Click "Start Camera" to begin.');
  };

  const preview = value || tempPhoto;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <Camera size={15} className="text-teal-600" />
        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Senior Photo Capture</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-7 bg-slate-950 aspect-[4/3] relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-slate-200">
          {preview ? <img src={preview} alt="Senior photo preview" className="w-full h-full object-contain" /> : cameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
          ) : <div className="text-center text-slate-400"><Camera size={36} className="mx-auto mb-2 text-slate-500" /><p className="text-sm">No photo captured</p></div>}
        </div>
        <div className="md:col-span-5 p-5 flex flex-col justify-between bg-slate-50 gap-5">
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Photo instructions</h5>
            <ul className="space-y-1.5 text-[10.5px] text-slate-500 font-medium list-disc list-inside leading-relaxed">
              <li>Center the senior in the frame.</li>
              <li>Use good lighting and a plain background.</li>
              <li>Hold the camera steady while capturing.</li>
            </ul>
          </div>
          <div role="status" aria-live="polite" className="text-[10px] font-medium text-slate-600 p-3 rounded-xl bg-white border border-slate-200">{value ? 'Photo saved' : status}</div>
          <div className="space-y-2.5">
            {value ? <button type="button" onClick={clearPhoto} className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><Trash size={13} />Remove photo</button>
              : tempPhoto ? <div className="flex gap-2">
                <button type="button" onClick={() => { setTempPhoto(null); void startCamera(); }} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><RefreshCw size={12} />Retake</button>
                <button type="button" onClick={() => { onChange(tempPhoto); setTempPhoto(null); setStatus('Photo saved.'); }} className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><Check size={13} />Confirm</button>
              </div> : cameraActive ? <div className="flex gap-2">
                <button type="button" onClick={() => { stopCamera(); setStatus('Click "Start Camera" to begin.'); }} aria-label="Stop camera" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl"><X size={13} /></button>
                <button type="button" onClick={capturePhoto} className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Camera size={16} />Capture</button>
              </div> : <button type="button" onClick={() => void startCamera()} className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Camera size={16} />Start Camera</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

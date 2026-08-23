import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, Undo, PenTool, X } from 'lucide-react';

interface SignaturePadProps {
  value: string | null;
  onChange: (base64Data: string | null) => void;
  /** Unique field ID for signature pad routing */
  fieldId?: string;
  /** Whether to show the "Create a Signature" button (default: true) */
  showUsbButton?: boolean;
}

/** Auto-crop a canvas to the bounding box of non-transparent pixels, centered on a new canvas */
function autoCropSignature(sourceCanvas: HTMLCanvasElement): string | null {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return null;

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  let minX = w, minY = h, maxX = 0, maxY = 0;
  let hasPixels = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 10) {
        hasPixels = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasPixels) return null;

  // Add padding around the cropped signature
  const padding = 20;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(w - 1, maxX + padding);
  maxY = Math.min(h - 1, maxY + padding);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  // Create output canvas — use larger size to preserve stroke thickness
  const outputW = 1200;
  const outputH = 500;
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = outputW;
  outputCanvas.height = outputH;
  const outCtx = outputCanvas.getContext('2d')!;

  // Scale to fit while maintaining aspect ratio — use minimum scale of 0.8 to keep strokes thick
  const scale = Math.min(outputW / cropW, outputH / cropH, 2.0);
  const drawW = cropW * scale;
  const drawH = cropH * scale;
  const offsetX = (outputW - drawW) / 2;
  const offsetY = (outputH - drawH) / 2;

  // Use high quality image smoothing
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(sourceCanvas, minX, minY, cropW, cropH, offsetX, offsetY, drawW, drawH);

  return outputCanvas.toDataURL('image/png');
}

export default function SignaturePad({ value, onChange, fieldId, showUsbButton = true }: SignaturePadProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="w-full border rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4 transition-all duration-200 border-slate-200">

      {/* Header Panel */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <PenTool size={16} className="text-teal-600" />
          <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">E-Lagda Digital Signature</span>
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex items-center gap-1 text-[11px] font-semibold transition-all"
            title="Clear signature"
          >
            <Eraser size={14} />
            <span>Burahin</span>
          </button>
        )}
      </div>

      {/* Signature Preview / Placeholder */}
      <div
        className="relative border rounded-xl shadow-inner min-h-[160px] flex items-center justify-center"
        style={{ width: '100%', backgroundColor: '#C5C7CA' }}
      >
        {value ? (
          <img
            src={value}
            alt="Signature preview"
            className="max-w-full max-h-[150px] object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 pointer-events-none select-none">
            <PenTool size={28} className="text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Walang signature
            </span>
          </div>
        )}
      </div>

      {/* Create Signature Button */}
      {showUsbButton && (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md cursor-pointer"
        >
          <PenTool size={16} />
          <span>{value ? 'Baguhin ang Signature' : 'Gumawa ng Signature'}</span>
        </button>
      )}

      {/* Status Indicator */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
          <div className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
          <span>
            {value ? 'Signature Captured' : 'Waiting for digital signature input.'}
          </span>
        </div>
        {value && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <Check size={12} className="stroke-[3]" />
            <span>Ok</span>
          </div>
        )}
      </div>

      {/* Fullscreen Signature Modal */}
      {showModal && (
        <SignatureModal
          onComplete={(dataUrl) => {
            onChange(dataUrl);
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ===================== FULLSCREEN SIGNATURE MODAL =====================

interface SignatureModalProps {
  onComplete: (dataUrl: string | null) => void;
  onCancel: () => void;
}

function SignatureModal({ onComplete, onCancel }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Initialize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rafId = requestAnimationFrame(() => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width) || 800;
      const h = Math.round(rect.height) || 500;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000000';
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);

    // Sync canvas resolution with display size
    const rect = canvas.getBoundingClientRect();
    const roundedW = Math.round(rect.width) || 800;
    const roundedH = Math.round(rect.height) || 500;
    if (canvas.width !== roundedW || canvas.height !== roundedH) {
      const tempImgData = canvas.toDataURL();
      canvas.width = roundedW;
      canvas.height = roundedH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000000';
        if (hasDrawn) {
          const img = new Image();
          img.onload = () => { ctx.drawImage(img, 0, 0); };
          img.src = tempImgData;
        }
      }
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      setHistory((prev) => [...prev, canvas.toDataURL()]);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000000';
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const coords = getCoordinates(e);
    if (!canvas || !coords) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      let strokeWidth = 5;
      if (e.pointerType === 'pen' && e.pressure > 0) {
        strokeWidth = 3 + e.pressure * 5;
      }
      ctx.lineWidth = strokeWidth;
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        setHistory([]);
      }
    }
  };

  const undoLast = () => {
    const canvas = canvasRef.current;
    if (canvas && history.length > 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const prevStates = [...history];
        const lastState = prevStates.pop();
        setHistory(prevStates);
        if (lastState) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = lastState;
        }
      }
    } else if (history.length === 0) {
      clearCanvas();
    }
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      onComplete(null);
      return;
    }
    // Auto-crop and center the signature
    const croppedDataUrl = autoCropSignature(canvas);
    onComplete(croppedDataUrl);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/95 backdrop-blur-sm animate-fadeIn">
      {/* Modal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <PenTool size={20} className="text-teal-400" />
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wide">Gumawa ng Signature</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Toolbar inline in header */}
          <button
            type="button"
            onClick={undoLast}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-all border border-slate-700"
          >
            <Undo size={14} />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/50 transition-all border border-slate-700"
          >
            <Eraser size={14} />
            <span>Burahin</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all ml-2"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Canvas — fills entire remaining space */}
      <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: '#C5C7CA' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
          className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
        />

        {/* Guide line */}
        {!hasDrawn && (
          <div className="absolute inset-x-12 bottom-12 border-t-2 border-dashed border-slate-400/50 pointer-events-none flex justify-center">
            <span className="text-xs text-slate-500 font-semibold px-3 -mt-2.5 uppercase tracking-widest select-none" style={{ backgroundColor: '#C5C7CA' }}>
              Lagdaan dito
            </span>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-t border-slate-700 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          {hasDrawn && (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              May signature na
            </span>
          )}
          <button
            type="button"
            onClick={handleComplete}
            disabled={!hasDrawn}
            className="px-8 py-2.5 rounded-xl text-sm font-bold bg-teal-600 text-white hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-900/30 transition-all flex items-center gap-2"
          >
            <Check size={16} className="stroke-[3]" />
            <span>Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

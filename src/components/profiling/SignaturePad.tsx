import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, Undo, Heart, Info } from 'lucide-react';

interface SignaturePadProps {
  value: string | null;
  onChange: (base64Data: string | null) => void;
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Configure Canvas line drawing styles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 500;
      canvas.height = rect.height || 160;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#020617'; // Slate-950 dark blue pen
      }
    }
  }, []);

  // Sync canvas with existing value if loaded in editing mode
  useEffect(() => {
    if (value && canvasRef.current && !hasDrawn) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasDrawn(true);
        };
        img.src = value;
      }
    }
  }, [value, hasDrawn]);

  // --- DRAWING EVENT HANDLERS ---

  // Capture coordinates via PointerEvent
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale ratios to map client coords to actual canvas pixel grid
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

    // Check if display size has changed or if attributes are uninitialized
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      // Store existing content if any
      const tempImgData = canvas.toDataURL();
      
      canvas.width = rect.width || 500;
      canvas.height = rect.height || 160;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#020617';
        
        // Restore existing content if we had drawn before
        if (hasDrawn) {
          const img = new Image();
          img.referrerPolicy = 'no-referrer';
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = tempImgData;
        }
      }
    }

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Push history before drawing starts (for undo support)
      setHistory((prev) => [...prev, canvas.toDataURL()]);

      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);

      // Re-apply styling defaults
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#020617';
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
      // XP-Pen tablet pen pressure support
      // e.pressure is a float between 0.0 and 1.0. For normal mouse it is 0.5 or 0.
      // If we have a pen stylus, we scale the line width between 1.5px and 5.0px.
      let strokeWidth = 2.5;
      if (e.pointerType === 'pen' && e.pressure > 0) {
        strokeWidth = 1.5 + e.pressure * 3.5;
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
      saveSignature();
    }
  };

  // Convert canvas to image and trigger callbacks
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
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
        onChange(null);
      }
    }
  };

  const undoLast = () => {
    const canvas = canvasRef.current;
    if (canvas && history.length > 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const prevStates = [...history];
        const lastState = prevStates.pop(); // grab last state
        setHistory(prevStates);

        if (lastState) {
          const img = new Image();
          img.referrerPolicy = 'no-referrer';
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            saveSignature();
          };
          img.src = lastState;
        }
      }
    } else if (history.length === 0) {
      clearCanvas();
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Undo size={16} className="text-teal-600" />
          <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">E-Lagda Signature Drawing Pad</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undoLast}
            disabled={history.length === 0}
            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 hover:bg-slate-150 rounded transition-all"
            title="Undo stroke"
          >
            <Undo size={14} />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded flex items-center gap-1 text-[11px] font-semibold transition-all"
            title="Clear canvas"
          >
            <Eraser size={14} />
            <span>Burahin</span>
          </button>
        </div>
      </div>

      {/* Signature Canvas Stage */}
      <div className="relative bg-white border border-slate-200 rounded-xl shadow-inner min-h-[160px] flex flex-col items-center justify-center">
        
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
          className="w-full h-40 rounded-xl cursor-crosshair touch-none"
          style={{ width: '100%', height: '160px' }}
        />

        {/* Floating Alignment Guideline */}
        {!hasDrawn && (
          <div className="absolute inset-x-8 bottom-10 border-t border-dashed border-slate-200 pointer-events-none flex justify-center">
            <span className="text-[10px] text-slate-300 font-medium px-2 bg-white -mt-2 uppercase tracking-widest select-none">
              Lumagda sa ibabaw ng linyang ito (Sign here)
            </span>
          </div>
        )}
      </div>

      {/* Saved Indicator */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
          <div className={`w-1.5 h-1.5 rounded-full ${hasDrawn ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
          <span>
            {hasDrawn ? 'Lagda naitala (Signature Captured)' : 'Waiting for digital signature input.'}
          </span>
        </div>
        
        {hasDrawn && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <Check size={12} className="stroke-[3]" />
            <span>Ok</span>
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, Undo, Usb, Radio, Loader2 } from 'lucide-react';
import { useUsbSignaturePad } from '../../contexts/UsbSignaturePadContext';

interface SignaturePadProps {
  value: string | null;
  onChange: (base64Data: string | null) => void;
  /** Unique field ID for USB signature pad routing */
  fieldId?: string;
  /** Whether to show the USB activate button (default: true) */
  showUsbButton?: boolean;
}

export default function SignaturePad({ value, onChange, fieldId, showUsbButton = true }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // USB Signature Pad context
  const usbPad = useUsbSignaturePad();
  const resolvedFieldId = fieldId || `sig-${Math.random().toString(36).slice(2, 9)}`;
  const isActive = usbPad.activeFieldId === resolvedFieldId;

  // Register callback so context can deliver signature data to this field
  useEffect(() => {
    if (!showUsbButton) return;

    usbPad.registerFieldCallback(resolvedFieldId, (dataUrl: string) => {
      // Load the signature onto our canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.referrerPolicy = 'no-referrer';
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setHasDrawn(true);
          };
          img.src = dataUrl;
        }
      }
      onChange(dataUrl);
    });

    return () => {
      usbPad.unregisterFieldCallback(resolvedFieldId);
    };
  }, [resolvedFieldId, showUsbButton, onChange]);

  // Handle activate button click
  const handleActivateUsb = async () => {
    if (isActive) {
      // Deactivate this field
      usbPad.deactivateField();
      return;
    }

    // If not connected yet, connect first
    if (!usbPad.isConnected) {
      await usbPad.connectDevice();
    }

    // Activate this field as the receiver
    usbPad.activateField(resolvedFieldId);
  };

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
        ctx.strokeStyle = '#000000';
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

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      const tempImgData = canvas.toDataURL();

      canvas.width = rect.width || 500;
      canvas.height = rect.height || 160;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';

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
      setHistory((prev) => [...prev, canvas.toDataURL()]);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
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
        const lastState = prevStates.pop();
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
    <div className={`w-full border rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4 transition-all duration-200 ${
      isActive ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md' : 'border-slate-200'
    }`}>

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

      {/* USB Signature Pad Activation Button */}
      {showUsbButton && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleActivateUsb}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-300'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            {isActive ? (
              <>
                <Radio size={14} className="animate-pulse" />
                <span>USB Pad Active — Listening</span>
              </>
            ) : (
              <>
                <Usb size={14} />
                <span>Activate USB Signature Pad</span>
              </>
            )}
          </button>

          {/* Connection status indicator */}
          {isActive && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-600">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <span>{usbPad.isCapturing ? 'Receiving...' : 'Waiting for input'}</span>
            </div>
          )}
          {!isActive && usbPad.activeFieldId && (
            <span className="text-[11px] text-slate-400 font-medium">Another field is active</span>
          )}
        </div>
      )}

      {/* Error display */}
      {isActive && usbPad.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-medium">
          {usbPad.error}
        </div>
      )}

      {/* Signature Canvas Stage */}
      <div className={`relative bg-white border rounded-xl shadow-inner min-h-[160px] flex flex-col items-center justify-center ${
        isActive ? 'border-indigo-200' : 'border-slate-200'
      }`} style={{ width: '100%' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
          className="w-full h-44 rounded-xl cursor-crosshair touch-none"
          style={{ width: '100%', height: '176px' }}
        />

        {/* Floating Alignment Guideline */}
        {!hasDrawn && (
          <div className="absolute inset-x-8 bottom-10 border-t border-dashed border-slate-200 pointer-events-none flex justify-center">
            <span className="text-[10px] text-slate-300 font-medium px-2 bg-white -mt-2 uppercase tracking-widest select-none">
              Sign above this line
            </span>
          </div>
        )}

        {/* Active overlay indicator */}
        {isActive && !hasDrawn && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            <Radio size={10} className="animate-pulse" />
            USB PAD ACTIVE
          </div>
        )}
      </div>

      {/* Saved Indicator */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
          <div className={`w-1.5 h-1.5 rounded-full ${hasDrawn ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
          <span>
            {hasDrawn ? 'Signature Captured' : 'Waiting for digital signature input.'}
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

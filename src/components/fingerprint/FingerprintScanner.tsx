import { useCallback, useEffect, useRef, useState } from 'react';
import { Fingerprint, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cancelCapture, captureFingerprint, checkScanner, FingerprintError } from '../../services/fingerprintService';

type ScanState = 'checking' | 'disconnected' | 'ready' | 'waiting' | 'scanning' | 'captured' | 'poor_quality' | 'error';

export default function FingerprintScanner() {
  const [state, setState] = useState<ScanState>('checking');
  const [message, setMessage] = useState('Checking scanner...');
  const [quality, setQuality] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef<ScanState>('checking');
  stateRef.current = state;

  const refresh = useCallback(async () => {
    if (abortRef.current) return;
    try {
      const status = await checkScanner();
      setState(status.connected ? 'ready' : 'disconnected');
      setMessage(status.connected ? `${status.device} connected` : status.error || 'Scanner Disconnected');
    } catch (error) {
      setState('disconnected');
      setMessage(error instanceof Error ? error.message : 'Scanner Disconnected');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (!abortRef.current && (stateRef.current === 'ready' || stateRef.current === 'disconnected')) void refresh();
    }, 5000);
    return () => {
      window.clearInterval(timer);
      if (abortRef.current) {
        abortRef.current.abort();
        void cancelCapture().catch(() => undefined);
      }
    };
  }, [refresh]);

  const scan = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setQuality(null);
    setState('waiting');
    setMessage('Waiting for Fingerprint — place your finger on the scanner.');
    try {
      setState('scanning');
      const result = await captureFingerprint(controller.signal);
      setQuality(result.qualityLabel);
      setState('captured');
      setMessage(result.qualityLabel === 'Not reported'
        ? 'Fingerprint Captured — quality not reported by the reader.'
        : `Fingerprint Captured — ${result.qualityLabel} quality.`);
    } catch (error) {
      const scannerError = error instanceof FingerprintError ? error : new FingerprintError('Scanner Error', 'scanner_error');
      if (scannerError.code === 'cancelled') {
        setState('ready');
        setMessage('Scan cancelled.');
      } else {
        setState(scannerError.code === 'poor_quality' ? 'poor_quality' : scannerError.code === 'disconnected' || scannerError.code === 'agent_unavailable' || scannerError.code === 'sdk_unavailable' ? 'disconnected' : 'error');
        setMessage(scannerError.message);
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    void cancelCapture().catch(() => undefined);
  };

  const scanning = state === 'waiting' || state === 'scanning';
  const connected = state !== 'checking' && state !== 'disconnected';

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col items-center gap-4 text-center">
      <h3 className="font-bold text-sm text-slate-800">U.are.U 4500 Fingerprint Scanner</h3>
      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${state === 'captured' ? 'bg-emerald-100 text-emerald-700' : scanning ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
        <Fingerprint size={38} />
      </div>
      <p role="status" aria-live="polite" className="text-xs text-slate-700">{message}</p>
      <div className={`flex items-center gap-2 text-xs ${connected ? 'text-emerald-700' : 'text-red-600'}`}>
        {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
        {connected ? 'Scanner Connected' : 'Scanner Disconnected'}
      </div>
      {quality !== null && <p className="text-xs text-emerald-700">Capture quality: {quality}</p>}
      <div className="flex gap-2">
        {scanning ? (
          <button type="button" onClick={stop} className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-bold">Cancel Scan</button>
        ) : (
          <button type="button" disabled={!connected} onClick={() => void scan()} className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold disabled:opacity-40">{state === 'captured' ? 'Scan Again' : 'Start Scan'}</button>
        )}
        <button type="button" disabled={scanning} onClick={() => void refresh()} aria-label="Check scanner again" className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40"><RefreshCw size={14} /></button>
      </div>
      <p className="text-[10px] text-slate-500">Capture test only. No fingerprint image or template is uploaded or saved.</p>
      {state === 'disconnected' && (
        <a href="https://digitalpersona.hidglobal.com/lite-client/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-teal-700 underline">
          Install HID Authentication Device Client
        </a>
      )}
    </div>
  );
}

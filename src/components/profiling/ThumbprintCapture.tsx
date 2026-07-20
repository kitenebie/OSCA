import React, { useState } from 'react';
import { Fingerprint, Check, AlertCircle, RefreshCw, Cpu, Info, ShieldCheck, Compass } from 'lucide-react';

interface ThumbprintCaptureProps {
  value: string | null;
  onChange: (base64OrId: string | null) => void;
}

type ScanMode = 'webauthn' | 'localsdk' | 'simulator';

export default function ThumbprintCapture({ value, onChange }: ThumbprintCaptureProps) {
  const [scanMode, setScanMode] = useState<ScanMode>('webauthn');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('Ready for scanning.');

  // Triggers Windows Hello/USB native fingerprint scanner via WebAuthn API
  const startWebAuthnScan = async () => {
    setIsScanning(true);
    setScanProgress(20);
    setScanStatus('Inilulunsad ang Windows Hello / USB Biometric login...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setScanProgress(50);
      
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: { name: "OSCA Juban Biometrics" },
          user: {
            id: userId,
            name: "senior@osca.juban.gov",
            displayName: "Registered Senior Citizen"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Invokes Windows Hello biometric hardware
            userVerification: "required"
          },
          timeout: 30000
        }
      });

      setScanProgress(100);
      setIsScanning(false);

      if (credential) {
        setScanStatus('Matagumpay na nai-scan ang biometrics mula sa USB device!');
        onChange('Biometric Locked (WebAuthn Credential ID: ' + credential.id + ')');
      } else {
        throw new Error('Walang credential na naibalik.');
      }
    } catch (err: any) {
      console.error(err);
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('Failed or Cancelled: ' + (err.message || 'Kanselado ang pag-verify.'));
    }
  };

  // Triggers loopback connection to localhost SDK WebAPI for SecuGen / DigitalPersona
  const startLocalSdkScan = async () => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStatus('Kumokonekta sa local desktop USB scanner service (localhost:8000)...');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setScanProgress(40);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      // Attempting to query common manufacturer local desktop web API endpoints
      const res = await fetch('http://localhost:8000/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      setScanProgress(90);
      if (res.ok) {
        const data = await res.json();
        setScanProgress(100);
        setIsScanning(false);
        setScanStatus('Fingerprint data captured successfully from local USB Device!');
        onChange(data.template || 'Captured Biometrics (Local SDK ID: ' + (data.id || 'FP-81765') + ')');
      } else {
        throw new Error('Returned error response');
      }
    } catch (err: any) {
      console.warn('Local Web SDK service not found on port 8000:', err);
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('Hindi mahanap ang scanner software sa localhost. Paki-run ang SecuGen/DigitalPersona local agent o gamitin ang Simulator.');
    }
  };

  // Simulated capture logic (fallback/test mode)
  const triggerSimulatorScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatus('I-dikit ang hinlalaki ng senior sa scanner glass...');

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    await new Promise((resolve) => setTimeout(resolve, 2200));
    clearInterval(interval);
    
    setIsScanning(false);
    setScanStatus('Biometric fingerprint template extracted successfully (Simulated)!');
    onChange('Captured Biometrics (Template ANSI-378 ID: FP-' + Math.floor(Math.random() * 900000 + 100000) + ')');
  };

  const startScan = () => {
    if (scanMode === 'webauthn') startWebAuthnScan();
    else if (scanMode === 'localsdk') startLocalSdkScan();
    else triggerSimulatorScan();
  };

  const resetCapture = () => {
    onChange(null);
    setScanProgress(0);
    setScanStatus('Ready for scanning.');
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-4">
      
      {/* Header & Source Mode Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-teal-600" />
          <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">Biometric Fingerprint Hardware Control</span>
        </div>
        
        {/* Connection/Source select buttons */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start">
          <button
            type="button"
            onClick={() => { setScanMode('webauthn'); resetCapture(); }}
            className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (scanMode === 'webauthn' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
          >
            Windows Hello / USB
          </button>
          <button
            type="button"
            onClick={() => { setScanMode('localsdk'); resetCapture(); }}
            className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (scanMode === 'localsdk' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
          >
            Local SDK (Port 8000)
          </button>
          <button
            type="button"
            onClick={() => { setScanMode('simulator'); resetCapture(); }}
            className={'px-2 py-1 rounded-md text-[10px] font-bold transition-all ' + (scanMode === 'simulator' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
          >
            Simulator
          </button>
        </div>
      </div>

      {/* Main Biometric UI Stage */}
      <div className="flex flex-col items-center justify-center py-6 bg-white border border-slate-200 rounded-xl shadow-inner relative overflow-hidden min-h-[190px]">
        
        {isScanning && (
          <div className="absolute inset-0 m-auto w-24 h-24 rounded-full border border-teal-500/20 bg-teal-500/5 animate-ping"></div>
        )}

        {value ? (
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm relative animate-scaleUp">
              <Fingerprint size={32} className="stroke-[1.5]" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                <Check size={10} className="stroke-[3]" />
              </div>
            </div>
            <div className="text-center">
              <h5 className="font-bold text-xs text-slate-800">Biometrics Locked</h5>
              <p className="text-[9px] text-slate-400 mt-0.5 font-mono truncate max-w-xs px-4">{value}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3.5">
            <button
              type="button"
              disabled={isScanning}
              onClick={startScan}
              className={'w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-300 relative group ' + 
                (isScanning 
                  ? 'bg-teal-50 border-teal-400 text-teal-500 animate-pulse' 
                  : 'bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-500 hover:text-teal-600 cursor-pointer active:scale-95')}
            >
              <Fingerprint size={30} className="stroke-[1.5]" />
              
              {isScanning && (
                <div className="absolute left-0 right-0 h-0.5 bg-teal-500/60 shadow shadow-teal-500 animate-bounce top-1/3"></div>
              )}
            </button>
            <div className="text-center px-4">
              <h5 className="font-semibold text-xs text-slate-700">
                {isScanning 
                  ? (scanMode === 'webauthn' ? 'Kumukuha ng biometric credentials...' : 'I-dikit ang hinlalaki sa scanner glass')
                  : (scanMode === 'webauthn' ? 'USB Fingerprint Hardware Ready' : 'Place thumb on scanner glass')}
              </h5>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                {isScanning 
                  ? 'Scan in progress: ' + scanProgress + '%'
                  : (scanMode === 'webauthn' 
                      ? 'I-click ang scanner icon para simulan ang Windows Hello / USB biometric verification' 
                      : (scanMode === 'localsdk' 
                          ? 'I-click ang icon para kumonekta sa SecuGen/DigitalPersona local agent'
                          : 'I-click ang icon para simulan ang pag-scan gamit ang simulator'))}
              </p>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-100">
            <div 
              className="h-full bg-teal-600 transition-all duration-200" 
              style={{ width: scanProgress + '%' }}
            ></div>
          </div>
        )}
      </div>

      {/* Control Actions & Status */}
      <div className="flex items-center justify-between gap-3 text-slate-500 text-[11px] font-medium p-3 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-1.5 font-mono truncate">
          <div className={'w-1.5 h-1.5 rounded-full ' + (isScanning ? 'bg-teal-400 animate-pulse' : 'bg-teal-500')}></div>
          <span className="truncate">{scanStatus}</span>
        </div>

        {value && (
          <button
            type="button"
            onClick={resetCapture}
            className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 hover:underline shrink-0"
          >
            <RefreshCw size={11} />
            <span>Kuhang Muli</span>
          </button>
        )}
      </div>

      {/* Mode Advisory footer */}
      <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-100/50 p-2.5 rounded-xl text-[10px] text-amber-800 leading-normal">
        <Info size={12} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          {scanMode === 'webauthn' ? (
            <p>
              <strong>WebAuthn Mode:</strong> Naka-sync sa browser biometrics API ng inyong Windows PC. Gumagana ito sa anumang desktop USB biometric scanner na rehistrado sa Windows Hello.
            </p>
          ) : scanMode === 'localsdk' ? (
            <p>
              <strong>Local Loopback Service Mode:</strong> Ginagamit ang default na local background service ng SecuGen / DigitalPersona (Port 8000) para makuha ang fingerprint template ng direkta mula sa driver ng card scanner.
            </p>
          ) : (
            <p>
              <strong>Simulator Mode:</strong> Nagpapakita ng visual flow ng biometric scanning at nagge-generate ng mock template string para sa evaluation purposes lamang.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}

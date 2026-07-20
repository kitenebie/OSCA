import React, { useState, useEffect } from 'react';
import { useSeniorsStore } from '../store/seniorsStore';
import { SeniorCitizen } from '../types';
import { useUIStore } from '../store/uiStore';
import { renderBarcodeBits } from '../utils/idGenerator';
// @ts-ignore
const phLogo = 'https://kitenebie.github.io/OSCA/ph_logo.png';
// @ts-ignore
const fingerprintImg = 'https://kitenebie.github.io/OSCA/fingerprint.png';
import { 
  Scan, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  Smartphone, 
  HelpCircle, 
  UserCheck, 
  CreditCard, 
  RefreshCw, 
  CornerDownRight, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Volume2
} from 'lucide-react';

export default function FindUserPage() {
  const { seniors } = useSeniorsStore();
  const { showToast, nfcEnabled } = useUIStore();
  
  const [searchId, setSearchId] = useState('');
  
  const C = {
    green:   '#02A952',
    yellow:  '#FDFE00',
    white:   '#FEFEFE',
    blue:    '#0000FD',
    red:     '#FD0000',
    darkText:'#1a1a1a',
  } as const;
  const [selectedSenior, setSelectedSenior] = useState<SeniorCitizen | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  const formatNfcText = (text: string) => {
    if (nfcEnabled) return text;
    // Replace "NFC" (case-insensitive), clean up spaces and trailing slashes
    return text
      .replace(/nfc/gi, '')
      .replace(/\/\s*$/, '')
      .replace(/^\s*\//, '')
      .replace(/\/\s*\//g, '/')
      .replace(/\s\/\s/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const [scanLogs, setScanLogs] = useState<string[]>([]);

  useEffect(() => {
    setScanLogs([
      `[${new Date().toLocaleTimeString()}] RFID / NFC Antenna initialized on Port 3000.`,
      `[${new Date().toLocaleTimeString()}] Polling for OSCA proximity smart badges...`,
    ].map(formatNfcText));
  }, [nfcEnabled]);

  // Audio mock beep utilizing browser AudioContext for a professional touch
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // high-pitched beep
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12); // Short beep duration
    } catch (e) {
      // AudioContext might be blocked by browser policy until interaction, ignore gracefully
    }
  };

  const addLog = (message: string) => {
    const formatted = formatNfcText(message);
    setScanLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${formatted}`, ...prev.slice(0, 10)]);
  };

  // Handle Search submit
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) {
      showToast('Pakisulat ang OSCA ID o pangalan upang maghanap.', 'warning');
      return;
    }

    const trimmed = searchId.trim().toLowerCase();
    
    // Find matching senior by oscaNumber, id, firstName, or lastName
    const found = seniors.find(
      (s) => 
        s.oscaNumber.toLowerCase().includes(trimmed) || 
        s.id.toLowerCase().includes(trimmed) ||
        s.firstName.toLowerCase().includes(trimmed) ||
        s.lastName.toLowerCase().includes(trimmed)
    );

    if (found) {
      playBeep();
      setSelectedSenior(found);
      setIsFlipped(false);
      addLog(`ID matched via search database query: ${found.oscaNumber} - ${found.firstName} ${found.lastName}`);
      showToast(`Nahanap ang profile ni ${found.firstName} ${found.lastName}!`, 'success');
    } else {
      addLog(`Failed database lookup for query: "${searchId}"`);
      showToast('Walang nahanap na Senior Citizen sa ID o pangalang iyan.', 'error');
    }
  };

  // Simulate NFC Proximity scan of a random senior
  const handleSimulateScan = () => {
    if (!isScanning) {
      showToast('Pakibuhay muna ang Scanning Laser sa switch.', 'warning');
      return;
    }

    addLog('NFC Proximity sensor detecting smart tag...');
    
    // Pick a random senior
    setTimeout(() => {
      if (seniors.length === 0) {
        showToast('Walang senior citizens sa database para i-scan.', 'error');
        return;
      }
      const randomIndex = Math.floor(Math.random() * seniors.length);
      const randomSenior = seniors[randomIndex];
      
      playBeep();
      setSelectedSenior(randomSenior);
      setIsFlipped(false);
      addLog(`NFC ISO/IEC 14443-A Tag scanned successfully! ID: ${randomSenior.oscaNumber}`);
      showToast(formatNfcText(`NFC Verified: ${randomSenior.firstName} ${randomSenior.lastName} (${randomSenior.barangay})`), 'success');
    }, 600);
  };

  // Generate QR code for the flippable ID card
  const getQrCodeUrl = (senior: SeniorCitizen) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f766e&data=${encodeURIComponent(
      JSON.stringify({
        osca: senior.oscaNumber,
        name: `${senior.firstName} ${senior.lastName}`,
        barangay: senior.barangay,
        pensioner: senior.pensionBeneficiary
      })
    )}`;
  };

  return (
    <div className="space-y-6" id="find-user-container">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-teal-600">
            <Scan size={18} className="animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-widest uppercase font-mono bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              {formatNfcText('Biometric NFC Hardware Node')}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
            Find User & ID Scanner (Tag Verification)
          </h2>
          <p className="text-xs text-slate-400">
            I-verify ang OSCA ID at impormasyon gamit ang automated biometric scanning module o database ID query.
          </p>
        </div>

        {/* Info panel */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
          <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600">
            <Radio size={15} className="animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Antenna Status</span>
            </div>
            <p className="text-xs font-black text-slate-700">ONLINE / POLLING ACTIVE</p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 1: CONTROLS & ANIMATED SCANNER ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Box 1: Search Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Search size={14} className="text-teal-600" />
              I-search ang OSCA ID o Pangalan
            </h3>
            
            <form onSubmit={handleSearch} className="relative flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <CreditCard size={14} />
                </span>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="OSCA ID (e.g. 2024-0001) o Pangalan"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none transition-all font-mono"
                  id="search-id-input"
                />
              </div>
              <button
                type="submit"
                className="px-4.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                id="search-id-submit-btn"
              >
                <Search size={13} />
                <span className="hidden sm:inline">Hanapin</span>
              </button>
            </form>

            <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
              <HelpCircle size={13} className="text-teal-600 shrink-0 mt-0.5" />
              <span>
                Tip: Isulat ang bahagi ng pangalan (e.g. "Reyes") o buong OSCA number upang agad na mahanap ang senior mula sa e-Census.
              </span>
            </div>
          </div>

          {/* Box 2: High-Tech Scanner Plate UI */}
          {nfcEnabled && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Scan size={14} className="text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
                  {formatNfcText('NFC / RFID Proximity Scanner')}
                </h3>
                
                {/* Scan Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isScanning ? 'text-teal-600' : 'text-slate-400'}`}>
                    {isScanning ? 'Active' : 'Muted'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsScanning(!isScanning)}
                    className={`relative w-9 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer
                      ${isScanning ? 'bg-teal-600' : 'bg-slate-200'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-250
                      ${isScanning ? 'translate-x-4' : 'translate-x-0'}`}
                    ></span>
                  </button>
                </div>
              </div>

              {/* Simulated Scanner Terminal screen */}
              <div className="relative w-full aspect-video md:aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex flex-col items-center justify-center p-4">
                
                {/* Matrix code rain bg placeholder or ambient grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                
                {/* Hologram Circle */}
                <div className={`w-36 h-36 rounded-full border border-dashed flex items-center justify-center transition-all duration-500
                  ${isScanning 
                    ? 'border-teal-500/40 bg-teal-500/5 animate-pulse' 
                    : 'border-slate-200 bg-slate-100/10'}`}
                >
                  <div className={`w-28 h-28 rounded-full border border-teal-500/10 flex items-center justify-center relative
                    ${isScanning ? 'animate-spin' : ''}`}
                    style={{ animationDuration: '10s' }}
                  >
                    <Smartphone size={32} className={`text-teal-600/10 transform -rotate-12`} />
                  </div>
                </div>

                {/* Laser beam swipe down line (VERTICAL ANIMATION) */}
                {isScanning && (
                  <div 
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent shadow-[0_0_12px_#14b8a6] animate-laserSweep pointer-events-none z-10"
                    style={{
                      animation: 'laserSweep 3s infinite ease-in-out'
                    }}
                  ></div>
                )}

                {/* Tech Stats overlay info inside scanner */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[8px] font-mono text-slate-400 tracking-wider">
                  <span>FREQ: 13.56 MHz</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-teal-500 animate-ping' : 'bg-rose-500'}`}></span>
                    {isScanning ? 'READY FOR TAG' : 'MUTED'}
                  </span>
                  <span>ISO/IEC 14443A</span>
                </div>

                {/* Simulated Tag detected success popup inside scanner screen */}
                {selectedSenior && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-teal-50/95 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-xl text-[9px] font-mono font-bold flex items-center gap-1.5 shadow-md backdrop-blur-sm animate-bounce">
                    <CheckCircle size={10} className="text-teal-600 shrink-0" />
                    <span>TAG READ OK: #{selectedSenior.oscaNumber.split('-').pop()}</span>
                  </div>
                )}
              </div>

              {/* Quick Action Button for Scan simulation */}
              <button
                type="button"
                disabled={!isScanning}
                onClick={handleSimulateScan}
                className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-100 disabled:to-slate-150 disabled:text-slate-400 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                id="simulate-scan-btn"
              >
                <Radio size={14} className={isScanning ? 'animate-pulse' : ''} />
                <span>{formatNfcText('Magsimula ng Proximity Tap (Simulate NFC Tag Scan)')}</span>
              </button>
            </div>
          )}

          {/* Box 3: Live Scan logs */}
          {nfcEnabled && (
            <div className="bg-slate-50 text-slate-600 rounded-3xl p-5 md:p-6 shadow-sm space-y-3.5 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-teal-700 font-mono tracking-widest uppercase">
                  Telemetry Log Stream
                </span>
                <button 
                  onClick={() => {
                    setScanLogs([`[${new Date().toLocaleTimeString()}] Logs cleared. Real-time antenna monitoring running.`]);
                  }}
                  className="text-[9px] text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw size={10} />
                  <span>Clear Logs</span>
                </button>
              </div>

              <div className="font-mono text-[9px] md:text-[10px] space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {scanLogs.map((log, index) => (
                  <p key={index} className={`leading-normal border-b border-slate-200/50 pb-1.5 flex gap-1.5 ${index === 0 ? 'text-teal-600 font-bold' : 'text-slate-500'}`}>
                    <CornerDownRight size={10} className="shrink-0 mt-0.5 text-teal-600" />
                    <span className="break-all">{log}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ================= COLUMN 2: EXPECTED RESULT & FLIPPABLE ID ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {!selectedSenior ? (
            /* PLACEHOLDER WHEN NO SENIOR SCANNED YET */
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[500px] space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 relative">
                <Scan size={24} className="animate-pulse" />
                <div className="absolute -bottom-1 -right-1 bg-teal-500 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Kasalukuyang Naghihintay...</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {nfcEnabled 
                    ? 'Walang isinagawang scan o search sa kasalukuyan. I-type ang Senior ID sa itaas o pindutin ang "Proximity Tap" upang masubukan ang system.'
                    : 'Walang isinagawang scan o search sa kasalukuyan. I-type ang Senior ID sa itaas upang mahanap ang profile.'
                  }
                </p>
              </div>

              {/* Demo auto selectors */}
              <div className="pt-4 border-t border-slate-100 w-full max-w-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">O kaya, pumili ng mabilis na sample:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {seniors.slice(0, 3).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        playBeep();
                        setSelectedSenior(s);
                        setIsFlipped(false);
                        addLog(`Manual sample selected: ${s.oscaNumber}`);
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-150 hover:border-teal-200 rounded-xl text-[10px] font-mono font-bold text-slate-600 hover:text-teal-700 transition-all cursor-pointer"
                    >
                      {s.firstName} {s.lastName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* COMPREHENSIVE GORGEOUS VERIFIED PROFILE VIEW */
            <div className="space-y-6 animate-fadeIn">
              
              {/* Box 1: Flippable ID Card Card with 3D Rotate */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col items-center gap-6">
                
                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[9px] font-extrabold text-teal-600 uppercase font-mono tracking-wider bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      SECURE CR80 SMART CARD
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight mt-1">
                      Flippable Digital OSCA ID Card
                    </h3>
                  </div>
                  
                  {/* ID Flip Button */}
                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-bold text-xs rounded-xl border border-slate-200 hover:border-teal-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} className={`transition-transform duration-500 ${isFlipped ? 'rotate-180 text-teal-600' : ''}`} />
                    <span>I-flip ang ID (Front/Back)</span>
                  </button>
                </div>

                {/* 3D FLIP CONTAINER & SCENE */}
                <div className="py-4 bg-slate-50/50 w-full rounded-2xl border border-slate-100 flex items-center justify-center min-h-[250px] overflow-hidden">
                  
                  {/* Perspective Stage */}
                  <div className="[perspective:1000px] select-none scale-[0.8] min-[370px]:scale-[0.9] min-[420px]:scale-100 origin-center transition-transform w-[272px] min-[370px]:w-[306px] min-[420px]:w-[340px] h-[171.2px] min-[370px]:h-[192.6px] min-[420px]:h-[214px] flex items-center justify-center" id="flippable-id-card-stage">
                    
                    {/* Inner Rotator Card */}
                    <div 
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={`relative w-[340px] h-[214px] transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer
                        ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                    >
                      
                      {/* ================= ID FRONT FACE ================= */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-xl shadow-xl overflow-hidden [backface-visibility:hidden]"
                        style={{
                          borderRadius: 12,
                          padding: 2,
                          background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`,
                          userSelect: 'none',
                        }}
                        id="card-front-face"
                      >
                        <div className="w-full h-full rounded-[10px] overflow-hidden relative p-3.5 flex flex-col justify-between" style={{ background: C.white }}>
                        {/* ── TOP-LEFT CONCENTRIC CURVED ACCENT BLOCK ── */}
                        {/* Blue accent (outermost) */}
                        <div style={{
                          position: 'absolute',
                          top: -60,
                          left: -60,
                          width: 272,
                          height: 182,
                          background: C.blue,
                          borderBottomRightRadius: '100%',
                          zIndex: 1,
                        }} />
                        {/* Red accent (thin stripe) */}
                        <div style={{
                          position: 'absolute',
                          top: -60,
                          left: -60,
                          width: 264,
                          height: 174,
                          background: C.red,
                          borderBottomRightRadius: '100%',
                          zIndex: 2,
                        }} />
                        {/* Yellow accent (middle) */}
                        <div style={{
                          position: 'absolute',
                          top: -60,
                          left: -60,
                          width: 258,
                          height: 168,
                          background: C.yellow,
                          borderBottomRightRadius: '100%',
                          zIndex: 3,
                        }} />
                        {/* Green base (innermost) */}
                        <div style={{
                          position: 'absolute',
                          top: -60,
                          left: -60,
                          width: 250,
                          height: 160,
                          background: C.green,
                          borderBottomRightRadius: '100%',
                          zIndex: 4,
                        }} />

                        {/* Blended PH Logo background watermark (centered, large and visible) */}
                        <img 
                          src={phLogo} 
                          alt="PH Logo Seal"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 190,
                            height: 190,
                            opacity: 0.35,
                            mixBlendMode: 'multiply',
                            pointerEvents: 'none',
                            zIndex: 0,
                          }}
                        />

                        {/* ── BOTTOM-RIGHT CONCENTRIC CURVED ACCENT ── */}
                        {/* Blue accent (outermost) */}
                        <div style={{
                          position: 'absolute',
                          bottom: -50,
                          right: -50,
                          width: 204,
                          height: 134,
                          background: C.blue,
                          borderTopLeftRadius: '100%',
                          zIndex: 1,
                        }} />
                        {/* Red accent (thin stripe) */}
                        <div style={{
                          position: 'absolute',
                          bottom: -50,
                          right: -50,
                          width: 198,
                          height: 128,
                          background: C.red,
                          borderTopLeftRadius: '100%',
                          zIndex: 2,
                        }} />
                        {/* Yellow accent (middle) */}
                        <div style={{
                          position: 'absolute',
                          bottom: -50,
                          right: -50,
                          width: 192,
                          height: 122,
                          background: C.yellow,
                          borderTopLeftRadius: '100%',
                          zIndex: 3,
                        }} />
                        {/* Green base (innermost) */}
                        <div style={{
                          position: 'absolute',
                          bottom: -50,
                          right: -50,
                          width: 184,
                          height: 114,
                          background: C.green,
                          borderTopLeftRadius: '100%',
                          zIndex: 4,
                        }} />

                        {/* Half Philippine Sun Crown emerging from bottom-right curves */}
                        <svg style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 100,
                          height: 100,
                          zIndex: 3.5,
                          pointerEvents: 'none',
                        }} viewBox="0 0 100 100">
                          <defs>
                            <g id="phil-ray-front-find">
                              <polygon points="0,-45 -4,-18 4,-18" fill={C.yellow} />
                              <polygon points="-8,-38 -1,-17 -7,-17" fill={C.yellow} />
                              <polygon points="8,-38 7,-17 1,-17" fill={C.yellow} />
                            </g>
                          </defs>
                          <circle cx={100} cy={100} r={18} fill={C.yellow} />
                          <use href="#phil-ray-front-find" transform="translate(100, 100) rotate(-90)" />
                          <use href="#phil-ray-front-find" transform="translate(100, 100) rotate(-67.5)" />
                          <use href="#phil-ray-front-find" transform="translate(100, 100) rotate(-45)" />
                          <use href="#phil-ray-front-find" transform="translate(100, 100) rotate(-22.5)" />
                          <use href="#phil-ray-front-find" transform="translate(100, 100) rotate(0)" />
                        </svg>

                        {/* Biometric Fingerprint Security Seal (bottom-right on green curve) */}
                        <img 
                          src={fingerprintImg} 
                          alt="Biometric Fingerprint"
                          style={{
                            position: 'absolute',
                            bottom: 12,
                            right: 14,
                            width: 32,
                            height: 40,
                            opacity: 0.85,
                            zIndex: 10,
                            pointerEvents: 'none',
                          }}
                        />

                        {/* White bold OSCA text on the left top side */}
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          left: 14,
                          zIndex: 10,
                          fontSize: 10,
                          fontWeight: 900,
                          color: C.white,
                          letterSpacing: '1px',
                          fontFamily: "'Segoe UI', 'Inter', 'Poppins', sans-serif",
                        }}>
                          OSCA
                        </div>

                        {/* ── LOGO BADGE (top-left, white text on green, over diagonal) ── */}
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          left: 54,
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: 4,
                            background: C.white,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                          }}>
                            <img 
                              referrerPolicy="no-referrer"
                              src="https://kitenebie.github.io/OSCA/juban-logo.png" 
                              alt="Juban Logo" 
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                          <div>
                            <div style={{
                              fontSize: 7,
                              fontWeight: 800,
                              color: C.white,
                              letterSpacing: '0.5px',
                              lineHeight: 1.1,
                              textTransform: 'uppercase',
                              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            }}>BAYAN NG JUBAN</div>
                            <div style={{
                              fontSize: 5.5,
                              fontWeight: 600,
                              color: 'rgba(254,254,254,0.85)',
                              lineHeight: 1.1,
                              textTransform: 'uppercase',
                            }}>Office of Senior Citizens Affairs</div>
                          </div>
                        </div>

                        {/* ── OSCA BADGE (top-right, green badge on white bg) ── */}
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          right: 12,
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}>
                          <div style={{
                            background: C.green,
                            color: C.white,
                            fontSize: 6,
                            fontWeight: 900,
                            padding: '3px 6px',
                            borderRadius: 3,
                            letterSpacing: '1px',
                            lineHeight: 1,
                          }}>OSCA</div>
                          <div style={{
                            fontSize: 5,
                            color: C.green,
                            fontWeight: 700,
                            marginTop: 1,
                            letterSpacing: '0.3px',
                          }}>SENIOR CITIZEN</div>
                        </div>

                        {/* ── PHOTO PLACEHOLDER (upper-left-center area) ── */}
                        <div style={{
                          position: 'absolute',
                          top: 38,
                          left: 100,
                          width: 68,
                          height: 78,
                          borderRadius: 8,
                          border: `2.5px solid ${C.green}`,
                          background: '#f0f4f3',
                          overflow: 'hidden',
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(2,169,82,0.15)',
                        }}>
                          {selectedSenior.profilePhoto ? (
                            <img 
                              referrerPolicy="no-referrer"
                              src={selectedSenior.profilePhoto} 
                              alt={selectedSenior.firstName} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              fontSize: 8,
                              color: C.green,
                              fontWeight: 700,
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              padding: 4,
                              lineHeight: 1.3,
                            }}>2x2{'\n'}PHOTO</div>
                          )}
                          {/* NFC chip mock */}
                          {nfcEnabled && (
                            <div style={{
                              position: 'absolute',
                              top: 3,
                              right: 3,
                              width: 14,
                              height: 10,
                              background: 'linear-gradient(135deg, #f59e0b, #eab308)',
                              borderRadius: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              padding: 2,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                            }}>
                              <span style={{ width: '100%', height: 1, background: 'rgba(120,80,0,0.2)' }} />
                              <span style={{ width: '100%', height: 1, background: 'rgba(120,80,0,0.2)' }} />
                            </div>
                          )}
                        </div>

                        {/* ── NAME & TITLE BLOCK (right of photo) ── */}
                        <div style={{
                          position: 'absolute',
                          top: 40,
                          left: 178,
                          right: 14,
                          zIndex: 10,
                        }}>
                          <div style={{
                            fontSize: 5.5,
                            fontWeight: 600,
                            color: C.green,
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            lineHeight: 1,
                            marginBottom: 2,
                          }}>Senior Citizen Name</div>
                          <div style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: C.darkText,
                            lineHeight: 1.15,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {selectedSenior.firstName} {selectedSenior.lastName}
                          </div>
                          <div style={{
                            fontSize: 7.5,
                            fontWeight: 600,
                            color: C.green,
                            lineHeight: 1.2,
                            marginTop: 2,
                          }}>
                            Brgy. {selectedSenior.barangay}
                          </div>
                        </div>

                        {/* ── OSCA NUMBER (below name, accent display) ── */}
                        <div style={{
                          position: 'absolute',
                          top: 82,
                          left: 178,
                          right: 14,
                          zIndex: 10,
                        }}>
                          <div style={{
                            fontSize: 5,
                            fontWeight: 700,
                            color: '#666',
                            textTransform: 'uppercase',
                            letterSpacing: '0.6px',
                            lineHeight: 1,
                            marginBottom: 1,
                          }}>OSCA Number</div>
                          <div style={{
                            fontSize: 9,
                            fontWeight: 900,
                            color: C.green,
                            fontFamily: "'Consolas', 'SF Mono', monospace",
                            letterSpacing: '0.8px',
                            lineHeight: 1,
                          }}>{selectedSenior.oscaNumber}</div>
                        </div>

                        {/* ── CONTACT INFO BLOCK (bottom-left, icon+text rows) ── */}
                        <div style={{
                          position: 'absolute',
                          bottom: 14,
                          left: 14,
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                        }}>
                          {/* Date of Birth */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="8" height="8" viewBox="0 0 16 16" fill={C.blue} style={{ flexShrink: 0 }}>
                              <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke={C.blue} strokeWidth="1.5"/>
                              <line x1="5" y1="1" x2="5" y2="5" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round"/>
                              <line x1="11" y1="1" x2="11" y2="5" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round"/>
                              <line x1="2" y1="7" x2="14" y2="7" stroke={C.blue} strokeWidth="1"/>
                            </svg>
                            <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}>
                              <span style={{ color: '#888', fontWeight: 600 }}>DOB: </span>{selectedSenior.birthdate}
                            </span>
                          </div>
                          {/* Gender */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="8" height="8" viewBox="0 0 16 16" fill={C.green} style={{ flexShrink: 0 }}>
                              <circle cx="8" cy="8" r="5.5" fill="none" stroke={C.green} strokeWidth="1.5"/>
                              <circle cx="8" cy="8" r="2" fill={C.green}/>
                            </svg>
                            <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}>
                              <span style={{ color: '#888', fontWeight: 600 }}>Sex: </span>{selectedSenior.sex}
                            </span>
                          </div>
                          {/* Contact Number */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="8" height="8" viewBox="0 0 16 16" fill={C.blue} style={{ flexShrink: 0 }}>
                              <rect x="4" y="1" width="8" height="14" rx="2" fill="none" stroke={C.blue} strokeWidth="1.3"/>
                              <line x1="6" y1="12" x2="10" y2="12" stroke={C.blue} strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                            <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}>
                              {selectedSenior.contactNumber || '(No Phone)'}
                            </span>
                          </div>
                        </div>

                        {/* ── ISSUED DATE + SIGNATURE (bottom-center/right area) ── */}
                        <div style={{
                          position: 'absolute',
                          bottom: 10,
                          left: 130,
                          right: 60,
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}>
                          {/* Signature area */}
                          <div style={{
                            height: 16,
                            width: 70,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {selectedSenior.signatureData ? (
                              <img 
                                referrerPolicy="no-referrer"
                                src={selectedSenior.signatureData} 
                                alt="Signature" 
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'brightness(0)' }}
                              />
                            ) : (
                              <div style={{ width: '100%', borderBottom: `1px solid ${C.green}`, height: 1 }} />
                            )}
                          </div>
                          <div style={{
                            fontSize: 5,
                            color: '#888',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginTop: 1,
                          }}>Signature of Holder</div>
                          <div style={{
                            fontSize: 5,
                            color: '#888',
                            fontWeight: 500,
                            marginTop: 2,
                          }}>
                            Issued: <span style={{ fontWeight: 700, color: C.darkText }}>{selectedSenior.registeredDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                      {/* ================= ID BACK FACE ================= */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-xl shadow-xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]"
                        style={{
                          borderRadius: 12,
                          padding: 2,
                          background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`,
                          userSelect: 'none',
                        }}
                        id="card-back-face"
                      >
                        <div className="w-full h-full rounded-[10px] overflow-hidden relative p-3.5 flex flex-col justify-between" style={{ background: C.green }}>
                        {/* ── CONCENTRIC CURVED ACCENTS (inverted, layered) ── */}
                        {/* Top-right blue overlay (outermost) */}
                        <div style={{
                          position: 'absolute',
                          top: -60,
                          right: -60,
                          width: 256,
                          height: 176,
                          background: C.blue,
                          borderBottomLeftRadius: '100%',
                          zIndex: 1,
                        }} />
                        {/* Top-right red overlay (thin stripe) */}
                        <div style={{
                          position: 'absolute',
                          top: -60,
                          right: -60,
                          width: 248,
                          height: 168,
                          background: C.red,
                          borderBottomLeftRadius: '100%',
                          zIndex: 2,
                        }} />
                        {/* Top-right yellow overlay (middle) */}
                        <div style={{
                          position: 'absolute',
                          top: -60,
                          right: -60,
                          width: 242,
                          height: 162,
                          background: C.yellow,
                          borderBottomLeftRadius: '100%',
                          zIndex: 3,
                        }} />
                        {/* Top-right dark overlay (innermost) */}
                        <div style={{
                          position: 'absolute',
                          top: -60,
                          right: -60,
                          width: 234,
                          height: 154,
                          background: 'rgba(0,0,0,0.15)',
                          borderBottomLeftRadius: '100%',
                          zIndex: 4,
                        }} />

                        {/* Half Philippine Sun Crown emerging from top-right curves */}
                        <svg style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 100,
                          height: 100,
                          zIndex: 3.5,
                          pointerEvents: 'none',
                        }} viewBox="0 0 100 100">
                          <defs>
                            <g id="phil-ray-back-find">
                              <polygon points="0,-45 -4,-18 4,-18" fill={C.yellow} />
                              <polygon points="-8,-38 -1,-17 -7,-17" fill={C.yellow} />
                              <polygon points="8,-38 7,-17 1,-17" fill={C.yellow} />
                            </g>
                          </defs>
                          <circle cx={100} cy={0} r={18} fill={C.yellow} />
                          <use href="#phil-ray-back-find" transform="translate(100, 0) rotate(-90)" />
                          <use href="#phil-ray-back-find" transform="translate(100, 0) rotate(-112.5)" />
                          <use href="#phil-ray-back-find" transform="translate(100, 0) rotate(-135)" />
                          <use href="#phil-ray-back-find" transform="translate(100, 0) rotate(-157.5)" />
                          <use href="#phil-ray-back-find" transform="translate(100, 0) rotate(-180)" />
                        </svg>

                        {/* Bottom-left blue overlay (outermost) */}
                        <div style={{
                          position: 'absolute',
                          bottom: -50,
                          left: -50,
                          width: 186,
                          height: 126,
                          background: C.blue,
                          borderTopRightRadius: '100%',
                          zIndex: 1,
                        }} />

                        {/* Blended PH Logo background watermark on back side (centered, large and visible) */}
                        <img 
                          src={phLogo} 
                          alt="PH Logo Seal"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 190,
                            height: 190,
                            opacity: 0.28,
                            mixBlendMode: 'multiply',
                            pointerEvents: 'none',
                            zIndex: 0,
                          }}
                        />

                        {/* Bottom-left red overlay (thin stripe) */}
                        <div style={{
                          position: 'absolute',
                          bottom: -50,
                          left: -50,
                          width: 178,
                          height: 118,
                          background: C.red,
                          borderTopRightRadius: '100%',
                          zIndex: 2,
                        }} />
                        {/* Bottom-left dark overlay (innermost) */}
                        <div style={{
                          position: 'absolute',
                          bottom: -50,
                          left: -50,
                          width: 172,
                          height: 112,
                          background: 'rgba(0,0,0,0.12)',
                          borderTopRightRadius: '100%',
                          zIndex: 3,
                        }} />

                        {/* ── LOGO (top-left, white/light version on green bg) ── */}
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          left: 14,
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}>
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            background: C.white,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}>
                            <img 
                              referrerPolicy="no-referrer"
                              src="https://kitenebie.github.io/OSCA/juban-logo.png" 
                              alt="Juban Logo" 
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                          <div>
                            <div style={{
                              fontSize: 7,
                              fontWeight: 800,
                              color: C.white,
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                              lineHeight: 1.1,
                            }}>BAYAN NG JUBAN</div>
                            <div style={{
                              fontSize: 5.5,
                              fontWeight: 600,
                              color: 'rgba(254,254,254,0.8)',
                              textTransform: 'uppercase',
                              lineHeight: 1.1,
                            }}>OSCA — Sorsogon, Philippines</div>
                          </div>
                        </div>

                        {/* NFC status indicator */}
                        <div style={{
                          position: 'absolute',
                          top: 10,
                          right: 14,
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}>
                          <div style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: C.yellow,
                            boxShadow: `0 0 4px ${C.yellow}`,
                          }} />
                          <span style={{
                            fontSize: 5,
                            fontWeight: 700,
                            color: C.white,
                            fontFamily: "'Consolas', 'SF Mono', monospace",
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                          }}>{nfcEnabled ? 'NFC SMART TAG' : 'SMART TAG'}</span>
                        </div>

                        {/* ── TERMS & CONDITIONS TEXT BLOCK ── */}
                        <div style={{
                          position: 'absolute',
                          top: 36,
                          left: 14,
                          right: 120,
                          zIndex: 10,
                        }}>
                          <div style={{
                            fontSize: 6.5,
                            fontWeight: 800,
                            color: C.white,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            lineHeight: 1,
                            marginBottom: 4,
                          }}>Terms & Privileges</div>
                          <div style={{
                            fontSize: 5.5,
                            fontWeight: 400,
                            color: C.white,
                            lineHeight: 1.45,
                            textAlign: 'left',
                          }}>
                            <p style={{ margin: '0 0 2px' }}>1. 20% Discount on Medicines, transport, hospitals, medical supplies as per RA 9994.</p>
                            <p style={{ margin: '0 0 2px' }}>2. Non-transferable. Misuse is punishable under LGU Municipal Penal Codes.</p>
                            <p style={{ margin: '0 0 2px' }}>3. If lost, report immediately to OSCA Office, Juban Municipal Hall.</p>
                          </div>
                          
                          {/* Emergency contact */}
                          <div style={{ marginTop: 5, textAlign: 'left' }}>
                            <div style={{
                              fontSize: 5.5,
                              fontWeight: 800,
                              color: C.white,
                              textTransform: 'uppercase',
                              letterSpacing: '0.4px',
                              lineHeight: 1,
                              marginBottom: 2,
                            }}>Emergency Contact:</div>
                            <div style={{ fontSize: 5.5, fontWeight: 500, color: C.white, lineHeight: 1.4 }}>
                              Landline: (056) 211-1234 (MSWDO)
                            </div>
                            <div style={{ fontSize: 5.5, fontWeight: 500, color: C.white, lineHeight: 1.4 }}>
                              Mobile: {selectedSenior.contactNumber || '+63 LGU Emergency'}
                            </div>
                          </div>
                        </div>

                        {/* ── QR CODE (right side with white bg box and accent frame) ── */}
                        <div style={{
                          position: 'absolute',
                          top: 36,
                          right: 14,
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          {/* Yellow accent ring / seal */}
                          <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            border: `2px solid ${C.yellow}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            zIndex: 11,
                          }}>
                            <div style={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              background: C.yellow,
                            }} />
                          </div>
                          
                          {/* QR container with gradient border: 40% red, 20% yellow, 40% blue */}
                          <div style={{
                            width: 74,
                            height: 74,
                            padding: 2,
                            borderRadius: 5,
                            background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: C.white,
                              borderRadius: 3.5,
                              padding: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <img 
                                referrerPolicy="no-referrer"
                                src={getQrCodeUrl(selectedSenior)} 
                                alt="OSCA QR Verification" 
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          </div>
                          <span style={{
                            fontSize: 5,
                            fontWeight: 700,
                            color: C.white,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}>SCAN TO VERIFY</span>
                        </div>

                        {/* ── BARCODE (bottom-center strip) ── */}
                        <div style={{
                          position: 'absolute',
                          bottom: 28,
                          left: 14,
                          right: 100,
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}>
                          <div style={{
                            width: '100%',
                            height: 18,
                            background: 'rgba(0,0,0,0.08)',
                            borderRadius: 3,
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: 2,
                            display: 'flex',
                            alignItems: 'stretch',
                            overflow: 'hidden',
                          }}>
                            {(() => {
                              const { bars, totalWidth } = renderBarcodeBits(selectedSenior.oscaNumber);
                              return (
                                <svg viewBox={`0 0 ${totalWidth} 20`} width="100%" height="100%" preserveAspectRatio="none" style={{ fill: C.white }}>
                                  {bars.map((bar, idx) => bar.isBlack ? (
                                    <rect key={idx} x={bar.x} y={0} width={bar.width} height={20} />
                                  ) : null)}
                                </svg>
                              );
                            })()}
                          </div>
                          <span style={{
                            fontSize: 5.5,
                            fontFamily: "'Consolas', 'SF Mono', monospace",
                            fontWeight: 700,
                            color: 'rgba(254,254,254,0.7)',
                            marginTop: 1,
                            letterSpacing: '0.5px',
                          }}>{selectedSenior.oscaNumber}</span>
                        </div>

                        {/* ── FOOTER SIGNATURES ── */}
                        <div style={{
                          position: 'absolute',
                          bottom: 6,
                          left: 14,
                          right: 14,
                          zIndex: 10,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          borderTop: '1px solid rgba(254,254,254,0.15)',
                          paddingTop: 4,
                        }}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{
                              fontSize: 6,
                              fontWeight: 800,
                              color: C.white,
                              lineHeight: 1,
                              textTransform: 'uppercase',
                            }}>Hon. Antonio Alindogan</div>
                            <div style={{
                              fontSize: 4.5,
                              fontWeight: 500,
                              color: 'rgba(254,254,254,0.65)',
                              textTransform: 'uppercase',
                              marginTop: 1,
                            }}>Municipal Mayor</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              height: 12,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <span style={{
                                fontSize: 7,
                                fontStyle: 'italic',
                                color: C.white,
                                fontFamily: 'Georgia, serif',
                                transform: 'rotate(-3deg)',
                                display: 'inline-block',
                                opacity: 0.85,
                              }}>M. Santos</span>
                            </div>
                            <div style={{
                              fontSize: 4.5,
                              fontWeight: 500,
                              color: 'rgba(254,254,254,0.65)',
                              textTransform: 'uppercase',
                              borderTop: '1px solid rgba(254,254,254,0.3)',
                              paddingTop: 1,
                              marginTop: 1,
                            }}>OSCA Head / MSWDO</div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

                <p className="text-[10px] text-slate-400 italic">
                  * I-click ang card o pindutin ang "I-flip" button sa itaas upang tingnan ang kabilang panig ng ID.
                </p>
              </div>

              {/* Box 2: Scanned User Complete Demographic Information */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight">
                        Detalyadong Impormasyon
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">
                        Biometric e-Census Metadata Profile
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border
                    ${selectedSenior.status === 'Approved' ? 'bg-teal-50 border-teal-200 text-teal-600' : ''}
                    ${selectedSenior.status === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse' : ''}
                    ${selectedSenior.status === 'For Verification' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}
                    ${selectedSenior.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-600' : ''}
                    ${selectedSenior.status === 'Deactivated' ? 'bg-slate-50 border-slate-200 text-slate-500' : ''}
                  `}>
                    Status: {selectedSenior.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pangalan (Full Name)</span>
                    <p className="text-xs font-black text-slate-700 uppercase bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      {selectedSenior.firstName} {selectedSenior.middleName ? selectedSenior.middleName + ' ' : ''}{selectedSenior.lastName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Barangay ng Juban</span>
                    <p className="text-xs font-black text-teal-700 bg-teal-50/40 p-2.5 rounded-xl border border-teal-100">
                      {selectedSenior.barangay}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Kasarian (Gender)</span>
                    <p className="text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      {selectedSenior.sex}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Kapanganakan (Date of Birth)</span>
                    <p className="text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-150 font-mono">
                      {selectedSenior.birthdate} ({selectedSenior.age} taong gulang)
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Telepono (Contact Number)</span>
                    <p className="text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-150 font-mono">
                      {selectedSenior.contactNumber || 'N/A (Walang Isinumite)'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Social Pension Beneficiary</span>
                    <p className={`text-xs font-black p-2.5 rounded-xl border
                      ${selectedSenior.pensionBeneficiary 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                      {selectedSenior.pensionBeneficiary ? '✔ BENEPISYARYO (RECEIVING ₱1,000 PENSION)' : '❌ HINDI BENEPISYARYO'}
                    </p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Mga Karagdagang Remarks / Tala</span>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-150 leading-relaxed italic">
                      {selectedSenior.remarks || 'Walang karagdagang tala para sa senior citizen na ito.'}
                    </p>
                  </div>

                </div>

                {/* Additional design decoration alert block */}
                <div className="pt-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={14} />
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Ang Senior Citizen na ito ay opisyal na nakarehistro sa ilalim ng encoder na si <strong className="text-slate-700">{selectedSenior.registeredBy}</strong> noong <strong className="text-slate-700">{selectedSenior.registeredDate}</strong>. Ang profile na ito ay ganap na verified para sa lahat ng MSWDO benefits sa Juban, Sorsogon.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

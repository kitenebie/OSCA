import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { 
  ShieldCheck, 
  ClipboardList,
  LogIn, 
  Lock, 
  Building, 
  UserCheck, 
  Phone, 
  Calendar, 
  ArrowRight, 
  Award, 
  Heart, 
  CheckCircle, 
  AlertTriangle,
  Fingerprint,
  ArrowLeft,
  Users,
  FileText,
  MapPin,
  User,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION = 60; // seconds

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [viewMode, setViewMode] = useState<'landing' | 'login'>('landing');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Start lockout countdown
  const startLockout = () => {
    setIsLocked(true);
    setLockoutTimer(LOCKOUT_DURATION);
    
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsLocked(false);
          setLoginAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      showToast(`Naka-lock ang account. Subukan muli pagkatapos ng ${lockoutTimer} segundo.`, 'error');
      return;
    }

    if (!username.trim()) {
      showToast('Mangyaring isulat ang inyong username.', 'error');
      return;
    }

    if (!password.trim()) {
      showToast('Mangyaring isulat ang inyong password.', 'error');
      return;
    }

    if (username.length > 255) {
      showToast('Ang username ay hindi dapat lumampas sa 255 characters.', 'error');
      return;
    }

    if (password.length > 255) {
      showToast('Ang password ay hindi dapat lumampas sa 255 characters.', 'error');
      return;
    }

    const success = await login(username, password);
    if (success) {
      setLoginAttempts(0);
      showToast('Matagumpay na nakapasok sa LGU Portal!', 'success');
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        startLockout();
        showToast(`Tatlong beses nang mali ang pagka-login. Naka-lock ang account sa loob ng ${LOCKOUT_DURATION} segundo.`, 'error');
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
        showToast(`Hindi tugma ang username o password. ${remaining} na pagkakataon na lang.`, 'error');
      }
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-between p-4 md:p-8 relative overflow-x-hidden font-sans bg-cover bg-center bg-no-repeat selection:bg-teal-100 selection:text-teal-900 transition-all duration-550" 
      id="login-root-container"
      style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsJws2mCL8NSWT4kUePgLCL-0anWf-xOIPB3gv_GRAmg&s=10')" }}
    >
      
      <div className="absolute inset-0 bg-slate-50/93 backdrop-blur-[14px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 right-0 h-1.5 z-10" style={{ background: 'linear-gradient(to right, #FD0000 40%, #FDFE00 40% 60%, #0000FD 60%)' }}></div>

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between py-4 gap-4 border-b border-slate-200/60 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white border border-slate-150 rounded-full flex items-center justify-center p-1 shadow-sm">
            <img 
              referrerPolicy="no-referrer"
              src="/juban-logo.png" 
              alt="Juban Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold text-teal-600 tracking-wider uppercase font-mono">LGU JUBAN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 className="font-extrabold text-sm md:text-base text-slate-800 uppercase tracking-tight">Portal ng mga Senior Citizen</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'landing' ? (
            <button 
              onClick={() => setViewMode('login')}
              className="px-4 py-2 bg-teal-600 hover:bg-[#018c43] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Lock size={12} className="text-teal-400" />
              <span className="hidden min-[480px]:inline">Mag-login bilang Opisyal</span>
              <span className="min-[480px]:hidden inline">Portal Login</span>
            </button>
          ) : (
            <button 
              onClick={() => setViewMode('landing')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={12} className="text-emerald-700" />
              <span className="hidden min-[480px]:inline">Bumalik sa Landing Page</span>
              <span className="min-[480px]:hidden inline">Bumalik</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center relative z-10 py-6 md:py-10">
        {viewMode === 'landing' ? (
          /* ==================== LANDING VIEW ==================== */
          <div className="w-full space-y-10 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3.5">
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck size={13} className="text-emerald-600 animate-pulse" />
                  Sentralisadong Impormasyon para sa Nakatatanda
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-[1.1] uppercase">
                  Maagap na Serbisyo, <br/>
                  <span className="text-teal-600">Dekalidad na Alaga</span> <br/>
                  sa Bayan ng Juban
                </h1>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-xl">
                  Maligayang pagdating sa opisyal na portal ng e-Census, Profiling, at Benepisyo para sa mga Senior Citizen ng Juban, Sorsogon. Ang digital platform na ito ay binuo upang mapabilis ang ugnayan, pamamahagi ng tulong, at pagbibigay ng mas ligtas na proteksyon sa ating mga lolo at lola.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-lg bg-white/70 border border-slate-200/50 p-3 rounded-2xl shadow-sm">
                <div className="text-center p-2.5 bg-slate-50 rounded-xl">
                  <span className="block font-black text-lg md:text-xl text-teal-700">25</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Barangay Nodes</span>
                </div>
                <div className="text-center p-2.5 bg-slate-50 rounded-xl">
                  <span className="block font-black text-lg md:text-xl text-teal-600">100%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Libreng Profiling</span>
                </div>
                <div className="text-center p-2.5 bg-slate-50 rounded-xl">
                  <span className="block font-black text-lg md:text-xl text-[#FD0000]">₱1,000</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Buwanang Pension</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setViewMode('login')}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-[#018c43] text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95 w-full sm:w-auto"
                >
                  <span>Magsimula sa System (Portal Login)</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform text-teal-400" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Award size={14} className="text-amber-700" />
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider font-mono">Anunsyo</span>
                </div>
                <h3 className="font-bold text-sm text-amber-900 mb-1.5">Digital NFC OSCA ID Card</h3>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Ipinapaalam sa lahat ng senior citizens ng Juban na ang OSCA ay kasalukuyang namamahagi ng bagong Digital NFC OSCA ID Card upang mas mabilis at moderno ang pag-verify sa inyong mga benepisyo at pension.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-2.5">
                  <div className="p-1.5 bg-teal-50 rounded-lg border border-teal-100">
                    <Users size={13} className="text-teal-600" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Census</span>
                    <span className="text-[9px] text-slate-400">Population Data</span>
                  </div>
                </div>
                <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    <FileText size={13} className="text-emerald-600" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Profiling</span>
                    <span className="text-[9px] text-slate-400">Complete Records</span>
                  </div>
                </div>
                <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                    <MapPin size={13} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Mapping</span>
                    <span className="text-[9px] text-slate-400">Geo-Location</span>
                  </div>
                </div>
                <div className="bg-white/80 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-2.5">
                  <div className="p-1.5 bg-rose-50 rounded-lg border border-rose-100">
                    <Heart size={13} className="text-rose-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-700">Benefits</span>
                    <span className="text-[9px] text-slate-400">Pension & Aid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== HOW TO REGISTER SECTION ==================== */}
          <div className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-xl">
                <ClipboardList size={20} className="text-teal-600" />
              </div>
              <div>
                <h2 className="font-black text-lg md:text-xl text-slate-800 uppercase tracking-tight">Paano Mag-rehistro?</h2>
                <p className="text-[10px] text-slate-400 font-medium">How to Register?</p>
              </div>
            </div>

            {/* Tagalog Section */}
            <div className="space-y-5 mb-8">
              <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
                <span className="text-[9px] font-extrabold text-teal-700 uppercase tracking-widest font-mono">🇵🇭 TAGALOG</span>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed">
                Upang makapag-rehistro bilang Senior Citizen sa LGU Juban, kailangan puntahan ang inyong Barangay Hall o ang OSCA Office. Ang isang LGU Encoder ang magpa-fill up sa inyo ng mga sumusunod na hakbang:
              </p>

              {/* Step 1 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">1</div>
                  <h4 className="font-bold text-sm text-slate-700">Lokasyon at Address</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">Ibibigay ninyo ang inyong Region, Province, City/Town, Barangay, at kompletong address ng tirahan.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">2</div>
                  <h4 className="font-bold text-sm text-slate-700">Impormasyon sa Disaster Risk</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">Sasagutin kung nasa lugar ba kayo na mataas ang panganib sa kalamidad (baha, landslide, atbp.) at kung gaano kalala ang risk level.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">3</div>
                  <h4 className="font-bold text-sm text-slate-700">Personal na Impormasyon</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">Pupunan ang mga sumusunod:</p>
                <ul className="text-[11px] text-slate-500 pl-8 list-disc list-inside space-y-0.5">
                  <li><strong>Pangalan</strong> — First Name, Middle Name, Last Name, Suffix (kung meron)</li>
                  <li><strong>Contact</strong> — Mobile Number, Telephone (opsyonal), Email (opsyonal)</li>
                  <li><strong>Kapanganakan</strong> — Birthdate at Place of Birth</li>
                  <li><strong>Kasarian</strong> — Male o Female</li>
                  <li><strong>Civil Status</strong> — Single, Married, Widowed, Separated, o Divorced</li>
                  <li><strong>Blood Type</strong> — Uri ng dugo (A+, B+, O+, atbp.)</li>
                  <li><strong>Relihiyon</strong> — Roman Catholic, INC, Islam, atbp.</li>
                  <li><strong>Pinakamataas na Edukasyon</strong> — Elementary, High School, College, atbp.</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">4</div>
                  <h4 className="font-bold text-sm text-slate-700">Mga ID, Trabaho, at Status</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">Pupunan ang mga sumusunod:</p>
                <ul className="text-[11px] text-slate-500 pl-8 list-disc list-inside space-y-0.5">
                  <li><strong>Government IDs</strong> — GSIS, SSS, TIN, PhilHealth Number (kung meron)</li>
                  <li><strong>Employment Status</strong> — Retired, Unemployed, Self-Employed, atbp.</li>
                  <li><strong>Klasipikasyon</strong> — Regular, Indigent, PWD, Solo Parent, o Veteran</li>
                  <li><strong>Buwanang Pension</strong> — Kung tumatanggap ng pension at magkano</li>
                  <li><strong>Emergency Contact</strong> — Pangalan at contact number ng tatawagan sa emergency</li>
                  <li><strong>Valid ID Photo</strong> — Larawan ng inyong valid government ID (opsyonal)</li>
                </ul>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">5</div>
                  <h4 className="font-bold text-sm text-slate-700">Address Pin sa Mapa</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">I-pinpoint sa mapa ang eksaktong lokasyon ng inyong bahay para sa geotag record.</p>
              </div>

              {/* Step 6 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">6</div>
                  <h4 className="font-bold text-sm text-slate-700">Biometric na Litrato</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">Kukuhanan kayo ng portrait photo gamit ang camera para sa inyong OSCA ID at facial recognition.</p>
              </div>

              {/* Step 7 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">7</div>
                  <h4 className="font-bold text-sm text-slate-700">Digital na Pirma (Signature)</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">Pipirmahan ninyo sa digital signature pad bilang patunay ng inyong pagpaparehistro.</p>
              </div>

              {/* Step 8 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">8</div>
                  <h4 className="font-bold text-sm text-slate-700">Fingerprint Scan</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">Isa-scan ang inyong fingerprint gamit ang biometric device para sa secure na pagkakakilanlan.</p>
              </div>

              {/* Step 9 */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle size={12} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-700">Repaso at I-submit</h4>
                </div>
                <p className="text-[11px] text-slate-500 pl-8">Rerepasuhin ang lahat ng inyong impormasyon. Kapag tama na, i-submit na para sa approval ng OSCA.</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200/80 my-6"></div>

            {/* English Section */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                <span className="text-[9px] font-extrabold text-blue-700 uppercase tracking-widest font-mono">🇺🇸 ENGLISH</span>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed">
                To register as a Senior Citizen under LGU Juban, visit your Barangay Hall or the OSCA Office. An LGU Encoder will assist you in filling out the following steps:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700">Step 1 — Location & Address</span>
                  <p className="text-[10px] text-slate-500">Provide your Region, Province, City/Town, Barangay, and complete home address.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700">Step 2 — Disaster Risk Info</span>
                  <p className="text-[10px] text-slate-500">Indicate whether you live in a disaster-prone area (flood, landslide, etc.) and the severity level.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700">Step 3 — Personal Details</span>
                  <p className="text-[10px] text-slate-500">Full name, mobile number, birthdate, birthplace, sex, civil status, blood type, religion, and highest educational attainment.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700">Step 4 — IDs, Employment & Status</span>
                  <p className="text-[10px] text-slate-500">Government ID numbers (GSIS, SSS, TIN, PhilHealth), employment status, classification, monthly pension, and emergency contact.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700">Step 5 — Address Map Pin</span>
                  <p className="text-[10px] text-slate-500">Pinpoint your exact home location on the map for geotagging.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700">Step 6 — Biometric Photo</span>
                  <p className="text-[10px] text-slate-500">A portrait photo will be taken for your OSCA ID and facial recognition.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700">Step 7 — Digital Signature</span>
                  <p className="text-[10px] text-slate-500">Sign on the digital signature pad as proof of your registration.</p>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700">Step 8 — Fingerprint Scan</span>
                  <p className="text-[10px] text-slate-500">Your fingerprint will be scanned using a biometric device for secure identification.</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3 space-y-1 md:col-span-2">
                  <span className="text-[10px] font-bold text-emerald-700">Step 9 — Review & Submit</span>
                  <p className="text-[10px] text-slate-500">Review all your information for accuracy, then submit for OSCA approval. You will receive an SMS notification once approved.</p>
                </div>
              </div>

              {/* Reminder */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 mt-4">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-amber-800 font-bold">Paalala / Reminder:</p>
                  <p className="text-[10px] text-amber-700">Ang rehistrasyon ay <strong>LIBRE</strong> at walang bayad. Huwag magbigay ng pera kaninuman na nagsasabing kailangan magbayad. / Registration is <strong>FREE</strong>. Do not give money to anyone claiming payment is required.</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        ) : (
          /* ==================== LOGIN VIEW ==================== */
          <div className="w-full max-w-md mx-auto animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden">
              {/* Republic tri-color border stripe */}
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #FD0000 40%, #FDFE00 40% 60%, #0000FD 60%)' }}></div>
              <div className="p-8 space-y-6">
              
                {/* Login Header */}
                <div className="text-center space-y-2">
                  <div className="mx-auto w-14 h-14 bg-white border border-slate-150 rounded-full flex items-center justify-center p-1.5 shadow-sm">
                    <img referrerPolicy="no-referrer" src="/juban-logo.png" alt="Juban Logo" className="w-full h-full object-contain" />
                  </div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">LGU Juban Portal</h2>
                  <p className="text-[10px] text-slate-400 font-medium">OSCA Senior Citizen Management System</p>
                </div>

                {/* Lockout Warning */}
                {isLocked && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-600 shrink-0" />
                    <p className="text-[10px] text-red-700 font-medium">
                      Naka-lock ang account. Subukan muli pagkatapos ng <strong>{lockoutTimer}</strong> segundo.
                    </p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                        placeholder="Ilagay ang inyong username"
                        disabled={isLocked}
                        maxLength={255}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                        placeholder="Ilagay ang inyong password"
                        disabled={isLocked}
                        maxLength={255}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {loginAttempts > 0 && !isLocked && (
                    <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {MAX_LOGIN_ATTEMPTS - loginAttempts} na pagkakataon na lang bago ma-lock.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || isLocked}
                    className="w-full py-3 bg-teal-600 hover:bg-[#018c43] disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Naglo-load...
                      </span>
                    ) : (
                      <>
                        <LogIn size={13} />
                        Mag-login sa System
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <p className="text-center text-[9px] text-slate-400 font-medium">
                    Ang system na ito ay para lamang sa mga awtorisadong empleyado ng LGU Juban.
                  </p>
                  <div className="flex justify-center gap-3">
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <ShieldCheck size={10} className="text-emerald-500" />
                      <span>Secure Login</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400">
                      <Lock size={10} className="text-teal-500" />
                      <span>Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto pt-6 pb-3 border-t border-slate-200/60 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img referrerPolicy="no-referrer" src="/Bagong_Pilipinas_Logo.svg.webp" alt="Bagong Pilipinas" className="h-7 opacity-80" />
            <img referrerPolicy="no-referrer" src="/ph_logo.png" alt="Philippine Logo" className="h-7 opacity-80" />
          </div>
          <div className="text-center sm:text-right">
            <p className="text-[9px] text-slate-400 font-medium">
              © {new Date().getFullYear()} LGU Juban, Sorsogon • Office for Senior Citizens Affairs (OSCA)
            </p>
            <p className="text-[8px] text-slate-300 mt-0.5">
              Developed for the Municipality of Juban • Republic of the Philippines
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { 
  ShieldCheck, 
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
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
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
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-700 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle size={18} className="animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-widest block font-mono">MAHALAGANG ANUNSYO</span>
                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">Libreng Pagpapatala at Pamamahagi ng Bagong Digital NFC OSCA ID Cards</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ipinapaalam sa lahat ng senior citizens ng Juban na ang OSCA ay kasalukuyang namamahagi ng bagong Digital NFC OSCA ID Card upang mas mabilis at moderno ang pag-verify sa inyong mga benepisyo at pension.
                    </p>
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
              
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <ShieldCheck size={28} className="text-teal-600" />
                </div>
                <h2 className="font-black text-xl text-slate-800 uppercase tracking-tight">Portal Login</h2>
                <p className="text-xs text-slate-400">Mag-login gamit ang inyong credentials na ibinigay ng OSCA Admin.</p>
              </div>

              {/* Lockout Warning */}
              {isLocked && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-red-700">Account Temporarily Locked</p>
                    <p className="text-[10px] text-red-500">Subukan muli pagkatapos ng {lockoutTimer} segundo.</p>
                  </div>
                </div>
              )}

              {/* Login Attempts Warning */}
              {loginAttempts > 0 && loginAttempts < MAX_LOGIN_ATTEMPTS && !isLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700 font-medium">
                    {MAX_LOGIN_ATTEMPTS - loginAttempts} na pagkakataon na lang bago ma-lock ang account.
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.slice(0, 255))}
                      placeholder="I-type ang inyong username"
                      maxLength={255}
                      disabled={isLocked || isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value.slice(0, 255))}
                      placeholder="I-type ang inyong password"
                      maxLength={255}
                      disabled={isLocked || isLoading}
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isLocked}
                  className="w-full py-3.5 bg-teal-600 hover:bg-[#018c43] disabled:bg-slate-300 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Nagve-verify...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={15} />
                      <span>Mag-login</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 justify-center">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[9px] text-slate-400 font-medium">Secured with SHA-256 encryption • LGU Juban OSCA System</span>
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto pt-4 border-t border-slate-200/40 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-400 font-medium">
          <span>© 2026 LGU Juban, Sorsogon • Office for Senior Citizens Affairs (OSCA)</span>
          <span className="flex items-center gap-1">
            <Heart size={9} className="text-red-400" />
            Para sa mga Senior Citizen ng Bayan ng Juban
          </span>
        </div>
      </footer>
    </div>
  );
}

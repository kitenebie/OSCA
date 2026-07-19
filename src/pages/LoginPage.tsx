import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { 
  ShieldCheck, 
  LogIn, 
  Lock, 
  Sparkles, 
  Building, 
  UserCheck, 
  HelpCircle, 
  Phone, 
  Calendar, 
  ArrowRight, 
  Award, 
  Heart, 
  ChevronDown, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  Users,
  FileText,
  MapPin
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading, users } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const [username, setUsername] = useState('');
  const [viewMode, setViewMode] = useState<'landing' | 'login'>('landing');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      showToast('Mangyaring isulat ang inyong username.', 'error');
      return;
    }

    const success = await login(username);
    if (success) {
      showToast('Matagumpay na nakapasok sa LGU Portal!', 'success');
    } else {
      showToast('Error: Hindi nakita ang username o inactive ang user account.', 'error');
    }
  };

  const handleQuickLogin = async (usrname: string) => {
    setUsername(usrname);
    const success = await login(usrname);
    if (success) {
      showToast('Matagumpay na nakapasok sa LGU Portal!', 'success');
    } else {
      showToast('Error: Hindi nakita ang username.', 'error');
    }
  };

  const activeUsers = users.filter((u) => u.status === 'Active');

  return (
    <div 
      className="min-h-screen flex flex-col justify-between p-4 md:p-8 relative overflow-x-hidden font-sans bg-cover bg-center bg-no-repeat selection:bg-teal-100 selection:text-teal-900 transition-all duration-550" 
      id="login-root-container"
      style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsJws2mCL8NSWT4kUePgLCL-0anWf-xOIPB3gv_GRAmg&s=10')" }}
    >
      
      {/* Light Frosted Glass Overlay (Ensuring absolute professional contrast & readability, removing raw background pixelation) */}
      <div className="absolute inset-0 bg-slate-50/93 backdrop-blur-[14px] pointer-events-none z-0"></div>
      
      {/* Vibrant decorative radial light glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none z-0"></div>
      
      {/* Republic colors header stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 z-10"></div>

      {/* Persistent Navigation Bar (Landing Page Style) */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-4 border-b border-slate-200/60 relative z-10" id="portal-navigation-header">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white border border-slate-150 rounded-full flex items-center justify-center p-1 shadow-sm">
            <img 
              referrerPolicy="no-referrer"
              src="https://juban-boms.lguapps.com/wp-content/uploads/2025/08/cropped-jubanlogo-1.png" 
              alt="Juban Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase font-mono">LGU JUBAN</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h1 className="font-extrabold text-sm md:text-base text-slate-800 uppercase tracking-tight">Portal ng mga Senior Citizen</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'landing' ? (
            <button 
              onClick={() => setViewMode('login')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              id="goto-login-btn"
            >
              <Lock size={12} />
              <span>Mag-login bilang Opisyal</span>
            </button>
          ) : (
            <button 
              onClick={() => setViewMode('landing')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              id="goto-landing-btn"
            >
              <ArrowLeft size={12} />
              <span>Bumalik sa Landing Page</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Sections switcher with transition */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex items-center justify-center relative z-10 py-6 md:py-10">
        
        {viewMode === 'landing' ? (
          /* ==================== VIEW 1: GORGEOUS PUBLIC LANDING PAGE ==================== */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn" id="landing-view-container">
            
            {/* Left Side: Welcoming Hero Section */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3.5">
                <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100/60 text-teal-800 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Award size={13} className="text-teal-600 animate-pulse" />
                  Sentralisadong Impormasyon para sa Nakatatanda
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 tracking-tight leading-[1.1] uppercase">
                  Maagap na Serbisyo, <br />
                  <span className="text-teal-600">Dekalidad na Alaga</span> <br />
                  sa Bayan ng Juban
                </h1>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-xl">
                  Maligayang pagdating sa opisyal na portal ng e-Census, Profiling, at Benepisyo para sa mga Senior Citizen ng Juban, Sorsogon. Ang digital platform na ito ay binuo upang mapabilis ang ugnayan, pamamahagi ng tulong, at pagbibigay ng mas ligtas na proteksyon sa ating mga lolo at lola.
                </p>
              </div>

              {/* Quick statistics badge row */}
              <div className="grid grid-cols-3 gap-3 max-w-lg bg-white/70 border border-slate-200/50 p-3 rounded-2xl shadow-sm">
                <div className="text-center p-2.5 bg-slate-50 rounded-xl">
                  <span className="block font-black text-lg md:text-xl text-teal-600">25</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Barangay Hall Nodes</span>
                </div>
                <div className="text-center p-2.5 bg-slate-50 rounded-xl">
                  <span className="block font-black text-lg md:text-xl text-emerald-600">100%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Libreng Profiling</span>
                </div>
                <div className="text-center p-2.5 bg-slate-50 rounded-xl">
                  <span className="block font-black text-lg md:text-xl text-slate-800">₱1,000</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Buwanang Pension</span>
                </div>
              </div>

              {/* Action buttons on Landing Page */}
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setViewMode('login')}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-teal-600/15 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group active:scale-95"
                >
                  <span>Magsimula sa System (Portal Login)</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <a 
                  href="#announcements-section" 
                  className="px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Alamin ang Benepisyo</span>
                </a>
              </div>
            </div>

            {/* Right Side: Important Notice & Guides (Smooth Scroll Area) */}
            <div className="lg:col-span-6 space-y-4" id="announcements-section">
              
              {/* VERY IMPORTANT INFORMATION: NFC ID REGISTRATION NOTICE (Highlighted) */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-700 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle size={18} className="animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-widest block font-mono">
                      MAHALAGANG BALITA O ANUNSYO (IMPORTANT NOTICE)
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-snug">
                      Libreng Pagpapatala at Pamamahagi ng Bagong Digital NFC OSCA ID Cards
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ipinapaalam sa lahat ng senior citizens ng Juban na ang OSCA ay kasalukuyang namamahagi ng bagong **Digital NFC OSCA ID Card** upang mas mabilis at moderno ang pag-verify sa inyong mga benepisyo at pension. Dalhin ang mga sumusunod na kinakailangang dokumento.
                    </p>
                  </div>
                </div>

                {/* Requirements Inside */}
                <div className="bg-white/90 border border-amber-200/40 rounded-2xl p-4 space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-teal-600" />
                    Mga Requirements na Kailangang Isumite sa OSCA Office:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                      <span>Barangay Certificate of Residency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                      <span>Birth Certificate / Valid ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                      <span>Dalawang pirasong 1x1 Larawan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                      <span>Marriage Contract (kung may asawa)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informative Cards Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Privileges */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-teal-200/80 hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-teal-50 rounded-xl text-teal-600 flex items-center justify-center">
                      <Award size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">RA 9994 Act Privileges</h4>
                      <span className="text-[9px] text-slate-400 block font-mono">Discounts & Exemptions</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-500 leading-normal">
                    <li className="flex items-start gap-1">
                      <span className="text-teal-600 font-bold">•</span>
                      <span><strong>20% discount & VAT exempt</strong> sa mga gamot at medical supplies.</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>Discounts sa pamasahe, restaurant bills, at hospital fees.</span>
                    </li>
                  </ul>
                </div>

                {/* Pension Payout Info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-teal-200/80 hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Social Pension Schedule</h4>
                      <span className="text-[9px] text-slate-400 block font-mono">Distribution Schedule</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-500 leading-normal">
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>Ipinapamahagi ang ₱1,000 monthly pension kada quarter sa inyong barangay hall.</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>Ang system ay awtomatikong magpapadala ng SMS sa inyong mobile phone.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Emergency Info Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                    <Phone size={15} />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wide">OSCA Help Desk Hotline</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">Tumawag para sa anumang katanungan o reklamo:</p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 font-bold">
                  HOTLINE: 0917-888-OSCA (6722)
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* ==================== VIEW 2: DEDICATED SECURE LOGIN FORM ==================== */
          <div className="w-full max-w-md mx-auto animate-fadeIn" id="login-view-container">
            
            <div className="w-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 p-6 md:p-8 flex flex-col" id="login-main-card">
              
              {/* Seal Header */}
              <div className="text-center space-y-3 mb-8" id="login-header-section">
                <div className="mx-auto w-20 h-20 bg-teal-50/50 border border-teal-100/60 flex items-center justify-center p-2 rounded-full shadow-sm relative">
                  <div className="absolute inset-1 rounded-full border border-dashed border-teal-200"></div>
                  <img 
                    referrerPolicy="no-referrer"
                    src="https://juban-boms.lguapps.com/wp-content/uploads/2025/08/cropped-jubanlogo-1.png" 
                    alt="Juban LGU Logo" 
                    className="w-full h-full object-contain"
                    id="login-lgu-logo"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <span className="inline-block text-[9px] font-bold text-teal-700 font-mono tracking-widest uppercase bg-teal-50 px-3 py-0.5 rounded-full border border-teal-100/50">
                    OFFICIAL LOGIN PORTAL
                  </span>
                  <h2 className="font-extrabold text-lg text-slate-800 uppercase tracking-tight">
                    Mag-login sa System
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Gamitin ang opisyal na account upang buksan ang e-Census database.
                  </p>
                </div>
              </div>

              {/* Official Login Credentials Form */}
              <form onSubmit={handleLogin} className="space-y-5" id="login-form">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="login-username" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Username ng Opisyal / Encoder
                    </label>
                    <span className="text-[9px] text-teal-600 font-bold flex items-center gap-1 font-mono">
                      <ShieldCheck size={11} className="text-teal-600" />
                      SECURE
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <Lock size={14} />
                    </span>
                    <input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Isulat ang username (e.g. superadmin)"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded-2xl text-xs text-slate-850 placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-4 focus:ring-teal-500/10 font-mono transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold text-white rounded-2xl shadow-md shadow-teal-600/15 hover:shadow-lg transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  id="login-submit-btn"
                >
                  <LogIn size={13} className={isLoading ? 'animate-spin' : ''} />
                  <span>{isLoading ? 'Sumusuri sa System...' : 'Magsimula (Login to Portal)'}</span>
                </button>
              </form>

              {/* Demo Accounts List panel inside Form */}
              <div className="mt-6 border-t border-slate-100 pt-5" id="login-demo-panel">
                <div className="flex items-center gap-2 text-slate-400 mb-3 justify-center">
                  <Sparkles size={11} className="text-teal-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mabilis na Access (Demo Accounts)</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {activeUsers.slice(0, 4).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleQuickLogin(user.username)}
                      className="p-2.5 bg-slate-50 hover:bg-teal-50/50 border border-slate-150 hover:border-teal-200 rounded-2xl flex items-center gap-2 text-left transition-all group active:scale-[0.98] cursor-pointer"
                      id={`quick-login-${user.username}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-white text-teal-600 border border-slate-200 flex items-center justify-center shrink-0 font-bold text-[10px] font-mono">
                        {user.fullName.split(' ').pop()?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-[10px] text-slate-700 truncate group-hover:text-teal-600 transition-colors">{user.fullName}</h5>
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase truncate tracking-wider">{user.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Return to home link */}
              <button 
                onClick={() => setViewMode('landing')}
                className="mt-5 text-center text-xs text-slate-400 hover:text-teal-600 font-bold transition-colors cursor-pointer"
              >
                ← Bumalik sa Landing Page (Guest Mode)
              </button>

            </div>

          </div>
        )}

      </main>

      {/* Professional Footer */}
      <footer className="w-full max-w-7xl mx-auto border-t border-slate-200/60 py-5 flex flex-col md:flex-row items-center justify-between gap-3 relative z-10" id="login-footer">
        <p className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
          PORTAL VERSION 1.0.0 • BAYAN NG JUBAN, SORSOGON LGU
        </p>
        <p className="text-[8.5px] text-slate-400 leading-relaxed font-semibold max-w-md text-center md:text-right">
          Ang system na ito ay sumusunod sa Data Privacy Act of 2012 ng Pilipinas. Lahat ng personal na impormasyon ay pinangangalagaan ng LGU.
        </p>
      </footer>

    </div>
  );
}


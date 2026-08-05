import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import { useBarangays } from '../../hooks/useBarangays';
import { useUIStore } from '../../store/uiStore';
import { UserPlus, ToggleLeft, ToggleRight, Trash2, Mail, Phone, MapPin, KeyRound, ShieldAlert, Check, Pencil, X, Eye, EyeOff, Lock } from 'lucide-react';

// SHA-256 hash function (same as login page)
async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback pure JS SHA-256
  function rightRotate(value: number, amount: number) { return (value >>> amount) | (value << (32 - amount)); }
  const k = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  const encoder = new TextEncoder();
  const msg = encoder.encode(password);
  const bitLength = msg.length * 8;
  const padding = new Uint8Array(((msg.length + 9 + 63) & ~63));
  padding.set(msg);
  padding[msg.length] = 0x80;
  const view = new DataView(padding.buffer);
  view.setUint32(padding.length - 4, bitLength, false);
  for (let offset = 0; offset < padding.length; offset += 64) {
    const w = new Array(64);
    for (let i=0;i<16;i++) w[i]=view.getUint32(offset+i*4,false);
    for (let i=16;i<64;i++){const s0=(rightRotate(w[i-15],7)^rightRotate(w[i-15],18)^(w[i-15]>>>3));const s1=(rightRotate(w[i-2],17)^rightRotate(w[i-2],19)^(w[i-2]>>>10));w[i]=(w[i-16]+s0+w[i-7]+s1)|0;}
    let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
    for(let i=0;i<64;i++){const S1=rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25);const ch=(e&f)^(~e&g);const temp1=(h+S1+ch+k[i]+w[i])|0;const S0=rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22);const maj=(a&b)^(a&c)^(b&c);const temp2=(S0+maj)|0;h=g;g=f;f=e;e=(d+temp1)|0;d=c;c=b;b=a;a=(temp1+temp2)|0;}
    h0=(h0+a)|0;h1=(h1+b)|0;h2=(h2+c)|0;h3=(h3+d)|0;h4=(h4+e)|0;h5=(h5+f)|0;h6=(h6+g)|0;h7=(h7+h)|0;
  }
  return [h0,h1,h2,h3,h4,h5,h6,h7].map(v=>(v>>>0).toString(16).padStart(8,'0')).join('');
}

// Password strength validation
interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

function validatePassword(password: string): PasswordValidation {
  return {
    isValid: password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

// Password strength indicator component
function PasswordStrengthIndicator({ validation }: { validation: PasswordValidation }) {
  const checks = [
    { label: 'Hindi bababa sa 8 characters', passed: validation.hasMinLength },
    { label: 'May malaking letra (A-Z)', passed: validation.hasUppercase },
    { label: 'May maliit na letra (a-z)', passed: validation.hasLowercase },
    { label: 'May numero (0-9)', passed: validation.hasNumber },
    { label: 'May special character (!@#$...)', passed: validation.hasSpecialChar },
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const strengthColor = passedCount <= 2 ? 'bg-red-500' : passedCount <= 3 ? 'bg-amber-500' : passedCount <= 4 ? 'bg-teal-400' : 'bg-teal-600';
  const strengthLabel = passedCount <= 2 ? 'Mahina' : passedCount <= 3 ? 'Katamtaman' : passedCount <= 4 ? 'Malakas' : 'Napakalakas';

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(passedCount / 5) * 100}%` }} />
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${passedCount <= 2 ? 'text-red-500' : passedCount <= 3 ? 'text-amber-500' : 'text-teal-600'}`}>
          {strengthLabel}
        </span>
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-1 gap-0.5">
        {checks.map((check, i) => (
          <div key={i} className={`flex items-center gap-1.5 text-[9.5px] font-medium ${check.passed ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`}>
            {check.passed ? <Check size={10} className="text-teal-500 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserManagement() {
  const { barangays: barangaysData } = useBarangays();
  const { users, addUser, updateUser, deleteUser, currentUser, hasPermission } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    role: 'Barangay Encoder' as User['role'],
    barangayAssigned: '',
    contactNumber: '',
    email: '',
    status: 'Active' as const
  });

  // Password fields for Create
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);

  // Edit modal state
  const [editModal, setEditModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [editForm, setEditForm] = useState({
    fullName: '',
    username: '',
    role: '',
    barangayAssigned: '',
    contactNumber: '',
    email: '',
    status: 'Active' as User['status'],
  });

  // Password fields for Edit (optional - only if changing)
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const roles = useAuthStore((s) => s.roles);

  const openEditModal = (user: User) => {
    setEditForm({
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      barangayAssigned: user.barangayAssigned || '',
      contactNumber: user.contactNumber,
      email: user.email,
      status: user.status,
    });
    setEditPassword('');
    setEditConfirmPassword('');
    setShowEditPassword(false);
    setShowEditConfirm(false);
    setEditModal({ open: true, user });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.user) return;

    // If password fields are filled, validate
    if (editPassword || editConfirmPassword) {
      const validation = validatePassword(editPassword);
      if (!validation.isValid) {
        showToast('Ang password ay hindi sapat na malakas. Tingnan ang mga requirement.', 'error');
        return;
      }
      if (editPassword !== editConfirmPassword) {
        showToast('Hindi magkatugma ang password at confirmation!', 'error');
        return;
      }
    }

    try {
      const updateData: Record<string, unknown> = { ...editForm };
      if (editPassword) {
        updateData.password = await hashPassword(editPassword);
      }
      await updateUser(editModal.user.id, updateData);
      showToast(`Matagumpay na na-update si ${editForm.fullName}!`, 'success');
      setEditModal({ open: false, user: null });
      setEditPassword('');
      setEditConfirmPassword('');
    } catch {
      showToast('Hindi ma-update ang user. Subukan muli.', 'error');
    }
  };

  const handleToggleStatus = (id: string, currentStatus: User['status']) => {
    if (currentUser && currentUser.id === id) {
      showToast('Hindi mo maaaring i-deactivate ang sarili mong account!', 'error');
      return;
    }
    const nextStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';
    updateUser(id, { status: nextStatus });
    showToast(`Account status updated to ${nextStatus}!`, 'success');
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (currentUser && currentUser.id === id) {
      showToast('Hindi mo maaaring i-delete ang sarili mong account!', 'error');
      return;
    }
    if (confirm(`Sigurado ka bang nais mong tanggalin si ${name} bilang system user?`)) {
      deleteUser(id);
      showToast(`Account ni ${name} ay tinanggal na sa system.`, 'warning');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (users.some((u) => u.username.toLowerCase() === formData.username.toLowerCase())) {
      showToast('Error: Ang username na ito ay nakarehistro na.', 'error');
      return;
    }

    // Validate password
    const validation = validatePassword(createPassword);
    if (!validation.isValid) {
      showToast('Ang password ay hindi sapat na malakas. Tingnan ang mga requirement.', 'error');
      return;
    }
    if (createPassword !== createConfirmPassword) {
      showToast('Hindi magkatugma ang password at confirmation!', 'error');
      return;
    }

    try {
      const hashedPw = await hashPassword(createPassword);
      await addUser({ ...formData, password: hashedPw });
      showToast(`Matagumpay na naidagdag si ${formData.fullName}!`, 'success');
      
      // Reset form
      setFormData({
        username: '',
        fullName: '',
        role: 'Barangay Encoder',
        barangayAssigned: '',
        contactNumber: '',
        email: '',
        status: 'Active'
      });
      setCreatePassword('');
      setCreateConfirmPassword('');
      setShowCreatePassword(false);
      setShowCreateConfirm(false);
      setIsOpen(false);
    } catch {
      showToast('Hindi mairehistro ang user. Subukan muli.', 'error');
    }
  };

  const createValidation = validatePassword(createPassword);
  const editValidation = validatePassword(editPassword);

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">Mga System User at Encoder</h4>
          <p className="text-[11px] text-slate-400">List of personnel allowed to log in and profile senior citizens</p>
        </div>
        
        {(hasPermission('canCreateUser') || hasPermission('canManageUsers')) && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white rounded-xl shadow-md shadow-teal-600/10 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <UserPlus size={14} />
            <span>Magdagdag ng User</span>
          </button>
        )}
      </div>

      {/* Main Grid: User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const isActive = user.status === 'Active';
          const isMe = currentUser?.id === user.id;

          return (
            <div 
              key={user.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-all duration-200 relative overflow-hidden
                ${isActive ? 'border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700 opacity-60 bg-slate-50/50 dark:bg-slate-900/50'}`}
            >
              {/* Highlight current logged user */}
              {isMe && (
                <div className="absolute top-0 right-0 bg-teal-600 text-white text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  IKAW (YOU)
                </div>
              )}

              {/* User Bio Header */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-100/50 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight truncate">{user.fullName}</h5>
                    <p className="text-[10px] text-slate-400 font-medium font-mono uppercase mt-0.5 tracking-wide">{user.role}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-2">
                    <KeyRound size={12} className="text-slate-400 shrink-0" />
                    <span>Username: <strong className="text-slate-700 dark:text-slate-200 font-mono">{user.username}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span>{user.contactNumber}</span>
                  </div>
                  {user.barangayAssigned && (
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold">
                      <MapPin size={12} className="text-teal-500 shrink-0" />
                      <span>Assigned: Brgy. {user.barangayAssigned}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer status toggle & delete row */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                {(hasPermission('canEditUser') || hasPermission('canManageUsers')) ? (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(user.id, user.status)}
                    className={`flex items-center gap-1.5 text-[10.5px] font-bold transition-all cursor-pointer
                      ${isActive ? 'text-teal-600 hover:text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {isActive ? <ToggleRight size={20} className="text-teal-600" /> : <ToggleLeft size={20} className="text-slate-300" />}
                    <span>{isActive ? 'Aktibo (Active)' : 'Naka-deactivate'}</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {isActive ? 'Aktibo' : 'Naka-deactivate'}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {(hasPermission('canEditUser') || hasPermission('canManageUsers')) && (
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all cursor-pointer"
                      title="I-edit ang user"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  {(hasPermission('canDeleteUser') || hasPermission('canManageUsers')) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user.id, user.fullName)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer"
                      title="Remove account"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ====== Add User Modal ====== */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[900] animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">Magrehistro ng System User</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pangalan (Full Name)</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Maria Clara dela Cruz"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    placeholder="e.g. mclara"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.role} value={r.role}>{r.role}</option>
                      ))
                    ) : (
                      <>
                        <option value="super-admin">super-admin</option>
                        <option value="brgy-admin">brgy-admin</option>
                        <option value="general-encoder">general-encoder</option>
                        <option value="brgy-encoder">brgy-encoder</option>
                        <option value="brgy-viewer">brgy-viewer</option>
                        <option value="general-viewer">general-viewer</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assigned Barangay</label>
                <select
                  value={formData.barangayAssigned}
                  onChange={(e) => setFormData({ ...formData, barangayAssigned: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">-- Walang Assigned --</option>
                  {barangaysData.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">E-mail Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. m.clara@carmonagov.ph"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Contact Number</label>
                <input
                  type="text"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g. +63 917 111 2222"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* ====== PASSWORD SECTION (Create) ====== */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={13} className="text-teal-600" />
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Password Security</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Ilagay ang password"
                      maxLength={128}
                      className="w-full px-4 py-2 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCreatePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {createPassword && <PasswordStrengthIndicator validation={createValidation} />}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kumpirmahin ang Password</label>
                  <div className="relative">
                    <input
                      type={showCreateConfirm ? 'text' : 'password'}
                      required
                      value={createConfirmPassword}
                      onChange={(e) => setCreateConfirmPassword(e.target.value)}
                      placeholder="Ulitin ang password"
                      maxLength={128}
                      className={`w-full px-4 py-2 pr-10 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none ${
                        createConfirmPassword && createConfirmPassword !== createPassword
                          ? 'border-red-400 dark:border-red-600'
                          : createConfirmPassword && createConfirmPassword === createPassword
                          ? 'border-teal-400 dark:border-teal-600'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreateConfirm(!showCreateConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCreateConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {createConfirmPassword && createConfirmPassword !== createPassword && (
                    <p className="text-[9.5px] text-red-500 font-semibold flex items-center gap-1">
                      <ShieldAlert size={10} /> Hindi magkatugma ang password!
                    </p>
                  )}
                  {createConfirmPassword && createConfirmPassword === createPassword && (
                    <p className="text-[9.5px] text-teal-600 font-semibold flex items-center gap-1">
                      <Check size={10} /> Magkatugma ang password ✓
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3.5 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!createValidation.isValid || createPassword !== createConfirmPassword}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white rounded-xl shadow-md shadow-teal-600/10 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check size={13} />
                  <span>I-save at irehistro</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ====== Edit User Modal (Animated) ====== */}
      {editModal.open && editModal.user && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={() => setEditModal({ open: false, user: null })}
          ></div>
          
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_250ms_ease-out]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">I-edit ang User</h3>
              <button 
                onClick={() => setEditModal({ open: false, user: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Username</label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    {roles.length > 0 ? (
                      roles.map((r) => (
                        <option key={r.role} value={r.role}>{r.role}</option>
                      ))
                    ) : (
                      <>
                        <option value="super-admin">super-admin</option>
                        <option value="brgy-admin">brgy-admin</option>
                        <option value="general-encoder">general-encoder</option>
                        <option value="brgy-encoder">brgy-encoder</option>
                        <option value="brgy-viewer">brgy-viewer</option>
                        <option value="general-viewer">general-viewer</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assigned Barangay</label>
                <select
                  value={editForm.barangayAssigned}
                  onChange={(e) => setEditForm({ ...editForm, barangayAssigned: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">-- Walang Assigned --</option>
                  {barangaysData.map((b) => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">E-mail</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Contact Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.contactNumber}
                    onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as User['status'] })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              {/* ====== PASSWORD SECTION (Edit - Optional) ====== */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={13} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Palitan ang Password (Opsyonal)</span>
                </div>
                <p className="text-[9.5px] text-slate-400 -mt-1">Iwanang blangko kung hindi papalitan ang password.</p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Bagong Password</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Ilagay ang bagong password"
                      maxLength={128}
                      className="w-full px-4 py-2 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showEditPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {editPassword && <PasswordStrengthIndicator validation={editValidation} />}
                </div>

                {editPassword && (
                  <div className="space-y-1.5 animate-[fadeIn_200ms_ease-out]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kumpirmahin ang Bagong Password</label>
                    <div className="relative">
                      <input
                        type={showEditConfirm ? 'text' : 'password'}
                        value={editConfirmPassword}
                        onChange={(e) => setEditConfirmPassword(e.target.value)}
                        placeholder="Ulitin ang bagong password"
                        maxLength={128}
                        className={`w-full px-4 py-2 pr-10 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none ${
                          editConfirmPassword && editConfirmPassword !== editPassword
                            ? 'border-red-400 dark:border-red-600'
                            : editConfirmPassword && editConfirmPassword === editPassword
                            ? 'border-teal-400 dark:border-teal-600'
                            : 'border-slate-200 dark:border-slate-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditConfirm(!showEditConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showEditConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {editConfirmPassword && editConfirmPassword !== editPassword && (
                      <p className="text-[9.5px] text-red-500 font-semibold flex items-center gap-1">
                        <ShieldAlert size={10} /> Hindi magkatugma ang password!
                      </p>
                    )}
                    {editConfirmPassword && editConfirmPassword === editPassword && (
                      <p className="text-[9.5px] text-teal-600 font-semibold flex items-center gap-1">
                        <Check size={10} /> Magkatugma ang password ✓
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, user: null })}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-600 cursor-pointer"
                >
                  Kanselahin
                </button>
                <button
                  type="submit"
                  disabled={editPassword ? (!editValidation.isValid || editPassword !== editConfirmPassword) : false}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check size={13} />
                  <span>I-update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

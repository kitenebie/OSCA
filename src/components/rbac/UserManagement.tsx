import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User } from '../../types';
import barangaysData from '../../Dummy/data/barangays.json';
import { useUIStore } from '../../store/uiStore';
import { UserPlus, ToggleLeft, ToggleRight, Trash2, Mail, Phone, MapPin, KeyRound, ShieldAlert, Check } from 'lucide-react';

export default function UserManagement() {
  const { users, addUser, updateUser, deleteUser, currentUser } = useAuthStore();
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

  const handleToggleStatus = (id: string, currentStatus: User['status']) => {
    if (currentUser && currentUser.id === id) {
      showToast('Hindi mo maaaring i-deactivate ang sarili mong account!', 'error');
      return;
    }
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (users.some((u) => u.username.toLowerCase() === formData.username.toLowerCase())) {
      showToast('Error: Ang username na ito ay nakarehistro na.', 'error');
      return;
    }

    addUser(formData);
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
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">Mga System User at Encoder</h4>
          <p className="text-[11px] text-slate-400">List of personnel allowed to log in and profile senior citizens</p>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white rounded-xl shadow-md shadow-teal-600/10 transition-all duration-150 active:scale-95"
        >
          <UserPlus size={14} />
          <span>Magdagdag ng User</span>
        </button>
      </div>

      {/* Main Grid: User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const isActive = user.status === 'Active';
          const isMe = currentUser?.id === user.id;

          return (
            <div 
              key={user.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between transition-all duration-200 relative overflow-hidden
                ${isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'}`}
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
                  <div className="w-11 h-11 rounded-full bg-teal-50 border border-teal-100/50 text-teal-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-sm text-slate-800 leading-tight truncate">{user.fullName}</h5>
                    <p className="text-[10px] text-slate-400 font-medium font-mono uppercase mt-0.5 tracking-wide">{user.role}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <KeyRound size={12} className="text-slate-400 shrink-0" />
                    <span>Username: <strong className="text-slate-700 font-mono">{user.username}</strong></span>
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
                    <div className="flex items-center gap-2 text-teal-600 font-semibold">
                      <MapPin size={12} className="text-teal-500 shrink-0" />
                      <span>Assigned: Brgy. {user.barangayAssigned}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer status toggle & delete row */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(user.id, user.status)}
                  className={`flex items-center gap-1.5 text-[10.5px] font-bold transition-all
                    ${isActive ? 'text-teal-600 hover:text-teal-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {isActive ? <ToggleRight size={20} className="text-teal-600" /> : <ToggleLeft size={20} className="text-slate-300" />}
                  <span>{isActive ? 'Aktibo (Active)' : 'Naka-deactivate'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteUser(user.id, user.fullName)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove account"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[900] animate-fadeIn">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full border border-slate-200 shadow-2xl">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Magrehistro ng System User</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pangalan (Full Name)</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Maria Clara dela Cruz"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
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
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="MSWDO Officer">MSWDO Officer</option>
                    <option value="Barangay Encoder">Barangay Encoder</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              {formData.role === 'Barangay Encoder' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assigned Barangay</label>
                  <select
                    required
                    value={formData.barangayAssigned}
                    onChange={(e) => setFormData({ ...formData, barangayAssigned: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-medium"
                  >
                    <option value="">-- Pumili ng Barangay --</option>
                    {barangaysData.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">E-mail Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. m.clara@carmonagov.ph"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
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
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white rounded-xl shadow-md shadow-teal-600/10 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Check size={13} />
                  <span>I-save at irehistro</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

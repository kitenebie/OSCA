import React from 'react';
import UserManagement from '../components/rbac/UserManagement';
import RoleGuard from '../components/rbac/RoleGuard';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function UserManagementPage() {
  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Page Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm md:text-base">System Access Control and Audits</h4>
        <p className="text-[11px] text-slate-400">Configure encoder accounts, toggle security logins, and manage RBAC profiles</p>
      </div>

      {/* Role Guard wrapping the actual component */}
      <RoleGuard
        permission="canManageUsers"
        fallback={
          <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 shadow-sm mb-4 shrink-0">
              <ShieldAlert size={28} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">SYSTEM ACCESS CONTROL: Access Denied</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mt-2">
              This page is reserved for the **Super Admin** of LGU Juban only. Your account has not been granted permission to view or modify the system user directory.
            </p>
          </div>
        }
      >
        <UserManagement />
      </RoleGuard>

    </div>
  );
}

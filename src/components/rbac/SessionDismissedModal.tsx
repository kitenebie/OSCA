import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';

interface SessionDismissedModalProps {
  isOpen: boolean;
  terminatedBy: string;
  onAcknowledge: () => void;
}

export default function SessionDismissedModal({ isOpen, terminatedBy, onAcknowledge }: SessionDismissedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-bold text-slate-800 mb-2">
          Session Terminated
        </h2>

        {/* Message */}
        <p className="text-center text-sm text-slate-500 mb-2">
          Your session has been dismissed by:
        </p>
        <p className="text-center text-base font-bold text-red-600 mb-4">
          {terminatedBy}
        </p>

        <p className="text-center text-xs text-slate-400 mb-6 leading-relaxed">
          An administrator has ended your active session. You will be logged out automatically.
          Please contact your admin if you believe this was done in error.
        </p>

        {/* Divider */}
        <div className="border-t border-slate-100 mb-5" />

        {/* Button */}
        <button
          onClick={onAcknowledge}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
        >
          <LogOut size={16} />
          Understood, Log Me Out
        </button>
      </div>
    </div>
  );
}

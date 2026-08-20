import React from 'react';
import InlineFaceCapture from '../../profiling/InlineFaceCapture';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function BiometricsPhoto({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 max-w-full animate-fadeIn">
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">Biometric Profile Photo (Camera Sync)</h5>
          <p className="text-sm text-slate-400">A clear biometric profile shot against a bright background is required for ID Card rendering.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
            Step 7 of 11
          </span>
        </div>
      </div>

      <InlineFaceCapture
        value={form.profilePhoto}
        onChange={(img) => setForm({ ...form, profilePhoto: img })}
      />
    </div>
  );
}

import React from 'react';
import SignaturePad from '../../profiling/SignaturePad';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function SignaturePadStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">E-Lagda Digital Signature Pad</h5>
          <p className="text-sm text-slate-400">Digitize the senior's signature by drawing with a mouse or touch-pen on the tablet.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
            Step 8 of 11
          </span>
        </div>
      </div>

      <SignaturePad
        value={form.signatureData}
        onChange={(sig) => setForm({ ...form, signatureData: sig })}
      />
    </div>
  );
}

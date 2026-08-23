import React from 'react';
import SignaturePad from '../../profiling/SignaturePad';
import { PenTool } from 'lucide-react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function SignaturePadStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">E-Lagda Digital Signature Pad</h5>
          <p className="text-sm text-slate-400">Digitize the senior's signature by drawing with a mouse, touch-pen, or stylus.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
            Step 8 of 11
          </span>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
        <PenTool size={14} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-indigo-600 leading-relaxed">
          Pindutin ang <strong>"Gumawa ng Signature"</strong> para mag-open ng fullscreen signing canvas. Matapos mag-sign, pindutin ang <strong>"Complete"</strong> para ma-auto-crop at ma-save ang iyong signature.
        </p>
      </div>

      {/* Signature Pad — Senior Citizen's Signature */}
      <div className="space-y-2">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Senior Citizen's Signature
        </h6>
        <SignaturePad
          value={form.signatureData}
          onChange={(sig) => setForm({ ...form, signatureData: sig })}
          fieldId="step8-senior-signature"
          showUsbButton={true}
        />
      </div>
    </div>
  );
}

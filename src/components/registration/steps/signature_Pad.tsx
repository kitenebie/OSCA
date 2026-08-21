import React from 'react';
import SignaturePad from '../../profiling/SignaturePad';
import { Usb, PenTool } from 'lucide-react';
import { useUsbSignaturePad } from '../../../contexts/UsbSignaturePadContext';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function SignaturePadStep({ form, setForm }: StepProps) {
  const usbPad = useUsbSignaturePad();

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">E-Lagda Digital Signature Pad</h5>
          <p className="text-sm text-slate-400">Digitize the senior's signature by drawing with a mouse, touch-pen, or USB signature pad.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
            Step 8 of 11
          </span>
        </div>
      </div>

      {/* USB Device Status Banner */}
      <div className={`rounded-xl border p-3 flex items-center gap-3 transition-all ${
        usbPad.isConnected
          ? 'bg-green-50 border-green-200'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          usbPad.isConnected ? 'bg-green-100' : 'bg-slate-100'
        }`}>
          <Usb size={16} className={usbPad.isConnected ? 'text-green-600' : 'text-slate-400'} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-bold ${usbPad.isConnected ? 'text-green-700' : 'text-slate-600'}`}>
            {usbPad.isConnected ? 'USB Signature Pad Connected' : 'USB Signature Pad'}
          </p>
          <p className="text-[11px] text-slate-400">
            {usbPad.isConnected
              ? 'Device ready. Click "Activate USB Signature Pad" below to direct output here.'
              : 'Click "Activate USB Signature Pad" below to connect your USB signature pad device.'
            }
          </p>
        </div>
        {usbPad.isConnected && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[11px] font-semibold text-green-600">Connected</span>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
        <PenTool size={14} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-indigo-600 leading-relaxed">
          You can sign directly on the canvas using mouse/touch OR click <strong>"Activate USB Signature Pad"</strong> to receive input from a connected USB signature pad device. Only one field can be active at a time across all steps.
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

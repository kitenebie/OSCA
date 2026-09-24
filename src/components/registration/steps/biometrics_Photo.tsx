import InlineFaceCapture from '../../profiling/InlineFaceCapture';
import FingerprintScanner from '../../fingerprint/FingerprintScanner';

interface StepProps {
  form: any;
  setForm: (form: any) => void;
}

export default function BiometricsPhoto({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 max-w-full animate-fadeIn">
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">VII. Biometrics & Photo</h5>
          <p className="text-sm text-slate-400">Capture a profile photo and test the U.are.U 4500 scanner.</p>
        </div>
        <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">Step 7 of 11</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h6 className="text-sm font-bold text-slate-800">Profile Photo (2×2)</h6>
          <InlineFaceCapture value={form.profilePhoto} onChange={(img) => setForm({ ...form, profilePhoto: img })} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <FingerprintScanner />
          <p className="text-xs text-slate-500">Fingerprint enrollment is not yet available. This test does not attach a fingerprint credential to the senior's record.</p>
        </div>
      </div>
    </div>
  );
}

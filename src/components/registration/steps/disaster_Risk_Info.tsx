import React from 'react';
import CustomSelect from '../../ui/CustomSelect';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function DisasterRiskInfo({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 max-w-full animate-fadeIn">
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">X. Disaster Risk Profiling</h5>
          <p className="text-sm text-slate-400">Determine if the residence is within disaster-prone sectors in LGU Juban.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
            Step 10 of 11
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Nasa Risk Area Ba? <span className="text-red-500">*</span></label>
            <CustomSelect
              value={form.inRiskArea}
              onChange={(val) => setForm({ ...form, inRiskArea: val as 'yes' | 'no' })}
              options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]}
              placeholder="Select..."
            />
          </div>

          {form.inRiskArea === 'yes' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Risk Type <span className="text-red-500">*</span></label>
              <CustomSelect
                value={form.riskType}
                onChange={(val) => setForm({ ...form, riskType: val })}
                options={[
                  { value: 'Flooding', label: 'Flooding (Pagbaha)' },
                  { value: 'Landslide', label: 'Landslide (Pagguho ng lupa)' },
                  { value: 'Storm Surge', label: 'Storm Surge (Daluyong)' },
                  { value: 'Volcanic Eruption', label: 'Volcanic Eruption' },
                  { value: 'Earthquake', label: 'Earthquake (Lindol)' },
                  { value: 'Others', label: 'Others (Iba pa)' },
                ]}
                placeholder="--Select Risk Type--"
              />
            </div>
          )}
        </div>

        {form.inRiskArea === 'yes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Severity Level <span className="text-red-500">*</span></label>
              <CustomSelect
                value={form.riskSeverity}
                onChange={(val) => setForm({ ...form, riskSeverity: val as any })}
                options={[
                  { value: 'low', label: 'Low (Mababa)' },
                  { value: 'medium', label: 'Medium (Katamtaman)' },
                  { value: 'high', label: 'High (Mataas)' },
                  { value: 'critical', label: 'Critical (Kritikal)' },
                ]}
                placeholder="--Select Severity--"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Additional Details</label>
              <textarea
                value={form.riskDetails}
                onChange={(e) => setForm({ ...form, riskDetails: e.target.value })}
                placeholder="Specify details of the risk area..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

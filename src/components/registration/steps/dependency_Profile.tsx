import React from 'react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

const LIVING_WITH_OPTIONS = [
  'Alone',
  'Spouse',
  'Child(ren)',
  'Grand Child(ren)',
  'In-law(s)',
  'Relative(s)',
  'Common Law Spouse',
  'Care Institution',
  'Friend(s)',
];

const HOUSEHOLD_CONDITION_OPTIONS = [
  'No privacy',
  'Informal Settler',
  'High cost of rent',
  'Overcrowded in home',
  'No permanent house',
  'Longing for independent living',
];

export default function DependencyProfileStep({ form, setForm }: StepProps) {
  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">IV. Dependency Profile</h5>
          <p className="text-sm text-slate-400">Living arrangements and household condition of the senior citizen.</p>
        </div>
        <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
          Step 4 of 11
        </span>
      </div>

      {/* 30. Living/Residing With */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          30. Living / Residing With
        </h6>
        <p className="text-[13px] text-slate-400 -mt-1">Select all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {LIVING_WITH_OPTIONS.map((item) => {
            const selected = (form.livingWith || []).includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => setForm({ ...form, livingWith: toggleArray(form.livingWith || [], item) })}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                  selected
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Others specify */}
        <div className="mt-3">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.livingOthersText || ''}
            onChange={(e) => setForm({ ...form, livingOthersText: e.target.value })}
            placeholder="Specify other living arrangement..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none mt-1"
          />
        </div>
      </div>

      {/* 31. Household Condition */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          31. Household Condition
        </h6>
        <p className="text-[13px] text-slate-400 -mt-1">Select all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {HOUSEHOLD_CONDITION_OPTIONS.map((item) => {
            const selected = (form.householdCondition || []).includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => setForm({ ...form, householdCondition: toggleArray(form.householdCondition || [], item) })}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                  selected
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Others specify */}
        <div className="mt-3">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.householdOthersText || ''}
            onChange={(e) => setForm({ ...form, householdOthersText: e.target.value })}
            placeholder="Specify other household condition..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none mt-1"
          />
        </div>
      </div>
    </div>
  );
}

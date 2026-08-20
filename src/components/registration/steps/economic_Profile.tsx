import React from 'react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

const toggleArray = (arr: string[], item: string) =>
  arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

const INCOME_SOURCES = [
  'Own earnings/salary',
  'Dependent on children/relatives',
  "Spouse's Pension",
  'Livestock/orchard/farm',
  'Own Pension',
  "Spouse's salary",
  'Rentals/sharecrops',
  'Fishing',
  'Stocks/Dividends',
  'Insurance',
  'Savings',
];

const REAL_PROPERTIES = [
  'House',
  'Lot/Farmland',
  'House & Lot',
  'Commercial Building',
  'Fishpond/Resort',
];

const MOVABLE_PROPERTIES = [
  'Automobile',
  'Heavy Equipment',
  'Motorcycle',
  'Personal Computer',
  'Laptops',
  'Mobile Phones',
  'Boats',
  'Drones',
];

const MONTHLY_INCOME_OPTIONS = [
  'Below ₱1,000',
  '₱1,000–5,000',
  '₱5,000–10,000',
  '₱10,000–20,000',
  '₱20,000–30,000',
  '₱30,000–40,000',
  '₱40,000–50,000',
  '₱50,000–60,000',
  '₱60,000 above',
];

const PROBLEMS_NEEDS = [
  'Lack of income/resources',
  'Loss of income/resources',
  'Skills/capability training',
  'Livelihood opportunities',
];

export default function EconomicProfileStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">V. Economic Profile</h5>
          <p className="text-sm text-slate-400">Source of income, assets, monthly income bracket, and common problems/needs.</p>
        </div>
        <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
          Step 5 of 11
        </span>
      </div>

      {/* 32. Source of Income and Assistance */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          32. Source of Income and Assistance
        </h6>
        <div className="flex flex-wrap gap-2">
          {INCOME_SOURCES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, incomeSources: toggleArray(form.incomeSources || [], item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                (form.incomeSources || []).includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.incomeOthersText || ''}
            onChange={(e) => setForm({ ...form, incomeOthersText: e.target.value })}
            placeholder="Specify other income source"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 33. Real/Immovable Properties */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          33. Assets: Real and Immovable Properties
        </h6>
        <div className="flex flex-wrap gap-2">
          {REAL_PROPERTIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, realProperties: toggleArray(form.realProperties || [], item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                (form.realProperties || []).includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.realPropOthersText || ''}
            onChange={(e) => setForm({ ...form, realPropOthersText: e.target.value })}
            placeholder="Specify other real property"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 34. Personal/Movable Properties */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          34. Assets: Personal and Movable Properties
        </h6>
        <div className="flex flex-wrap gap-2">
          {MOVABLE_PROPERTIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, movableProperties: toggleArray(form.movableProperties || [], item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                (form.movableProperties || []).includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.movablePropOthersText || ''}
            onChange={(e) => setForm({ ...form, movablePropOthersText: e.target.value })}
            placeholder="Specify other movable property"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 35. Monthly Income */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          35. Monthly Income (PHP)
        </h6>
        <div className="flex flex-wrap gap-2">
          {MONTHLY_INCOME_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, monthlyIncomeRange: item })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.monthlyIncomeRange === item
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 36. Problems / Needs */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          36. Problems / Needs Commonly Encountered
        </h6>
        <div className="flex flex-wrap gap-2">
          {PROBLEMS_NEEDS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, problemsNeeds: toggleArray(form.problemsNeeds || [], item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                (form.problemsNeeds || []).includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Conditional text inputs based on selection */}
        {(form.problemsNeeds || []).includes('Skills/capability training') && (
          <div className="space-y-1.5 pt-2">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Skills/capability training — specify</label>
            <input
              type="text"
              value={form.problemsSkillsText || ''}
              onChange={(e) => setForm({ ...form, problemsSkillsText: e.target.value })}
              placeholder="What skills training do you need?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        )}

        {(form.problemsNeeds || []).includes('Livelihood opportunities') && (
          <div className="space-y-1.5 pt-2">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Livelihood opportunities — specify</label>
            <input
              type="text"
              value={form.problemsLivelihoodText || ''}
              onChange={(e) => setForm({ ...form, problemsLivelihoodText: e.target.value })}
              placeholder="What livelihood opportunities do you need?"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        )}

        <div className="space-y-1.5 pt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.problemsOthersText || ''}
            onChange={(e) => setForm({ ...form, problemsOthersText: e.target.value })}
            placeholder="Specify other problems/needs"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

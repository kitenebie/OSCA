import React from 'react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

// ─────────────────────────────────────────────────
// Shared toggle helper
// ─────────────────────────────────────────────────
function TogglePill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
        selected
          ? 'bg-teal-600 text-white border-teal-600'
          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
      }`}
    >
      {label}
    </button>
  );
}

function toggleArrayItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

// ═══════════════════════════════════════════════════
// STEP 3: III. EDUCATION / HR PROFILE
// ═══════════════════════════════════════════════════

const EDUCATION_OPTIONS = [
  'Elementary Level',
  'Elementary Graduate',
  'High School Level',
  'High School Graduate',
  'College Level',
  'College Graduate',
  'Vocational',
  'Post Graduate',
  'Not Attended School',
];

const SPECIALIZATIONS = [
  'Medical', 'Teaching', 'Dental', 'Counseling', 'Fishing', 'Cooking',
  'Engineering', 'Carpenter', 'Barber', 'Mason', 'Evangelization', 'Tailor',
  'Millwright', 'Legal Services', 'Farming', 'Arts', 'Plumber', 'Sapatero', 'Chef/Cook',
];

const COMMUNITY_SERVICES = [
  'Medical', 'Community/Org Leader', 'Neighborhood Support', 'Counseling/Referral',
  'Resource Volunteer', 'Dental', 'Legal Services', 'Sponsorship',
  'Community Beautification', 'Friendly Visits', 'Religious',
];

export function EducationHRStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6">
      {/* 26. Educational Attainment */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          26. Educational Attainment
        </h6>
        <div className="flex flex-wrap gap-2">
          {EDUCATION_OPTIONS.map((opt) => (
            <TogglePill
              key={opt}
              label={opt}
              selected={form.highestEducationalAttainment === opt}
              onClick={() => setForm({ ...form, highestEducationalAttainment: opt })}
            />
          ))}
        </div>
      </div>

      {/* 27. Areas of Specialization / Technical Skills */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          27. Areas of Specialization / Technical Skills
        </h6>
        <p className="text-[10px] text-slate-400">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((spec) => (
            <TogglePill
              key={spec}
              label={spec}
              selected={form.specializations.includes(spec)}
              onClick={() => setForm({ ...form, specializations: toggleArrayItem(form.specializations, spec) })}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.specOthersText}
            onChange={(e) => setForm({ ...form, specOthersText: e.target.value })}
            placeholder="Specify other specialization..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 28. Share Skill */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          28. Share Skill (Community Service)
        </h6>
        <p className="text-[10px] text-slate-400">List up to 3 skills the senior can share with the community</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Skill {idx + 1}</label>
              <input
                type="text"
                value={form.shareSkills[idx] || ''}
                onChange={(e) => {
                  const skills = [...form.shareSkills];
                  skills[idx] = e.target.value;
                  setForm({ ...form, shareSkills: skills });
                }}
                placeholder={`Skill ${idx + 1}`}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 29. Community Service and Involvement */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          29. Community Service and Involvement
        </h6>
        <p className="text-[10px] text-slate-400">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {COMMUNITY_SERVICES.map((svc) => (
            <TogglePill
              key={svc}
              label={svc}
              selected={form.communityServices.includes(svc)}
              onClick={() => setForm({ ...form, communityServices: toggleArrayItem(form.communityServices, svc) })}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.commOthersText}
            onChange={(e) => setForm({ ...form, commOthersText: e.target.value })}
            placeholder="Specify other community service..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STEP 4: IV. DEPENDENCY PROFILE
// ═══════════════════════════════════════════════════

const LIVING_WITH_OPTIONS = [
  'Alone', 'Spouse', 'Child(ren)', 'Grand Child(ren)', 'In-law(s)',
  'Relative(s)', 'Common Law Spouse', 'Care Institution', 'Friend(s)',
];

const HOUSEHOLD_CONDITIONS = [
  'No privacy', 'Informal Settler', 'High cost of rent',
  'Overcrowded in home', 'No permanent house', 'Longing for independent living',
];

export function DependencyProfileStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6">
      {/* 30. Living/Residing With */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          30. Living / Residing With
        </h6>
        <p className="text-[10px] text-slate-400">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {LIVING_WITH_OPTIONS.map((opt) => (
            <TogglePill
              key={opt}
              label={opt}
              selected={form.livingWith.includes(opt)}
              onClick={() => setForm({ ...form, livingWith: toggleArrayItem(form.livingWith, opt) })}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.livingOthersText}
            onChange={(e) => setForm({ ...form, livingOthersText: e.target.value })}
            placeholder="Specify..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 31. Household Condition */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          31. Household Condition
        </h6>
        <p className="text-[10px] text-slate-400">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {HOUSEHOLD_CONDITIONS.map((cond) => (
            <TogglePill
              key={cond}
              label={cond}
              selected={form.householdCondition.includes(cond)}
              onClick={() => setForm({ ...form, householdCondition: toggleArrayItem(form.householdCondition, cond) })}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.householdOthersText}
            onChange={(e) => setForm({ ...form, householdOthersText: e.target.value })}
            placeholder="Specify..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STEP 5: V. ECONOMIC PROFILE
// ═══════════════════════════════════════════════════

const INCOME_SOURCES = [
  'Own earnings/salary', 'Dependent on children/relatives', "Spouse's Pension",
  'Livestock/orchard/farm', 'Own Pension', "Spouse's salary",
  'Rentals/sharecrops', 'Fishing', 'Stocks/Dividends', 'Insurance', 'Savings',
];

const REAL_PROPERTIES = ['House', 'Lot/Farmland', 'House & Lot', 'Commercial Building', 'Fishpond/Resort'];

const MOVABLE_PROPERTIES = [
  'Automobile', 'Heavy Equipment', 'Motorcycle', 'Personal Computer',
  'Laptops', 'Mobile Phones', 'Boats', 'Drones',
];

const MONTHLY_INCOME_OPTIONS = [
  { value: 'below_1k', label: 'Below ₱1,000' },
  { value: '1k_5k', label: '₱1,000–5,000' },
  { value: '5k_10k', label: '₱5,000–10,000' },
  { value: '10k_20k', label: '₱10,000–20,000' },
  { value: '20k_30k', label: '₱20,000–30,000' },
  { value: '30k_40k', label: '₱30,000–40,000' },
  { value: '40k_50k', label: '₱40,000–50,000' },
  { value: '50k_60k', label: '₱50,000–60,000' },
  { value: '60k_above', label: '₱60,000 and above' },
];

const PROBLEMS_NEEDS = ['Lack of income/resources', 'Loss of income/resources'];

export function EconomicProfileStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6">
      {/* 32. Source of Income and Assistance */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          32. Source of Income and Assistance
        </h6>
        <p className="text-[10px] text-slate-400">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {INCOME_SOURCES.map((src) => (
            <TogglePill
              key={src}
              label={src}
              selected={form.incomeSources.includes(src)}
              onClick={() => setForm({ ...form, incomeSources: toggleArrayItem(form.incomeSources, src) })}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.incomeOthersText}
            onChange={(e) => setForm({ ...form, incomeOthersText: e.target.value })}
            placeholder="Other income source..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 33. Real & Immovable Properties */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          33. Assets: Real and Immovable Properties
        </h6>
        <div className="flex flex-wrap gap-2">
          {REAL_PROPERTIES.map((prop) => (
            <TogglePill
              key={prop}
              label={prop}
              selected={form.realProperties.includes(prop)}
              onClick={() => setForm({ ...form, realProperties: toggleArrayItem(form.realProperties, prop) })}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.realPropOthersText}
            onChange={(e) => setForm({ ...form, realPropOthersText: e.target.value })}
            placeholder="Other real property..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 34. Personal & Movable Properties */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          34. Assets: Personal and Movable Properties
        </h6>
        <div className="flex flex-wrap gap-2">
          {MOVABLE_PROPERTIES.map((prop) => (
            <TogglePill
              key={prop}
              label={prop}
              selected={form.movableProperties.includes(prop)}
              onClick={() => setForm({ ...form, movableProperties: toggleArrayItem(form.movableProperties, prop) })}
            />
          ))}
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.movablePropOthersText}
            onChange={(e) => setForm({ ...form, movablePropOthersText: e.target.value })}
            placeholder="Other movable property..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 35. Monthly Income */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          35. Monthly Income (PHP)
        </h6>
        <div className="flex flex-wrap gap-2">
          {MONTHLY_INCOME_OPTIONS.map((opt) => (
            <TogglePill
              key={opt.value}
              label={opt.label}
              selected={form.monthlyIncomeRange === opt.value}
              onClick={() => setForm({ ...form, monthlyIncomeRange: opt.value })}
            />
          ))}
        </div>
      </div>

      {/* 36. Problems / Needs */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          36. Problems / Needs Commonly Encountered
        </h6>
        <div className="flex flex-wrap gap-2">
          {PROBLEMS_NEEDS.map((prob) => (
            <TogglePill
              key={prob}
              label={prob}
              selected={form.problemsNeeds.includes(prob)}
              onClick={() => setForm({ ...form, problemsNeeds: toggleArrayItem(form.problemsNeeds, prob) })}
            />
          ))}
          <TogglePill
            label="Skills/capability training"
            selected={form.problemsNeeds.includes('Skills training')}
            onClick={() => setForm({ ...form, problemsNeeds: toggleArrayItem(form.problemsNeeds, 'Skills training') })}
          />
          <TogglePill
            label="Livelihood opportunities"
            selected={form.problemsNeeds.includes('Livelihood opportunities')}
            onClick={() => setForm({ ...form, problemsNeeds: toggleArrayItem(form.problemsNeeds, 'Livelihood opportunities') })}
          />
        </div>
        {form.problemsNeeds.includes('Skills training') && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Skills Training — specify</label>
            <input type="text" value={form.problemsSkillsText} onChange={(e) => setForm({ ...form, problemsSkillsText: e.target.value })} placeholder="Specify skills training needed..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
          </div>
        )}
        {form.problemsNeeds.includes('Livelihood opportunities') && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Livelihood Opportunities — specify</label>
            <input type="text" value={form.problemsLivelihoodText} onChange={(e) => setForm({ ...form, problemsLivelihoodText: e.target.value })} placeholder="Specify livelihood..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
          </div>
        )}
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input type="text" value={form.problemsOthersText} onChange={(e) => setForm({ ...form, problemsOthersText: e.target.value })} placeholder="Other problems/needs..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STEP 6: VI. HEALTH PROFILE
// ═══════════════════════════════════════════════════

const BLOOD_TYPES = ['O', 'A', 'B', 'AB', "Don't know"];

const MEDICAL_CONCERNS = [
  'Hypertension', 'Diabetes', "Alzheimer's/Dementia", 'COPD',
  'Arthritis/Gout', 'Chronic Kidney Disease', 'Coronary Heart Disease',
];

const SOCIAL_EMOTIONAL = [
  'Feeling neglect/rejection', 'Feeling helplessness',
  'Feeling loneliness/isolate', 'Lack leisure/recreational',
  'Lack SC friendly environment',
];

const AREA_DIFFICULTY = ['High cost of medicines', 'Lack of medicines', 'Lack of medical attention'];

export function HealthProfileStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Blood Type */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Blood Type
        </h6>
        <div className="flex flex-wrap gap-2">
          {BLOOD_TYPES.map((bt) => (
            <TogglePill
              key={bt}
              label={bt}
              selected={form.bloodType === bt}
              onClick={() => setForm({ ...form, bloodType: bt })}
            />
          ))}
        </div>
      </div>

      {/* Physical Disability */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Physical Disability
        </h6>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.physicalDisability} onChange={(e) => setForm({ ...form, physicalDisability: e.target.checked })} className="accent-teal-600 w-4 h-4" />
            <span className="text-xs font-semibold text-slate-700">Has physical disability</span>
          </label>
        </div>
        {form.physicalDisability && (
          <input type="text" value={form.physicalDisabilityText} onChange={(e) => setForm({ ...form, physicalDisabilityText: e.target.value })} placeholder="Specify disability..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
        )}
      </div>

      {/* 37. Medical Concerns */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          37. Medical Concerns
        </h6>
        <div className="flex flex-wrap gap-2">
          {MEDICAL_CONCERNS.map((mc) => (
            <TogglePill key={mc} label={mc} selected={form.medicalConcerns.includes(mc)} onClick={() => setForm({ ...form, medicalConcerns: toggleArrayItem(form.medicalConcerns, mc) })} />
          ))}
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input type="text" value={form.medicalOthersText} onChange={(e) => setForm({ ...form, medicalOthersText: e.target.value })} placeholder="Other medical concern..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
        </div>
      </div>

      {/* 38. Dental */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          38. Dental Concern
        </h6>
        <div className="flex flex-wrap gap-2">
          <TogglePill label="Needs Dental Care" selected={form.dentalConcerns.includes('Needs Dental Care')} onClick={() => setForm({ ...form, dentalConcerns: toggleArrayItem(form.dentalConcerns, 'Needs Dental Care') })} />
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input type="text" value={form.dentalOthersText} onChange={(e) => setForm({ ...form, dentalOthersText: e.target.value })} placeholder="Other dental concern..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
        </div>
      </div>

      {/* 39. Optical */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          39. Optical
        </h6>
        <div className="flex flex-wrap gap-2">
          <TogglePill label="Eye impairment" selected={form.opticalConcerns.includes('Eye impairment')} onClick={() => setForm({ ...form, opticalConcerns: toggleArrayItem(form.opticalConcerns, 'Eye impairment') })} />
          <TogglePill label="Needs eye care" selected={form.opticalConcerns.includes('Needs eye care')} onClick={() => setForm({ ...form, opticalConcerns: toggleArrayItem(form.opticalConcerns, 'Needs eye care') })} />
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input type="text" value={form.opticalOthersText} onChange={(e) => setForm({ ...form, opticalOthersText: e.target.value })} placeholder="Other optical concern..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
        </div>
      </div>

      {/* 40. Hearing */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          40. Hearing
        </h6>
        <div className="flex flex-wrap gap-2">
          <TogglePill label="Aural/Hearing impairment" selected={form.hearingConcerns.includes('Aural impairment')} onClick={() => setForm({ ...form, hearingConcerns: toggleArrayItem(form.hearingConcerns, 'Aural impairment') })} />
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input type="text" value={form.hearingOthersText} onChange={(e) => setForm({ ...form, hearingOthersText: e.target.value })} placeholder="Other hearing concern..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
        </div>
      </div>

      {/* 41. Social / Emotional */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          41. Social / Emotional
        </h6>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_EMOTIONAL.map((se) => (
            <TogglePill key={se} label={se} selected={form.socialEmotional.includes(se)} onClick={() => setForm({ ...form, socialEmotional: toggleArrayItem(form.socialEmotional, se) })} />
          ))}
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input type="text" value={form.socialOthersText} onChange={(e) => setForm({ ...form, socialOthersText: e.target.value })} placeholder="Other social/emotional..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
        </div>
      </div>

      {/* 42. Area / Difficulty */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          42. Area / Difficulty
        </h6>
        <div className="flex flex-wrap gap-2">
          {AREA_DIFFICULTY.map((ad) => (
            <TogglePill key={ad} label={ad} selected={form.areaDifficulty.includes(ad)} onClick={() => setForm({ ...form, areaDifficulty: toggleArrayItem(form.areaDifficulty, ad) })} />
          ))}
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input type="text" value={form.difficultyOthersText} onChange={(e) => setForm({ ...form, difficultyOthersText: e.target.value })} placeholder="Other area/difficulty..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
        </div>
      </div>

      {/* 43. List of Medicines */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          43. List of Medicines for Maintenance
        </h6>
        <div className="space-y-2">
          {form.medicines.map((med: any, idx: number) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={med.name}
                onChange={(e) => { const m = [...form.medicines]; m[idx] = { ...m[idx], name: e.target.value }; setForm({ ...form, medicines: m }); }}
                placeholder={`Medicine ${idx + 1}`}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <input
                type="text"
                value={med.dosage}
                onChange={(e) => { const m = [...form.medicines]; m[idx] = { ...m[idx], dosage: e.target.value }; setForm({ ...form, medicines: m }); }}
                placeholder="Dosage"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <input
                type="text"
                value={med.notes}
                onChange={(e) => { const m = [...form.medicines]; m[idx] = { ...m[idx], notes: e.target.value }; setForm({ ...form, medicines: m }); }}
                placeholder="Notes"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 44-45. Scheduled Checkup */}
      <div className="space-y-3">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          44. Scheduled Medical/Physical Check-up?
        </h6>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="scheduledCheckup" checked={form.scheduledCheckup === 'yes'} onChange={() => setForm({ ...form, scheduledCheckup: 'yes' })} className="accent-teal-600" />
            <span className="text-xs font-semibold text-slate-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="scheduledCheckup" checked={form.scheduledCheckup === 'no'} onChange={() => setForm({ ...form, scheduledCheckup: 'no' })} className="accent-teal-600" />
            <span className="text-xs font-semibold text-slate-700">No</span>
          </label>
        </div>
        {form.scheduledCheckup === 'yes' && (
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">45. If Yes, when is it done?</label>
            <div className="flex flex-wrap gap-2">
              <TogglePill label="Yearly" selected={form.checkupFrequency === 'yearly'} onClick={() => setForm({ ...form, checkupFrequency: 'yearly' })} />
              <TogglePill label="Every 6 months" selected={form.checkupFrequency === 'every_6_months'} onClick={() => setForm({ ...form, checkupFrequency: 'every_6_months' })} />
              <TogglePill label="Others" selected={form.checkupFrequency === 'others'} onClick={() => setForm({ ...form, checkupFrequency: 'others' })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

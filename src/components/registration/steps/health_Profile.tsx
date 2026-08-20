import React from 'react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

const toggleArray = (arr: string[], item: string) =>
  arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item];

const MEDICAL_CONCERNS = [
  'Hypertension',
  'Diabetes',
  "Alzheimer's/Dementia",
  'COPD',
  'Arthritis/Gout',
  'Chronic Kidney Disease',
  'Coronary Heart Disease',
];

const DENTAL_OPTIONS = ['Needs Dental Care'];
const OPTICAL_OPTIONS = ['Eye impairment', 'Needs eye care'];
const HEARING_OPTIONS = ['Aural/Hearing impairment'];

const SOCIAL_EMOTIONAL = [
  'Feeling neglect/rejection',
  'Feeling helplessness',
  'Feeling loneliness/isolate',
  'Lack leisure/recreational',
  'Lack SC friendly environment',
];

const AREA_DIFFICULTY = [
  'High cost of medicines',
  'Lack of medicines',
  'Lack of medical attention',
];

const BLOOD_TYPES = ['O', 'A', 'B', 'AB', "Don't know"];

export default function HealthProfileStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">VI. Health Profile</h5>
          <p className="text-sm text-slate-400">Medical, dental, optical, hearing, social/emotional concerns, and maintenance medicines.</p>
        </div>
        <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
          Step 6 of 11
        </span>
      </div>

      {/* Blood Type */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Blood Type
        </h6>
        <div className="flex flex-wrap gap-2">
          {BLOOD_TYPES.map((bt) => (
            <button
              key={bt}
              type="button"
              onClick={() => setForm({ ...form, bloodType: bt })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.bloodType === bt
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

      {/* Physical Disability */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Physical Disability
        </h6>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.physicalDisability}
            onChange={(e) => setForm({ ...form, physicalDisability: e.target.checked })}
            className="accent-teal-600 w-4 h-4"
          />
          <span className="text-sm font-semibold text-slate-700">Has physical disability</span>
        </label>
        {form.physicalDisability && (
          <input
            type="text"
            value={form.physicalDisabilityText}
            onChange={(e) => setForm({ ...form, physicalDisabilityText: e.target.value })}
            placeholder="Specify disability..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        )}
      </div>

      {/* 37. Medical Concerns */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          37. Medical Concerns
        </h6>
        <div className="flex flex-wrap gap-2">
          {MEDICAL_CONCERNS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, medicalConcerns: toggleArray(form.medicalConcerns, item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.medicalConcerns.includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 mt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.medicalOthersText}
            onChange={(e) => setForm({ ...form, medicalOthersText: e.target.value })}
            placeholder="Other medical concerns..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 38. Dental */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          38. Dental Concern
        </h6>
        <div className="flex flex-wrap gap-2">
          {DENTAL_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, dentalConcerns: toggleArray(form.dentalConcerns, item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.dentalConcerns.includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 mt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.dentalOthersText}
            onChange={(e) => setForm({ ...form, dentalOthersText: e.target.value })}
            placeholder="Other dental concerns..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 39. Optical */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          39. Optical
        </h6>
        <div className="flex flex-wrap gap-2">
          {OPTICAL_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, opticalConcerns: toggleArray(form.opticalConcerns, item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.opticalConcerns.includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 mt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.opticalOthersText}
            onChange={(e) => setForm({ ...form, opticalOthersText: e.target.value })}
            placeholder="Other optical concerns..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 40. Hearing */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          40. Hearing
        </h6>
        <div className="flex flex-wrap gap-2">
          {HEARING_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, hearingConcerns: toggleArray(form.hearingConcerns, item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.hearingConcerns.includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 mt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.hearingOthersText}
            onChange={(e) => setForm({ ...form, hearingOthersText: e.target.value })}
            placeholder="Other hearing concerns..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 41. Social / Emotional */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          41. Social / Emotional
        </h6>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_EMOTIONAL.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, socialEmotional: toggleArray(form.socialEmotional, item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.socialEmotional.includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 mt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.socialEmotionalOthersText}
            onChange={(e) => setForm({ ...form, socialEmotionalOthersText: e.target.value })}
            placeholder="Other social/emotional concerns..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 42. Area / Difficulty */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          42. Area / Difficulty
        </h6>
        <div className="flex flex-wrap gap-2">
          {AREA_DIFFICULTY.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setForm({ ...form, areaDifficulty: toggleArray(form.areaDifficulty, item) })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.areaDifficulty.includes(item)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 mt-2">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.areaDifficultyOthersText}
            onChange={(e) => setForm({ ...form, areaDifficultyOthersText: e.target.value })}
            placeholder="Other difficulties..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 43. List of Medicines for Maintenance */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          43. List of Medicines for Maintenance
        </h6>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Medicine Name</span>
            <span className="text-xs font-bold text-slate-400 uppercase">Dosage</span>
            <span className="text-xs font-bold text-slate-400 uppercase">Notes / Purpose</span>
          </div>
          {form.medicines.map((med: any, idx: number) => (
            <div key={idx} className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={med.name}
                onChange={(e) => {
                  const m = [...form.medicines];
                  m[idx] = { ...m[idx], name: e.target.value };
                  setForm({ ...form, medicines: m });
                }}
                placeholder="Medicine name"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <input
                type="text"
                value={med.dosage}
                onChange={(e) => {
                  const m = [...form.medicines];
                  m[idx] = { ...m[idx], dosage: e.target.value };
                  setForm({ ...form, medicines: m });
                }}
                placeholder="Dosage"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <input
                type="text"
                value={med.notes}
                onChange={(e) => {
                  const m = [...form.medicines];
                  m[idx] = { ...m[idx], notes: e.target.value };
                  setForm({ ...form, medicines: m });
                }}
                placeholder="Notes/Purpose"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 44. Scheduled Check-up */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          44. Do you have a scheduled medical/physical check-up?
        </h6>
        <div className="flex flex-wrap gap-2">
          {['yes', 'no'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setForm({ ...form, scheduledCheckup: opt })}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.scheduledCheckup === opt
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {opt === 'yes' ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
      </div>

      {/* 45. If Yes, when? */}
      {form.scheduledCheckup === 'yes' && (
        <div className="space-y-3">
          <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
            <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
            45. If Yes, when is it done?
          </h6>
          <div className="flex flex-wrap gap-2">
            {['Yearly', 'Every 6 months', 'Others'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm({ ...form, checkupFrequency: opt })}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                  form.checkupFrequency === opt
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

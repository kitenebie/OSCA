import React from 'react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

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

const SPECIALIZATION_OPTIONS = [
  'Medical', 'Teaching', 'Dental', 'Counseling', 'Fishing', 'Cooking',
  'Engineering', 'Carpenter', 'Barber', 'Mason', 'Evangelization', 'Tailor',
  'Millwright', 'Legal Services', 'Farming', 'Arts', 'Plumber', 'Sapatero', 'Chef/Cook',
];

const COMMUNITY_SERVICE_OPTIONS = [
  'Medical', 'Community/Org Leader', 'Neighborhood Support', 'Counseling/Referral',
  'Resource Volunteer', 'Dental', 'Legal Services', 'Sponsorship',
  'Community Beautification', 'Friendly Visits', 'Religious',
];

export default function EducationHRStep({ form, setForm }: StepProps) {
  const toggleArray = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item];
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">III. Education / HR Profile</h5>
          <p className="text-sm text-slate-400">Educational background, skills, and community involvement of the senior citizen.</p>
        </div>
        <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
          Step 3 of 11
        </span>
      </div>

      {/* 26. Educational Attainment */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          26. Educational Attainment
        </h6>
        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Select highest level attained (choose one)</p>
        <div className="flex flex-wrap gap-2">
          {EDUCATION_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setForm({ ...form, highestEducationalAttainment: option })}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                form.highestEducationalAttainment === option
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* 27. Areas of Specialization / Technical Skills */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          27. Areas of Specialization / Technical Skills
        </h6>
        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATION_OPTIONS.map((option) => {
            const isSelected = (form.specializations || []).includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => setForm({ ...form, specializations: toggleArray(form.specializations || [], option) })}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.specOthersText || ''}
            onChange={(e) => setForm({ ...form, specOthersText: e.target.value })}
            placeholder="Specify other specialization..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none mt-1"
          />
        </div>
      </div>

      {/* 28. Share Skill */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          28. Share Skill (Community Service)
        </h6>
        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Skills you can share with the community (up to 3)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-[13px] font-bold text-slate-400">Skill {idx + 1}</label>
              <input
                type="text"
                value={(form.shareSkills || ['', '', ''])[idx] || ''}
                onChange={(e) => {
                  const skills = [...(form.shareSkills || ['', '', ''])];
                  skills[idx] = e.target.value;
                  setForm({ ...form, shareSkills: skills });
                }}
                placeholder={`Enter skill ${idx + 1}`}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 29. Community Service and Involvement */}
      <div className="space-y-3">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          29. Community Service and Involvement
        </h6>
        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {COMMUNITY_SERVICE_OPTIONS.map((option) => {
            const isSelected = (form.communityServices || []).includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => setForm({ ...form, communityServices: toggleArray(form.communityServices || [], option) })}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Others, specify</label>
          <input
            type="text"
            value={form.commOthersText || ''}
            onChange={(e) => setForm({ ...form, commOthersText: e.target.value })}
            placeholder="Specify other community service..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none mt-1"
          />
        </div>
      </div>
    </div>
  );
}

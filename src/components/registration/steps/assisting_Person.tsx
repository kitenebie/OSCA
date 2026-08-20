import React from 'react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

const RELATIONSHIP_OPTIONS = [
  'Son',
  'Daughter',
  'Spouse',
  'Sibling',
  'Grandchild',
  'Niece/Nephew',
  'Friend',
  'Caregiver',
  'Social Worker',
  'Other',
];

export default function AssistingPersonStep({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">IX. Assisting Person</h5>
          <p className="text-sm text-slate-400">Details of persons assisting the senior citizen during this registration.</p>
        </div>
        <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">Step 9 of 11</span>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
        <span className="text-indigo-500 shrink-0 mt-0.5">ℹ️</span>
        <p className="text-[13px] text-indigo-600 leading-relaxed">
          These details will appear on the NCSC Data Form signature block. Assisting Person 1 is typically the family member or caregiver present during registration.
        </p>
      </div>

      {/* Assisting Person 1 */}
      <div className="space-y-4">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Assisting Person 1
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Name</label>
            <input
              type="text"
              value={form.assistingPerson1Name}
              onChange={(e) => setForm({ ...form, assistingPerson1Name: e.target.value })}
              placeholder="Full Name of Assisting Person"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Relationship to Senior Citizen</label>
            <select
              value={form.assistingPerson1Relationship}
              onChange={(e) => setForm({ ...form, assistingPerson1Relationship: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">Select relationship</option>
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assisting Person 2 (Optional) */}
      <div className="space-y-4">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Assisting Person 2 <span className="text-slate-400 font-normal normal-case">(Optional)</span>
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Name</label>
            <input
              type="text"
              value={form.assistingPerson2Name}
              onChange={(e) => setForm({ ...form, assistingPerson2Name: e.target.value })}
              placeholder="Full Name (if applicable)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Relationship to Senior Citizen</label>
            <select
              value={form.assistingPerson2Relationship}
              onChange={(e) => setForm({ ...form, assistingPerson2Relationship: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">Select relationship</option>
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interviewer / Verifier */}
      <div className="space-y-4">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Interviewer / Verifier
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Name of Interviewer/Verifier</label>
            <input
              type="text"
              value={form.interviewerName}
              onChange={(e) => setForm({ ...form, interviewerName: e.target.value })}
              placeholder="Enter interviewer name"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Organization / Office</label>
            <input
              type="text"
              value={form.interviewerOrganization}
              onChange={(e) => setForm({ ...form, interviewerOrganization: e.target.value })}
              placeholder="e.g. OSCA Juban, MSWDO"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Date of Interview</label>
            <input
              type="date"
              value={form.interviewDate}
              onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Place of Interview</label>
            <input
              type="text"
              value={form.interviewPlace}
              onChange={(e) => setForm({ ...form, interviewPlace: e.target.value })}
              placeholder="e.g. OSCA Office, Juban, Sorsogon"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

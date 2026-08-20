import React from 'react';
import { Info } from 'lucide-react';

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
    <div className="space-y-6 max-w-full animate-fadeIn">
      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2 mb-4">
        <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-600 leading-relaxed">
          These details will appear on the NCSC Data Form signature block. Assisting Person 1 is typically the family member or caregiver present during registration.
        </p>
      </div>

      {/* Assisting Person 1 */}
      <div className="space-y-4">
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Assisting Person 1
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Full Name *
            </label>
            <input
              type="text"
              value={form.assistingPerson1Name}
              onChange={(e) => setForm({ ...form, assistingPerson1Name: e.target.value })}
              placeholder="Enter full name of assisting person"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Relationship to Senior Citizen *
            </label>
            <select
              value={form.assistingPerson1Relationship}
              onChange={(e) => setForm({ ...form, assistingPerson1Relationship: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
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
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Assisting Person 2 (Optional)
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              value={form.assistingPerson2Name}
              onChange={(e) => setForm({ ...form, assistingPerson2Name: e.target.value })}
              placeholder="Enter full name (optional)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Relationship to Senior Citizen
            </label>
            <select
              value={form.assistingPerson2Relationship}
              onChange={(e) => setForm({ ...form, assistingPerson2Relationship: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
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
        <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Interviewer / Verifier
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Name of Interviewer / Verifier
            </label>
            <input
              type="text"
              value={form.interviewerName}
              onChange={(e) => setForm({ ...form, interviewerName: e.target.value })}
              placeholder="Enter interviewer name"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Organization / Office
            </label>
            <input
              type="text"
              value={form.interviewerOrganization}
              onChange={(e) => setForm({ ...form, interviewerOrganization: e.target.value })}
              placeholder="e.g. OSCA Juban, Sorsogon"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Date of Interview
            </label>
            <input
              type="date"
              value={form.interviewDate}
              onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Place of Interview
            </label>
            <input
              type="text"
              value={form.interviewPlace}
              onChange={(e) => setForm({ ...form, interviewPlace: e.target.value })}
              placeholder="e.g. OSCA Office, Juban, Sorsogon"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

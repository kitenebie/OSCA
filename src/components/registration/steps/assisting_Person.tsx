import React, { useState, useEffect, useRef } from 'react';
import SignaturePad from '../../profiling/SignaturePad';
import { interviewerService, Interviewer } from '../../../services/supabaseService';

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
  const [suggestions, setSuggestions] = useState<Interviewer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search interviewers as user types
  const handleInterviewerNameChange = (value: string) => {
    setForm({ ...form, interviewerName: value });

    if (searchTimeout) clearTimeout(searchTimeout);

    if (value.trim().length >= 2) {
      const timeout = setTimeout(async () => {
        try {
          const results = await interviewerService.search(value.trim());
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch {
          setSuggestions([]);
        }
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select a suggestion — auto-fill fields
  const handleSelectInterviewer = (interviewer: Interviewer) => {
    setForm({
      ...form,
      interviewerName: interviewer.name,
      interviewerOrganization: interviewer.organization || form.interviewerOrganization,
      interviewPlace: interviewer.place || form.interviewPlace,
      interviewerSignature: interviewer.signature || form.interviewerSignature,
    });
    setShowSuggestions(false);
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save/update interviewer on leaving the step
  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      _saveInterviewer: async () => {
        if (form.interviewerName?.trim()) {
          try {
            await interviewerService.upsert({
              name: form.interviewerName.trim(),
              organization: form.interviewerOrganization || '',
              place: form.interviewPlace || '',
              signature: form.interviewerSignature || '',
            });
          } catch (e) {
            console.warn('Could not save interviewer:', e);
          }
        }
      },
    }));
  }, [form.interviewerName, form.interviewerOrganization, form.interviewPlace, form.interviewerSignature]);

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
        <div className="text-[13px] text-indigo-600 leading-relaxed space-y-1">
          <p>These details will appear on the NCSC Data Form signature block. Assisting Person 1 is typically the family member or caregiver present during registration.</p>
          <p className="font-semibold text-indigo-700">
            🖊️ Pindutin ang "Create Signature" para mag-open ng fullscreen signing canvas. Matapos mag-sign, pindutin ang "Complete" para ma-save.
          </p>
        </div>
      </div>

      {/* Assisting Person 1 */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
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
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Signature</label>
          <SignaturePad
            value={form.assistingPerson1Signature}
            onChange={(sig) => setForm({ ...form, assistingPerson1Signature: sig })}
            fieldId="step9-assisting-person-1"
            showUsbButton={true}
          />
        </div>
      </div>

      {/* Assisting Person 2 (Optional) */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
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
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Signature</label>
          <SignaturePad
            value={form.assistingPerson2Signature}
            onChange={(sig) => setForm({ ...form, assistingPerson2Signature: sig })}
            fieldId="step9-assisting-person-2"
            showUsbButton={true}
          />
        </div>
      </div>

      {/* Interviewer / Verifier */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
          Interviewer / Verifier
        </h6>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name with autocomplete */}
          <div className="space-y-1.5 relative" ref={suggestionsRef}>
            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Name of Interviewer/Verifier</label>
            <input
              type="text"
              value={form.interviewerName}
              onChange={(e) => handleInterviewerNameChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="Start typing to search..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
              autoComplete="off"
            />
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.id || s.name}
                    type="button"
                    onClick={() => handleSelectInterviewer(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <span className="text-sm font-bold text-slate-800">{s.name}</span>
                    {s.organization && (
                      <span className="text-[11px] text-slate-400 ml-2">— {s.organization}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
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
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Signature of Interviewer/Verifier</label>
          <SignaturePad
            value={form.interviewerSignature}
            onChange={(sig) => setForm({ ...form, interviewerSignature: sig })}
            fieldId="step9-interviewer"
            showUsbButton={true}
          />
        </div>
      </div>
    </div>
  );
}

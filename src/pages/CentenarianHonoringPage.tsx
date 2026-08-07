import React, { useState } from 'react';
import { useSeniorsStore } from '../store/seniorsStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { CentenarianApplication } from '../types';
import { 
  Award, Search, User, CheckCircle, AlertCircle, ChevronRight, 
  Star, Calendar, FileText, ArrowLeft, Trophy, Gift, Clock
} from 'lucide-react';

const MILESTONES = [
  { type: 'Octogenarian-80', age: 80, label: 'Octogenarian (80 years old)', amount: 10000 },
  { type: 'Octogenarian-85', age: 85, label: 'Octogenarian (85 years old)', amount: 10000 },
  { type: 'Nonagenarian-90', age: 90, label: 'Nonagenarian (90 years old)', amount: 10000 },
  { type: 'Nonagenarian-95', age: 95, label: 'Nonagenarian (95 years old)', amount: 10000 },
  { type: 'Centenarian-100', age: 100, label: 'Centenarian (100+ years old)', amount: 100000 },
];

export default function CentenarianHonoringPage() {
  const seniors = useSeniorsStore((state) => state.seniors);
  const { currentUser } = useAuthStore();
  const { showToast, selectedSeniorId } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSenior, setSelectedSenior] = useState<string | null>(selectedSeniorId || null);
  const [viewMode, setViewMode] = useState<'list' | 'form'>(selectedSeniorId ? 'form' : 'list');

  // Filter seniors who are approved and 80+
  const eligibleSeniors = seniors.filter(s => {
    if (s.status !== 'Approved') return false;
    return s.age >= 80;
  });

  const filteredSeniors = eligibleSeniors.filter(s =>
    `${s.firstName} ${s.lastName} ${s.oscaNumber}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const senior = seniors.find(s => s.id === selectedSenior);

  // Determine applicable milestones for a senior
  const getApplicableMilestones = (age: number) => {
    return MILESTONES.filter(m => age >= m.age);
  };

  // Form state
  const [form, setForm] = useState<Partial<CentenarianApplication>>({
    milestoneType: 'Octogenarian-80',
    milestoneAge: 80,
    cashGiftAmount: 10000,
    applicantType: 'Self',
    representativeName: '',
    representativeRelationship: '',
    representativeContact: '',
    hasApplicationForm: false,
    hasFullBodyPhoto: false,
    hasEndorsementLetter: false,
    hasBirthCertificate: false,
    hasValidId: false,
    hasDeathCertificate: false,
    remarks: '',
  });

  const handleMilestoneChange = (milestoneType: string) => {
    const milestone = MILESTONES.find(m => m.type === milestoneType);
    if (milestone) {
      setForm({
        ...form,
        milestoneType: milestoneType as any,
        milestoneAge: milestone.age,
        cashGiftAmount: milestone.amount,
      });
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!form.hasApplicationForm || !form.hasFullBodyPhoto || !form.hasBirthCertificate) {
      showToast('Requirements incomplete. Please complete the checklist.', 'warning');
      return;
    }
    if (form.applicantType === 'Posthumous' && !form.hasDeathCertificate) {
      showToast('Death Certificate is required for Posthumous application.', 'warning');
      return;
    }

    showToast(`Application for ${senior?.firstName} ${senior?.lastName} has been successfully submitted for endorsement!`, 'success');
    setSelectedSenior(null);
    setViewMode('list');
  };

  // Main list view
  if (viewMode === 'list' && !selectedSenior) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
              <Trophy size={20} className="text-amber-600" />
            </div>
            <div>
              <h1 className="font-black text-lg text-slate-800 uppercase tracking-tight">Centenarian Honoring Program</h1>
              <p className="text-[10px] text-slate-400 font-medium">RA 11982 • Expanded Centenarians Act • Octogenarians, Nonagenarians & Centenarians</p>
            </div>
          </div>
        </div>

        {/* Benefits Table */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Gift size={14} className="text-amber-700" />
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider font-mono">Cash Gift per Milestone (RA 11982)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-white/80 border border-amber-100 rounded-xl p-3 text-center">
              <span className="block text-[9px] text-amber-500 font-bold uppercase">Octogenarian</span>
              <span className="block text-lg font-black text-amber-700">₱10,000</span>
              <span className="text-[9px] text-slate-400">at 80 & 85 years old</span>
            </div>
            <div className="bg-white/80 border border-amber-100 rounded-xl p-3 text-center">
              <span className="block text-[9px] text-amber-500 font-bold uppercase">Nonagenarian</span>
              <span className="block text-lg font-black text-amber-700">₱10,000</span>
              <span className="text-[9px] text-slate-400">at 90 & 95 years old</span>
            </div>
            <div className="bg-white/80 border border-amber-100 rounded-xl p-3 text-center">
              <span className="block text-[9px] text-red-500 font-bold uppercase">Centenarian</span>
              <span className="block text-lg font-black text-red-600">₱100,000</span>
              <span className="text-[9px] text-slate-400">at 100+ years old + Letter of Felicitation</span>
            </div>
          </div>
          <p className="text-[9px] text-amber-600 italic">
            * Cash gift must be claimed within 1 year of reaching the milestone age. An endorsement letter from the Local Chief Executive is required.
          </p>
        </div>

        {/* Eligible Seniors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-700">Eligible Seniors (80+ years old)</h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{eligibleSeniors.length} eligible</span>
          </div>

          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search for senior (name or OSCA number)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredSeniors.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">No eligible senior citizens found (80+ years old).</p>
              </div>
            ) : (
              filteredSeniors.map(s => {
                const milestones = getApplicableMilestones(s.age);
                const highestMilestone = milestones[milestones.length - 1];
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSenior(s.id); setViewMode('form'); }}
                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                      {s.profilePhoto ? (
                        <img src={s.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User size={16} className="text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-bold text-slate-800">
                        {s.firstName} {s.middleName} {s.lastName} {s.suffix || ''}
                        {s.isDeceased && <span className="ml-1.5 text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">DECEASED</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">{s.oscaNumber}</span>
                        <span className="text-[10px] font-bold text-amber-600">• {s.age} years old</span>
                        {highestMilestone && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            highestMilestone.age >= 100 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {highestMilestone.label.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // Application Form
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Back */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedSenior(null); setViewMode('list'); }}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <h1 className="font-black text-base text-slate-800 uppercase tracking-tight">Application for Honoring</h1>
            <p className="text-[10px] text-slate-400">
              {senior?.firstName} {senior?.lastName} • {senior?.age} years old
              {senior?.isDeceased && ' • DECEASED (Posthumous Application)'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
        {/* Milestone Selection */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
            <Star size={14} className="text-amber-500" /> Select Milestone
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {MILESTONES.filter(m => (senior?.age || 0) >= m.age).map(m => (
              <button
                key={m.type}
                onClick={() => handleMilestoneChange(m.type)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer
                  ${form.milestoneType === m.type
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-200'}`}
              >
                <span className="text-[10px] font-bold text-amber-700 block">{m.label}</span>
                <span className="text-sm font-black text-slate-800">₱{m.amount.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Applicant Type */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
            <User size={14} className="text-indigo-500" /> Applicant Type
          </h3>
          <div className="flex gap-2">
            {(['Self', 'Representative', 'Posthumous'] as const).map(type => (
              <button
                key={type}
                onClick={() => setForm({ ...form, applicantType: type })}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer
                  ${form.applicantType === type
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
              >
                {type === 'Self' && 'Self'}
                {type === 'Representative' && 'Representative'}
                {type === 'Posthumous' && 'Posthumous (Deceased)'}
              </button>
            ))}
          </div>

          {(form.applicantType === 'Representative' || form.applicantType === 'Posthumous') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Representative Name</label>
                <input
                  type="text"
                  value={form.representativeName}
                  onChange={(e) => setForm({ ...form, representativeName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Relationship to Senior</label>
                <input
                  type="text"
                  value={form.representativeRelationship}
                  onChange={(e) => setForm({ ...form, representativeRelationship: e.target.value })}
                  placeholder="e.g. Anak, Apo"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                <input
                  type="text"
                  value={form.representativeContact}
                  onChange={(e) => setForm({ ...form, representativeContact: e.target.value })}
                  placeholder="09XX-XXX-XXXX"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
            <FileText size={14} className="text-teal-500" /> Requirements Checklist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-all">
              <input type="checkbox" checked={form.hasApplicationForm} onChange={(e) => setForm({ ...form, hasApplicationForm: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
              <span className="text-xs text-slate-700">Application Form (NCSC)</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-all">
              <input type="checkbox" checked={form.hasFullBodyPhoto} onChange={(e) => setForm({ ...form, hasFullBodyPhoto: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
              <span className="text-xs text-slate-700">Full-body Photo of Applicant</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-all">
              <input type="checkbox" checked={form.hasEndorsementLetter} onChange={(e) => setForm({ ...form, hasEndorsementLetter: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
              <span className="text-xs text-slate-700">Endorsement Letter (Local Chief Executive)</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-all">
              <input type="checkbox" checked={form.hasBirthCertificate} onChange={(e) => setForm({ ...form, hasBirthCertificate: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
              <span className="text-xs text-slate-700">Birth Certificate / Proof of Age</span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-all">
              <input type="checkbox" checked={form.hasValidId} onChange={(e) => setForm({ ...form, hasValidId: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-teal-600" />
              <span className="text-xs text-slate-700">Valid ID / OSCA ID</span>
            </label>
            {form.applicantType === 'Posthumous' && (
              <label className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl cursor-pointer hover:bg-red-100 transition-all">
                <input type="checkbox" checked={form.hasDeathCertificate} onChange={(e) => setForm({ ...form, hasDeathCertificate: e.target.checked })} className="w-4 h-4 rounded border-red-300 text-red-600" />
                <span className="text-xs text-red-700 font-medium">Death Certificate (for Posthumous)</span>
              </label>
            )}
          </div>
        </div>

        {/* Claim Deadline Reminder */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
          <Clock size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-amber-800 font-bold">Deadline Reminder:</p>
            <p className="text-[10px] text-amber-700">The cash gift must be claimed within <strong>1 year</strong> from reaching the milestone age. After 1 year, the claim expires.</p>
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remarks / Notes (optional)</label>
          <textarea
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            rows={3}
            placeholder="Additional information..."
            className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Award size={14} />
          Submit for LCE Endorsement
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

import { useSeniorsStore } from '../store/seniorsStore';

import { useUIStore } from '../store/uiStore';

import { useAuthStore } from '../store/authStore';

import { NCSCDataForm } from '../types';

import { 

  ClipboardList, Search, User, Briefcase, Heart, Home, Users, 

  CheckCircle, AlertCircle, ChevronRight, FileText, ArrowLeft

} from 'lucide-react';

const INCOME_SOURCES = [

  "Pension",

  "Family Support",

  "Business/Self-Employed",

  "Part-time Employment",

  "Rental Income",

  "No Income",

  "Others"

];

const ILLNESSES = [

  "Hypertension",

  "Diabetes",

  "Arthritis",

  "Heart Disease",

  "Asthma/COPD",

  "Kidney Disease",

  "Cancer",

  "Stroke",

  "Alzheimer's/Dementia",

  "Eye/Vision Problems",

  "Hearing Problems",

  "Others"

];

const ACTIVITIES = [

  "Zumba / Exercise Program",

  "Livelihood Training",

  "Health Seminar",

  "Spiritual Activities",

  "Arts & Crafts",

  "Gardening",

  "Social Gathering",

  "Tourism/Excursion",

  "Others"

];

const PRIMARY_NEEDS = [

  "Medical Assistance",

  "Financial Aid",

  "Food Assistance",

  "Housing Repair",

  "Livelihood Opportunities",

  "Social/Recreational Activities",

  "Legal Assistance",

  "Transportation",

  "Caregiver Support",

  "Others"

];

export default function NCSCInterviewPage() {

  const seniors = useSeniorsStore((state) => state.seniors);

  const { currentUser } = useAuthStore();

  const { showToast, setCurrentPage, selectedSeniorId } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSenior, setSelectedSenior] = useState<string | null>(selectedSeniorId || null);

  const [currentSection, setCurrentSection] = useState(0);

  // Only show approved seniors for interview

  const approvedSeniors = seniors.filter(s => s.status === 'Approved' && !s.isDeceased);

  const filteredSeniors = approvedSeniors.filter(s =>

    `${s.firstName} ${s.lastName} ${s.oscaNumber}`.toLowerCase().includes(searchQuery.toLowerCase())

  );

  const senior = seniors.find(s => s.id === selectedSenior);

  // Generate NCSC Reference Code

  const generateRefCode = () => {

    if (!senior) return '';

    const regionCode = '05'; // Region V

    const provinceCode = '62'; // Sorsogon

    const cityCode = '12'; // Juban

    const brgyCode = senior.barangay?.substring(0, 3).toUpperCase() || 'XXX';

    return `NCSC-${regionCode}${provinceCode}${cityCode}-${brgyCode}-${senior.oscaNumber.split('-').pop()}`;

  };

  // Form state

  const [form, setForm] = useState<Partial<NCSCDataForm>>({

    incomeSource: '',

    estimatedMonthlyIncome: '',

    receivingPension: false,

    pensionType: '',

    pensionAmount: '',

    receivingSocialPension: false,

    isIndigent: false,

    ownsProperty: false,

    propertyType: '',

    healthCondition: '',

    existingIllnesses: [],

    medications: [],

    mobility: 'Independent',

    mentalHealthStatus: '',

    hasPhilHealth: false,

    philHealthCategory: '',

    lastCheckupDate: '',

    hospitalPreference: '',

    livingArrangement: 'With Children',

    householdSize: 1,

    caregiverName: '',

    caregiverRelationship: '',

    caregiverContact: '',

    housingType: 'Owned',

    hasAccessToWater: true,

    hasAccessToElectricity: true,

    hasAccessToSanitation: true,

    memberOfSeniorOrg: false,

    seniorOrgName: '',

    participatesInActivities: false,

    activitiesJoined: [],

    primaryNeeds: [],

    suggestedPrograms: [],

  });

  const sections = [

    { label: 'Economic Profile', icon: Briefcase },

    { label: 'Health Profile', icon: Heart },

    { label: 'Household Profile', icon: Home },

    { label: 'Participation & Needs', icon: Users },

    { label: 'Review & Submit', icon: CheckCircle },

  ];

  const handleIllnessToggle = (illness: string) => {

    const current = form.existingIllnesses || [];

    if (current.includes(illness)) {

      setForm({ ...form, existingIllnesses: current.filter(i => i !== illness) });

    } else {

      setForm({ ...form, existingIllnesses: [...current, illness] });

    }

  };

  const handleActivityToggle = (activity: string) => {

    const current = form.activitiesJoined || [];

    if (current.includes(activity)) {

      setForm({ ...form, activitiesJoined: current.filter(a => a !== activity) });

    } else {

      setForm({ ...form, activitiesJoined: [...current, activity] });

    }

  };

  const handleNeedToggle = (need: string) => {

    const current = form.primaryNeeds || [];

    if (current.includes(need)) {

      setForm({ ...form, primaryNeeds: current.filter(n => n !== need) });

    } else {

      setForm({ ...form, primaryNeeds: [...current, need] });

    }

  };

  const handleSubmit = () => {

    showToast(`NCSC Data Form ni ${senior?.firstName} ${senior?.lastName} ay matagumpay na na-save!`, 'success');

    setSelectedSenior(null);

    setCurrentSection(0);

  };

  // If no senior selected, show selection screen

  if (!selectedSenior) {

    return (

      <div className="space-y-6 animate-fadeIn">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">

              <ClipboardList size={20} className="text-indigo-600" />

            </div>

            <div>

              <h1 className="font-black text-lg text-slate-800 uppercase tracking-tight">NCSC Senior Citizen Data Form</h1>

              <p className="text-[10px] text-slate-400 font-medium">Post-Approval Follow-up Interview • NCSC-SCDF v4.0b</p>

            </div>

          </div>

        </div>

        {/* Info Banner */}

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">

          <FileText size={16} className="text-indigo-600 shrink-0 mt-0.5" />

          <div>

            <p className="text-xs font-bold text-indigo-800">Ano ang NCSC Data Form?</p>

            <p className="text-[10px] text-indigo-600 mt-1 leading-relaxed">

              Ang National Commission of Senior Citizens (NCSC) ay nag-launch ng online registration para makabuo ng reliable database ng lahat ng Filipino Senior Citizens. 

              Ito ay data build-up campaign para sa NCSC's plans, programs, at services. Pagkatapos ma-approve ang OSCA ID, kailangan mag-follow up interview para sa Economic, Health, at Household Profile ng senior.

            </p>

          </div>

        </div>

        {/* Search */}

        <div className="bg-white border border-slate-200 rounded-2xl p-4">

          <div className="relative mb-4">

            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input

              type="text"

              placeholder="Hanapin ang approved senior (pangalan o OSCA number)..."

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"

            />

          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">

            {filteredSeniors.length === 0 ? (

              <div className="text-center py-8 text-slate-400">

                <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />

                <p className="text-xs font-medium">Walang nahanap na approved senior citizen.</p>

              </div>

            ) : (

              filteredSeniors.map(s => (

                <button

                  key={s.id}

                  onClick={() => setSelectedSenior(s.id)}

                  className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all cursor-pointer group"

                >

                  <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">

                    {s.profilePhoto ? (

                      <img src={s.profilePhoto} alt="" className="w-full h-full rounded-full object-cover" />

                    ) : (

                      <User size={16} className="text-indigo-500" />

                    )}

                  </div>

                  <div className="flex-1 text-left">

                    <p className="text-xs font-bold text-slate-800">{s.firstName} {s.middleName} {s.lastName} {s.suffix || ''}</p>

                    <p className="text-[10px] text-slate-400 font-mono">{s.oscaNumber} • Brgy. {s.barangay}</p>

                  </div>

                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />

                </button>

              ))

            )}

          </div>

        </div>

      </div>

    );

  }

  // Interview Form

  return (

    <div className="space-y-6 animate-fadeIn">

      {/* Header with Back */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <button

            onClick={() => { setSelectedSenior(null); setCurrentSection(0); }}

            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"

          >

            <ArrowLeft size={16} className="text-slate-600" />

          </button>

          <div>

            <h1 className="font-black text-base text-slate-800 uppercase tracking-tight">NCSC-SCDF Interview</h1>

            <p className="text-[10px] text-slate-400 font-mono">

              {senior?.firstName} {senior?.lastName} • Ref: {generateRefCode()}

            </p>

          </div>

        </div>

      </div>

      {/* Section Tabs */}

      <div className="flex gap-1.5 overflow-x-auto pb-2">

        {sections.map((section, idx) => {

          const Icon = section.icon;

          return (

            <button

              key={idx}

              onClick={() => setCurrentSection(idx)}

              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer

                ${currentSection === idx 

                  ? 'bg-indigo-600 text-white shadow-md' 

                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}

            >

              <Icon size={12} />

              {section.label}

            </button>

          );

        })}

      </div>

      {/* Form Sections */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">

        {/* Section 0: Economic Profile */}

        {currentSection === 0 && (

          <div className="space-y-4">

            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">

              <Briefcase size={14} className="text-indigo-500" /> Economic Profile

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pinagkukunan ng Kita (Income Source)</label>

                <select

                  value={form.incomeSource}

                  onChange={(e) => setForm({ ...form, incomeSource: e.target.value })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                >

                  <option value="">— Pumili —</option>

                  {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}

                </select>

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tinatantiyang Buwanang Kita</label>

                <select

                  value={form.estimatedMonthlyIncome}

                  onChange={(e) => setForm({ ...form, estimatedMonthlyIncome: e.target.value })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                >

                  <option value="">— Pumili —</option>

                  <option value="Below ₱5,000">Below ₱5,000</option>

                  <option value="₱5,000 - ₱10,000">₱5,000 - ₱10,000</option>

                  <option value="₱10,001 - ₱20,000">₱10,001 - ₱20,000</option>

                  <option value="₱20,001 - ₱50,000">₱20,001 - ₱50,000</option>

                  <option value="Above ₱50,000">Above ₱50,000</option>

                  <option value="No Income">Walang Kita</option>

                </select>

              </div>

              <div className="flex items-center gap-3">

                <input

                  type="checkbox"

                  checked={form.receivingPension}

                  onChange={(e) => setForm({ ...form, receivingPension: e.target.checked })}

                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"

                />

                <label className="text-xs text-slate-700">Tumatanggap ng Pension?</label>

              </div>

              <div className="flex items-center gap-3">

                <input

                  type="checkbox"

                  checked={form.receivingSocialPension}

                  onChange={(e) => setForm({ ...form, receivingSocialPension: e.target.checked })}

                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"

                />

                <label className="text-xs text-slate-700">Tumatanggap ng DSWD Social Pension?</label>

              </div>

              <div className="flex items-center gap-3">

                <input

                  type="checkbox"

                  checked={form.isIndigent}

                  onChange={(e) => setForm({ ...form, isIndigent: e.target.checked })}

                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"

                />

                <label className="text-xs text-slate-700">Indigent / Walang Sapat na Kita?</label>

              </div>

              <div className="flex items-center gap-3">

                <input

                  type="checkbox"

                  checked={form.ownsProperty}

                  onChange={(e) => setForm({ ...form, ownsProperty: e.target.checked })}

                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"

                />

                <label className="text-xs text-slate-700">May Sariling Ari-arian / Property?</label>

              </div>

            </div>

          </div>

        )}

        {/* Section 1: Health Profile */}

        {currentSection === 1 && (

          <div className="space-y-4">

            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">

              <Heart size={14} className="text-rose-500" /> Health Profile

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kalagayan ng Kalusugan (General)</label>

                <select

                  value={form.healthCondition}

                  onChange={(e) => setForm({ ...form, healthCondition: e.target.value })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                >

                  <option value="">— Pumili —</option>

                  <option value="Excellent">Mahusay (Excellent)</option>

                  <option value="Good">Mabuti (Good)</option>

                  <option value="Fair">Katamtaman (Fair)</option>

                  <option value="Poor">Mahina (Poor)</option>

                </select>

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kakayahang Gumalaw (Mobility)</label>

                <select

                  value={form.mobility}

                  onChange={(e) => setForm({ ...form, mobility: e.target.value as any })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                >

                  <option value="Independent">Nakakakilos mag-isa (Independent)</option>

                  <option value="With Assistance">Kailangan ng tulong (With Assistance)</option>

                  <option value="Bedridden">Nakaratay (Bedridden)</option>

                </select>

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Huling Check-up</label>

                <input

                  type="date"

                  value={form.lastCheckupDate}

                  onChange={(e) => setForm({ ...form, lastCheckupDate: e.target.value })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                />

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pinipiling Ospital / Klinika</label>

                <input

                  type="text"

                  value={form.hospitalPreference}

                  onChange={(e) => setForm({ ...form, hospitalPreference: e.target.value })}

                  placeholder="e.g. Sorsogon Provincial Hospital"

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                />

              </div>

            </div>

            <div>

              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mga Karamdaman (Illnesses) — Piliin ang lahat ng applicable:</label>

              <div className="flex flex-wrap gap-2">

                {ILLNESSES.map(illness => (

                  <button

                    key={illness}

                    onClick={() => handleIllnessToggle(illness)}

                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer

                      ${(form.existingIllnesses || []).includes(illness)

                        ? 'bg-rose-100 border-rose-300 text-rose-700'

                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}

                  >

                    {illness}

                  </button>

                ))}

              </div>

            </div>

            <div className="flex items-center gap-3">

              <input

                type="checkbox"

                checked={form.hasPhilHealth}

                onChange={(e) => setForm({ ...form, hasPhilHealth: e.target.checked })}

                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"

              />

              <label className="text-xs text-slate-700">May PhilHealth Coverage?</label>

            </div>

          </div>

        )}

        {/* Section 2: Household Profile */}

        {currentSection === 2 && (

          <div className="space-y-4">

            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">

              <Home size={14} className="text-amber-500" /> Household Profile

            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kaayusan ng Pamumuhay (Living Arrangement)</label>

                <select

                  value={form.livingArrangement}

                  onChange={(e) => setForm({ ...form, livingArrangement: e.target.value as any })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                >

                  <option value="Alone">Mag-isa (Alone)</option>

                  <option value="With Spouse">Kasama ang Asawa (With Spouse)</option>

                  <option value="With Children">Kasama ang mga Anak (With Children)</option>

                  <option value="With Relatives">Kasama ang Kamag-anak (With Relatives)</option>

                  <option value="Institution">Sa Institusyon / Home for the Aged</option>

                </select>

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bilang ng Kasama sa Bahay</label>

                <input

                  type="number"

                  min={1}

                  value={form.householdSize}

                  onChange={(e) => setForm({ ...form, householdSize: parseInt(e.target.value) || 1 })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                />

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Uri ng Bahay (Housing Type)</label>

                <select

                  value={form.housingType}

                  onChange={(e) => setForm({ ...form, housingType: e.target.value as any })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                >

                  <option value="Owned">Sariling Pag-aari (Owned)</option>

                  <option value="Rented">Inuupahan (Rented)</option>

                  <option value="Living with Relative">Kasama sa Bahay ng Kamag-anak</option>

                  <option value="Government Housing">Government Housing</option>

                  <option value="Informal Settlement">Informal Settlement</option>

                </select>

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pangalan ng Caregiver (kung meron)</label>

                <input

                  type="text"

                  value={form.caregiverName}

                  onChange={(e) => setForm({ ...form, caregiverName: e.target.value })}

                  placeholder="Pangalan ng nag-aalaga"

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                />

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Relasyon ng Caregiver</label>

                <input

                  type="text"

                  value={form.caregiverRelationship}

                  onChange={(e) => setForm({ ...form, caregiverRelationship: e.target.value })}

                  placeholder="e.g. Anak, Apo, Asawa"

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                />

              </div>

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact ng Caregiver</label>

                <input

                  type="text"

                  value={form.caregiverContact}

                  onChange={(e) => setForm({ ...form, caregiverContact: e.target.value })}

                  placeholder="09XX-XXX-XXXX"

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                />

              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

              <div className="flex items-center gap-3">

                <input type="checkbox" checked={form.hasAccessToWater} onChange={(e) => setForm({ ...form, hasAccessToWater: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />

                <label className="text-xs text-slate-700">May Tubig (Water)</label>

              </div>

              <div className="flex items-center gap-3">

                <input type="checkbox" checked={form.hasAccessToElectricity} onChange={(e) => setForm({ ...form, hasAccessToElectricity: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />

                <label className="text-xs text-slate-700">May Kuryente (Electricity)</label>

              </div>

              <div className="flex items-center gap-3">

                <input type="checkbox" checked={form.hasAccessToSanitation} onChange={(e) => setForm({ ...form, hasAccessToSanitation: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />

                <label className="text-xs text-slate-700">May Palikuran (Sanitation)</label>

              </div>

            </div>

          </div>

        )}

        {/* Section 3: Participation & Needs */}

        {currentSection === 3 && (

          <div className="space-y-4">

            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">

              <Users size={14} className="text-teal-500" /> Participation & Needs

            </h3>

            <div className="flex items-center gap-3">

              <input

                type="checkbox"

                checked={form.memberOfSeniorOrg}

                onChange={(e) => setForm({ ...form, memberOfSeniorOrg: e.target.checked })}

                className="w-4 h-4 rounded border-slate-300 text-indigo-600"

              />

              <label className="text-xs text-slate-700 font-medium">Miyembro ng Senior Citizens Organization?</label>

            </div>

            {form.memberOfSeniorOrg && (

              <div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pangalan ng Organisasyon</label>

                <input

                  type="text"

                  value={form.seniorOrgName}

                  onChange={(e) => setForm({ ...form, seniorOrgName: e.target.value })}

                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

                />

              </div>

            )}

            <div>

              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mga Aktibidad na Sinasalihan:</label>

              <div className="flex flex-wrap gap-2">

                {ACTIVITIES.map(activity => (

                  <button

                    key={activity}

                    onClick={() => handleActivityToggle(activity)}

                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer

                      ${(form.activitiesJoined || []).includes(activity)

                        ? 'bg-teal-100 border-teal-300 text-teal-700'

                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}

                  >

                    {activity}

                  </button>

                ))}

              </div>

            </div>

            <div>

              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pangunahing Pangangailangan (Primary Needs):</label>

              <div className="flex flex-wrap gap-2">

                {PRIMARY_NEEDS.map(need => (

                  <button

                    key={need}

                    onClick={() => handleNeedToggle(need)}

                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer

                      ${(form.primaryNeeds || []).includes(need)

                        ? 'bg-amber-100 border-amber-300 text-amber-700'

                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}

                  >

                    {need}

                  </button>

                ))}

              </div>

            </div>

          </div>

        )}

        {/* Section 4: Review & Submit */}

        {currentSection === 4 && (

          <div className="space-y-4">

            <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">

              <CheckCircle size={14} className="text-emerald-500" /> Repaso at I-submit

            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">

                <div><span className="text-slate-400">Senior:</span> <strong className="text-slate-700">{senior?.firstName} {senior?.lastName}</strong></div>

                <div><span className="text-slate-400">Ref Code:</span> <strong className="text-slate-700 font-mono">{generateRefCode()}</strong></div>

                <div><span className="text-slate-400">Income:</span> <strong className="text-slate-700">{form.incomeSource || 'N/A'}</strong></div>

                <div><span className="text-slate-400">Monthly:</span> <strong className="text-slate-700">{form.estimatedMonthlyIncome || 'N/A'}</strong></div>

                <div><span className="text-slate-400">Health:</span> <strong className="text-slate-700">{form.healthCondition || 'N/A'}</strong></div>

                <div><span className="text-slate-400">Mobility:</span> <strong className="text-slate-700">{form.mobility}</strong></div>

                <div><span className="text-slate-400">Living:</span> <strong className="text-slate-700">{form.livingArrangement}</strong></div>

                <div><span className="text-slate-400">Housing:</span> <strong className="text-slate-700">{form.housingType}</strong></div>

              </div>

              {(form.existingIllnesses || []).length > 0 && (

                <div className="pt-2 border-t border-slate-200">

                  <span className="text-[10px] text-slate-400 font-bold">Illnesses:</span>

                  <div className="flex flex-wrap gap-1 mt-1">

                    {form.existingIllnesses?.map(i => (

                      <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold rounded-full border border-rose-100">{i}</span>

                    ))}

                  </div>

                </div>

              )}

              {(form.primaryNeeds || []).length > 0 && (

                <div className="pt-2 border-t border-slate-200">

                  <span className="text-[10px] text-slate-400 font-bold">Primary Needs:</span>

                  <div className="flex flex-wrap gap-1 mt-1">

                    {form.primaryNeeds?.map(n => (

                      <span key={n} className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded-full border border-amber-100">{n}</span>

                    ))}

                  </div>

                </div>

              )}

            </div>

            <button

              onClick={handleSubmit}

              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"

            >

              <CheckCircle size={14} />

              I-save ang NCSC Data Form

            </button>

          </div>

        )}

      </div>

      {/* Navigation Buttons */}

      <div className="flex justify-between">

        <button

          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}

          disabled={currentSection === 0}

          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"

        >

          ← Bumalik

        </button>

        {currentSection < sections.length - 1 && (

          <button

            onClick={() => setCurrentSection(currentSection + 1)}

            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"

          >

            Susunod →

          </button>

        )}

      </div>

    </div>

  );

}


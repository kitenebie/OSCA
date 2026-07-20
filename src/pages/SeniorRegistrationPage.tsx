import React, { useState } from 'react';
import { useSeniorsStore } from '../store/seniorsStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { formatOSCANumber } from '../utils/idGenerator';
import AddressMapPicker from '../components/profiling/AddressMapPicker';
import InlineFaceCapture from '../components/profiling/InlineFaceCapture';
import ThumbprintCapture from '../components/profiling/ThumbprintCapture';
import SignaturePad from '../components/profiling/SignaturePad';
import barangaysData from '../Dummy/data/barangays.json';
import { Check, ArrowLeft, ArrowRight, User, MapPin, Camera, FileText, Fingerprint, LucideIcon, Trash, RotateCcw, Upload, FileUp, Eye, ShieldAlert } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  { id: 1, label: 'Location & Address', icon: MapPin },
  { id: 2, label: 'Disaster Risk Info', icon: ShieldAlert },
  { id: 3, label: 'Personal Details', icon: User },
  { id: 4, label: 'IDs & Status', icon: FileText },
  { id: 5, label: 'Address Pin', icon: MapPin },
  { id: 6, label: 'Biometrics Photo', icon: Camera },
  { id: 7, label: 'Signature Pad', icon: FileText },
  { id: 8, label: 'Fingerprint Scan', icon: Fingerprint },
  { id: 9, label: 'Review & Submit', icon: Check }
];

const REGIONS = [
  "Region V (Bicol Region)",
  "Region I (Ilocos Region)",
  "Region II (Cagayan Valley)",
  "Region III (Central Luzon)",
  "Region IV-A (Calabarzon)",
  "MIMAROPA Region",
  "Region VI (Western Visayas)",
  "Region VII (Central Visayas)",
  "Region VIII (Eastern Visayas)",
  "Region IX (Zamboanga Peninsula)",
  "Region X (Northern Mindanao)",
  "Region XI (Davao Region)",
  "Region XII (SOCCSKSARGEN)",
  "Region XIII (Caraga)",
  "BARMM (Autonomous Region in Muslim Mindanao)",
  "CAR (Cordillera Administrative Region)",
  "NCR (National Capital Region)"
];

const PROVINCES = [
  "Sorsogon",
  "Albay",
  "Camarines Sur",
  "Camarines Norte",
  "Catanduanes",
  "Masbate"
];

const CITIES_TOWNS = [
  "Juban",
  "Sorsogon City",
  "Bulan",
  "Casiguran",
  "Castilla",
  "Donsol",
  "Gubat",
  "Irosin",
  "Magallanes",
  "Matnog",
  "Pilar",
  "Prieto Diaz",
  "Santa Magdalena"
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const RELIGIONS = [
  "Roman Catholic",
  "Iglesia Ni Cristo",
  "Christian / Protestant",
  "Islam",
  "Seventh-day Adventist",
  "Jehovah's Witnesses",
  "Aglipayan",
  "None / Other"
];

const EDUCATIONAL_ATTAINMENTS = [
  "No Formal Education",
  "Elementary Level",
  "Elementary Graduate",
  "High School Level",
  "High School Graduate",
  "Vocational / Technical",
  "College Level",
  "College Graduate",
  "Post-Graduate Study"
];

const EMPLOYMENT_STATUSES = [
  "Retired",
  "Unemployed",
  "Employed (Full-time)",
  "Employed (Part-time)",
  "Self-Employed",
  "Other"
];

const CLASSIFICATIONS = [
  "Regular Senior Citizen",
  "Indigent Senior Citizen",
  "PWD Senior Citizen",
  "Solo Parent Senior Citizen",
  "Veteran Senior"
];

const PENSION_OPTIONS = [
  "None",
  "DSWD Social Pension (Php 1,000/mo)",
  "GSIS Pension (Below Php 5,000/mo)",
  "GSIS Pension (Php 5,000 - Php 10,000/mo)",
  "GSIS Pension (Above Php 10,000/mo)",
  "SSS Pension (Below Php 5,000/mo)",
  "SSS Pension (Php 5,000 - Php 10,000/mo)",
  "SSS Pension (Above Php 10,000/mo)",
  "Private Pension",
  "Others"
];

export default function SeniorRegistrationPage() {
  const addSenior = useSeniorsStore((state) => state.addSenior);
  const seniors = useSeniorsStore((state) => state.seniors);
  const showToast = useUIStore((state) => state.showToast);
  const { setCurrentPage } = useUIStore();
  const { currentUser } = useAuthStore();

  const countSeniors = seniors.length;
  const previewYear = new Date().getFullYear();
  const previewCount = String(countSeniors + 1).padStart(4, '0');
  const previewOscaNumber = `OSCA-JUB-${previewYear}-${previewCount}`;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showIdPreview, setShowIdPreview] = useState(false);

  // --- REGISTRATION FORM STATE SCHEMA ---
  const [form, setForm] = useState({
    region: 'Region V (Bicol Region)',
    province: 'Sorsogon',
    cityTown: 'Juban',
    firstName: '',
    middleName: '',
    lastName: '',
    streetAddress: '', // mapped to Address
    telephone: '',
    contactNumber: '', // mapped to Mobile No.
    emailAddress: '',
    birthdate: '',
    birthplace: 'Juban, Sorsogon', // mapped to Place of Birth
    sex: '' as 'Male' | 'Female' | '',
    civilStatus: '' as 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Divorced' | '',
    bloodType: '',
    religion: '',
    highestEducationalAttainment: '',
    gsis: '',
    sss: '',
    tin: '',
    philHealth: '',
    employmentStatus: '',
    classification: '',
    monthlyPension: '',
    emergencyContactName: '', // mapped to In case of Emergency
    emergencyContactPhone: '', // mapped to Contact
    validIdPhoto: null as string | null,

    // Original system fields
    barangay: currentUser?.role === 'Barangay Encoder' ? currentUser.barangayAssigned : '',
    pensionBeneficiary: false,
    coordinates: { lat: 12.8753, lng: 123.9878 }, // Default to Juban
    
    profilePhoto: null as string | null,
    signatureData: null as string | null,
    fingerprintTemplate: null as string | null
  });

  // Dynamic coordinates tracking on Barangay change
  const handleBarangayChange = (brgyName: string) => {
    const brgyObj = barangaysData.find((b) => b.name === brgyName);
    const updatedForm = { ...form, barangay: brgyName };
    if (brgyObj) {
      updatedForm.coordinates = { lat: brgyObj.centerCoordinates.lat, lng: brgyObj.centerCoordinates.lng };
    }
    setForm(updatedForm);
  };

  // Validation before allowing "Next" step
  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      const requiredFields = [
        { key: 'region', label: 'Region' },
        { key: 'province', label: 'Province' },
        { key: 'cityTown', label: 'City/Town' },
        { key: 'barangay', label: 'Barangay' },
        { key: 'streetAddress', label: 'Address' },
      ];

      for (const field of requiredFields) {
        const val = (form as any)[field.key];
        if (!val || (typeof val === 'string' && !val.trim())) {
          showToast(`Pakisuyong punan ang kinakailangang field: ${field.label} *`, 'warning');
          return false;
        }
      }
    }
    if (stepNum === 2) {
      if (form.inRiskArea === 'yes') {
        if (!form.riskType) {
          showToast('Kailangan piliin ang Uri ng Panganib (Risk Type).', 'warning');
          return false;
        }
        if (!form.riskSeverity) {
          showToast('Kailangan piliin ang Critical Level (Severity).', 'warning');
          return false;
        }
        if (form.riskType === 'Others' && (!form.riskDetails || !form.riskDetails.trim())) {
          showToast('Kailangan tukuyin ang Iba pang Panganib (Details).', 'warning');
          return false;
        }
      }
    }
    if (stepNum === 3) {
      const requiredFields = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'contactNumber', label: 'Mobile No.' },
        { key: 'birthdate', label: 'Birthdate' },
        { key: 'birthplace', label: 'Place of Birth' },
        { key: 'sex', label: 'Sex' },
        { key: 'civilStatus', label: 'Civil Status' },
        { key: 'bloodType', label: 'Blood Type' },
        { key: 'religion', label: 'Religion' },
        { key: 'highestEducationalAttainment', label: 'Highest Educational Attainment' },
      ];

      for (const field of requiredFields) {
        const val = (form as any)[field.key];
        if (!val || (typeof val === 'string' && !val.trim())) {
          showToast(`Pakisuyong punan ang kinakailangang field: ${field.label} *`, 'warning');
          return false;
        }
      }
    }
    if (stepNum === 4) {
      const requiredFields = [
        { key: 'employmentStatus', label: 'Employment Status' },
        { key: 'classification', label: 'Classification' },
        { key: 'monthlyPension', label: 'Monthly Pension' },
        { key: 'emergencyContactName', label: 'In case of Emergency' },
        { key: 'emergencyContactPhone', label: 'Contact' },
      ];

      for (const field of requiredFields) {
        const val = (form as any)[field.key];
        if (!val || (typeof val === 'string' && !val.trim())) {
          showToast(`Pakisuyong punan ang kinakailangang field: ${field.label} *`, 'warning');
          return false;
        }
      }
    }
    if (stepNum === 5) {
      // Address Geotag check (defaults exist, always valid)
      return true;
    }
    if (stepNum === 6) {
      if (!form.profilePhoto) {
        showToast('Kailangan kumuha ng biometric profile photo bago magpatuloy.', 'warning');
        return false;
      }
    }
    if (stepNum === 7) {
      if (!form.signatureData) {
        showToast('Kailangan lumagda sa digital signature pad.', 'warning');
        return false;
      }
    }
    if (stepNum === 8) {
      if (!form.fingerprintTemplate) {
        showToast('Mangyaring i-scan ang fingerprint muna sa biometric device.', 'warning');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(8)) return;

    setIsSubmitting(true);
    showToast('Ipinapadala ang rehistro sa LGU database...', 'info');

    // Simulate database write delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Calculate age based on birthdate
    const birthday = new Date(form.birthdate);
    const ageDiff = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDiff);
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

    const mappedSenior = {
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      birthdate: form.birthdate,
      age: calculatedAge,
      sex: form.sex as any,
      civilStatus: form.civilStatus as any,
      contactNumber: form.contactNumber,
      barangay: form.barangay,
      address: form.streetAddress,
      coordinates: form.coordinates,
      profilePhoto: form.profilePhoto || '',
      thumbprintData: form.fingerprintTemplate,
      signatureData: form.signatureData,
      status: 'Pending' as const,
      pensionBeneficiary: form.pensionBeneficiary,
      remarks: form.birthplace,
      registeredBy: currentUser?.fullName || 'LGU Encoder',

      // New registration fields
      region: form.region,
      province: form.province,
      cityTown: form.cityTown,
      telephone: form.telephone,
      emailAddress: form.emailAddress,
      bloodType: form.bloodType,
      religion: form.religion,
      highestEducationalAttainment: form.highestEducationalAttainment,
      gsis: form.gsis,
      sss: form.sss,
      tin: form.tin,
      philHealth: form.philHealth,
      employmentStatus: form.employmentStatus,
      classification: form.classification,
      monthlyPension: form.monthlyPension,
      emergencyContactName: form.emergencyContactName,
      emergencyContactPhone: form.emergencyContactPhone,
      validIdPhoto: form.validIdPhoto || ''
    };

    await addSenior(mappedSenior, currentUser?.fullName || 'LGU Encoder');
    
    setIsSubmitting(false);
    showToast('Matagumpay na nairehistro ang aplikasyon! Nag-broadcast na rin ng SMS Alert sa senior.', 'success');
    setCurrentPage('SeniorsList');
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Page Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:block hidden">
        <h4 className="font-bold text-slate-800 text-sm md:text-base">Bagong Rehistro ng Senior Citizen</h4>
        <p className="text-[11px] text-slate-400">Step-by-step biometric and geographic registration form wizard</p>
      </div>

      {/* Stepper Progress bar (Horizontal on LG+, Simplified on Mobile/Tablet) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm lg:block hidden">
        {/* Desktop View: Full horizontal steps */}
        <div className="relative flex flex-row justify-between items-center w-full">
          {/* Background Connector Line */}
          <div className="absolute left-[5.5%] right-[5.5%] top-[14px] h-[2px] bg-slate-100 z-0">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div 
                key={step.id} 
                onClick={() => {
                  // Only allow jumping back to completed steps
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-150 flex-1
                  ${isActive 
                    ? 'text-teal-700 font-bold scale-[1.03]' 
                    : isCompleted 
                      ? 'text-emerald-600 hover:text-emerald-700' 
                      : 'text-slate-400 cursor-not-allowed'}`}
              >
                {/* Circle step number/icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-colors shadow-sm
                  ${isActive 
                    ? 'bg-teal-600 text-white ring-4 ring-teal-500/10' 
                    : isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-100 border border-slate-200 text-slate-400'}`}
                >
                  {isCompleted ? <Check size={12} className="stroke-[3]" /> : step.id}
                </div>
                {/* Label text */}
                <span className={`text-[9.5px] text-center font-bold tracking-tight max-w-[85px] leading-tight block truncate
                  ${isActive ? 'text-teal-800' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Form step container */}
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm min-h-[400px] flex flex-col justify-between">
        
        <div>
          {/* Mobile View: Unified Stepper Header inside the Form Card */}
          <div className="lg:hidden flex flex-col gap-3 pb-4 border-b border-slate-100 mb-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                  {currentStep}
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-400 font-mono uppercase tracking-wider block font-sans leading-none">
                    Hakbang {currentStep} ng {STEPS.length}
                  </span>
                  <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight mt-1 leading-none">
                    {STEPS[currentStep - 1].label}
                  </h5>
                </div>
              </div>
              
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100 transition-all cursor-pointer"
                >
                  ← Bumalik
                </button>
              )}
            </div>

            {/* Mobile Progress Line */}
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: LOCATION & ADDRESS */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Lokasyon at Residensya (Location & Address)</h5>
                  <p className="text-[10.5px] text-slate-400">Punan ang rehiyonal at barangay address details ng Senior Citizen.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 1 of 9
                  </span>
                </div>
              </div>

              {/* SECTION A: REGIONAL & ADDRESS DETAILS */}
              <div className="space-y-4">
                <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                  Lokasyon at Residensya (Regional & Address details)
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="region-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Region *</label>
                    <select
                      id="region-select"
                      required
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">--Select Region--</option>
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="province-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Province *</label>
                    <select
                      id="province-select"
                      required
                      value={form.province}
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">--Select Province--</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="city-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">City/Town *</label>
                    <select
                      id="city-select"
                      required
                      value={form.cityTown}
                      onChange={(e) => setForm({ ...form, cityTown: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">--Select City/Town--</option>
                      {CITIES_TOWNS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="barangay-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Barangay (Residency) *</label>
                    <select
                      id="barangay-select"
                      disabled={currentUser?.role === 'Barangay Encoder'}
                      value={form.barangay}
                      onChange={(e) => handleBarangayChange(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">--Select Barangay--</option>
                      {barangaysData.map((b) => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label htmlFor="street-address" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Address *</label>
                    <input
                      id="street-address"
                      type="text"
                      required
                      value={form.streetAddress}
                      onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                      placeholder="Enter Address"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DISASTER RISK PROFILING */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Pagsusuri ng Panganib sa Lugar (Disaster Risk Profiling)</h5>
                  <p className="text-[10.5px] text-slate-400">Tukuyin kung ang tirahan ay nasa loob ng mga disaster-prone sectors sa LGU Juban.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 2 of 9
                  </span>
                </div>
              </div>

              {/* SECTION A.2: DISASTER RISK PROFILING */}
              <div className="space-y-3 pt-4">
                <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                  Disaster Risk Profiling (Pagsusuri ng Panganib sa Lugar)
                </h6>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* In Risk Area Select */}
                  <div className="space-y-1.5">
                    <label htmlFor="in-risk-area" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nasa Risk Area Ba? *</label>
                    <select
                      id="in-risk-area"
                      value={form.inRiskArea}
                      onChange={(e) => setForm({ ...form, inRiskArea: e.target.value as 'yes' | 'no' })}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="no">Hindi (No)</option>
                      <option value="yes">Oo (Yes)</option>
                    </select>
                  </div>

                  {/* Type of Risk (Shown only if inRiskArea is yes) */}
                  {form.inRiskArea === 'yes' && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <label htmlFor="risk-type" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Uri ng Panganib (Risk Type) *</label>
                      <select
                        id="risk-type"
                        value={form.riskType}
                        onChange={(e) => setForm({ ...form, riskType: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="">--Select Risk Type--</option>
                        <option value="Flooding">Flooding (Pagbaha)</option>
                        <option value="Landslide">Landslide (Pagguho ng Lupa)</option>
                        <option value="Volcanic Eruption">Volcanic Hazard (Bulkan)</option>
                        <option value="Storm Surge">Storm Surge (Daluyong-Bagyo)</option>
                        <option value="Others">Iba pa (Others)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Severity Level (Shown only if inRiskArea is yes) */}
                {form.inRiskArea === 'yes' && (
                  <div className="space-y-2 animate-fadeIn pt-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Critical Level (Severity) *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* LOW CARD */}
                      <div 
                        onClick={() => setForm({ ...form, riskSeverity: 'low' })}
                        className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between h-[84px]
                          ${form.riskSeverity === 'low'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold">Mababa (Low)</span>
                          <span className={`w-3.5 h-3.5 rounded-full bg-emerald-500`}></span>
                        </div>
                        <span className="text-[9px] leading-tight text-slate-400 mt-1">Ligtas o maliit na banta ng panganib sa lugar.</span>
                      </div>

                      {/* MEDIUM CARD */}
                      <div 
                        onClick={() => setForm({ ...form, riskSeverity: 'medium' })}
                        className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between h-[84px]
                          ${form.riskSeverity === 'medium'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-800 ring-2 ring-amber-500/20 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold">Katamtaman (Medium)</span>
                          <span className={`w-3.5 h-3.5 rounded-full bg-amber-500`}></span>
                        </div>
                        <span className="text-[9px] leading-tight text-slate-400 mt-1">May pana-panahong pagbaha o katamtamang panganib.</span>
                      </div>

                      {/* HIGH CARD */}
                      <div 
                        onClick={() => setForm({ ...form, riskSeverity: 'high' })}
                        className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between h-[84px]
                          ${form.riskSeverity === 'high'
                            ? 'bg-orange-500/10 border-orange-500 text-orange-800 ring-2 ring-orange-500/20 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold">Mataas (High)</span>
                          <span className={`w-3.5 h-3.5 rounded-full bg-orange-500`}></span>
                        </div>
                        <span className="text-[9px] leading-tight text-slate-400 mt-1">Madalas bahain o malapit sa landslide/hazard zones.</span>
                      </div>

                      {/* CRITICAL CARD */}
                      <div 
                        onClick={() => setForm({ ...form, riskSeverity: 'critical' })}
                        className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col justify-between h-[84px]
                          ${form.riskSeverity === 'critical'
                            ? 'bg-red-500/10 border-red-500 text-red-800 ring-2 ring-red-500/20 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold">Kritikal (Critical)</span>
                          <span className={`w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse`}></span>
                        </div>
                        <span className="text-[9px] leading-tight text-slate-400 mt-1">Lubhang mapanganib at kailangang ilikas agad tuwing may banta.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Others custom input (Shown only if inRiskArea is yes and riskType is Others) */}
                {form.inRiskArea === 'yes' && form.riskType === 'Others' && (
                  <div className="space-y-1.5 animate-fadeIn max-w-md">
                    <label htmlFor="risk-details" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Iba pang Panganib (Specify Risk details) *</label>
                    <input
                      id="risk-details"
                      type="text"
                      required
                      value={form.riskDetails}
                      onChange={(e) => setForm({ ...form, riskDetails: e.target.value })}
                      placeholder="Specify the type of risk (e.g. Earthquake, Fire)"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: PERSONAL DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Personal na Impormasyon (Personal Details)</h5>
                  <p className="text-[10.5px] text-slate-400">Paki-sulat ang opisyal na personal at contact details ng Senior Citizen.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 3 of 9
                  </span>
                </div>
              </div>

              {/* SECTION B: PERSONAL DETAILS */}
              <div className="space-y-4">
                <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                  Personal na Impormasyon (Personal details)
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="first-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">FirstName *</label>
                    <input
                      id="first-name"
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Enter FirstName"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="middle-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Middle Name</label>
                    <input
                      id="middle-name"
                      type="text"
                      value={form.middleName}
                      onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                      placeholder="Enter Middle Name"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="last-name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">LastName *</label>
                    <input
                      id="last-name"
                      type="text"
                      required
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Enter LastName"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="birthdate" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Birthdate *</label>
                    <input
                      id="birthdate"
                      type="date"
                      required
                      value={form.birthdate}
                      onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="birthplace" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Place of Birth *</label>
                    <input
                      id="birthplace"
                      type="text"
                      required
                      value={form.birthplace}
                      onChange={(e) => setForm({ ...form, birthplace: e.target.value })}
                      placeholder="Enter Place of Birth"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="sex" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sex *</label>
                    <select
                      id="sex"
                      required
                      value={form.sex}
                      onChange={(e) => setForm({ ...form, sex: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Choose option</option>
                      <option value="Male">Lalake (Male)</option>
                      <option value="Female">Babae (Female)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="civil-status" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Civil Status *</label>
                    <select
                      id="civil-status"
                      required
                      value={form.civilStatus}
                      onChange={(e) => setForm({ ...form, civilStatus: e.target.value as any })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Choose option</option>
                      <option value="Single">Walang Asawa (Single)</option>
                      <option value="Married">May Asawa (Married)</option>
                      <option value="Widowed">Biyudo/Biyuda (Widowed)</option>
                      <option value="Separated">Hiwalay (Separated)</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="blood-type" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Blood Type *</label>
                    <select
                      id="blood-type"
                      required
                      value={form.bloodType}
                      onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Choose option</option>
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION C: CONTACT & OTHER DEMOGRAPHICS */}
              <div className="space-y-4">
                <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                  Pakikipag-ugnayan at Edukasyon (Contact & Demographics)
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-mobile" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mobile No. *</label>
                    <input
                      id="contact-mobile"
                      type="text"
                      required
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      placeholder="Ex. +639412345678"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="telephone" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Telephone</label>
                    <input
                      id="telephone"
                      type="text"
                      value={form.telephone}
                      onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                      placeholder="Enter Telephone"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email-address" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">E-mail Address</label>
                    <input
                      id="email-address"
                      type="email"
                      value={form.emailAddress}
                      onChange={(e) => setForm({ ...form, emailAddress: e.target.value })}
                      placeholder="Enter E-mail Address"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="religion" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Religion *</label>
                    <select
                      id="religion"
                      required
                      value={form.religion}
                      onChange={(e) => setForm({ ...form, religion: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Choose option</option>
                      {RELIGIONS.map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="education" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Highest Educational Attainment *</label>
                    <select
                      id="education"
                      required
                      value={form.highestEducationalAttainment}
                      onChange={(e) => setForm({ ...form, highestEducationalAttainment: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Choose option</option>
                      {EDUCATIONAL_ATTAINMENTS.map((ea) => (
                        <option key={ea} value={ea}>{ea}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GOV'T IDs & STATUS */}
          {currentStep === 4 && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Mga ID, Trabaho at Katayuan (Government IDs & Status)</h5>
                  <p className="text-[10.5px] text-slate-400">Punan ang mga ID card numbers, pension status, at emergency contact details.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 4 of 9
                  </span>
                </div>
              </div>

              {/* SECTION D: GOVERNMENT ID NUMBERS */}
              <div className="space-y-4">
                <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                  Mga Numero ng ID sa Gobyerno (Government Identification Numbers)
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="gsis-no" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">GSIS</label>
                    <input
                      id="gsis-no"
                      type="text"
                      value={form.gsis}
                      onChange={(e) => setForm({ ...form, gsis: e.target.value })}
                      placeholder="Enter GSIS No."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="sss-no" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">SSS</label>
                    <input
                      id="sss-no"
                      type="text"
                      value={form.sss}
                      onChange={(e) => setForm({ ...form, sss: e.target.value })}
                      placeholder="Enter SSS No."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tin-no" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">TIN</label>
                    <input
                      id="tin-no"
                      type="text"
                      value={form.tin}
                      onChange={(e) => setForm({ ...form, tin: e.target.value })}
                      placeholder="Enter TIN No."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="philhealth-no" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">PhilHealth</label>
                    <input
                      id="philhealth-no"
                      type="text"
                      value={form.philHealth}
                      onChange={(e) => setForm({ ...form, philHealth: e.target.value })}
                      placeholder="Enter PhilHealth No."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION E: EMPLOYMENT & CLASSIFICATION */}
              <div className="space-y-4">
                <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                  Trabaho at Klasipikasyon (Employment & Classification details)
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="employment-status" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Employment Status *</label>
                    <select
                      id="employment-status"
                      required
                      value={form.employmentStatus}
                      onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Choose option</option>
                      {EMPLOYMENT_STATUSES.map((es) => (
                        <option key={es} value={es}>{es}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="classification" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Classification *</label>
                    <select
                      id="classification"
                      required
                      value={form.classification}
                      onChange={(e) => setForm({ ...form, classification: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Choose option</option>
                      {CLASSIFICATIONS.map((cl) => (
                        <option key={cl} value={cl}>{cl}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="monthly-pension" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Monthly Pension *</label>
                    <select
                      id="monthly-pension"
                      required
                      value={form.monthlyPension}
                      onChange={(e) => setForm({ ...form, monthlyPension: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="">Choose Option</option>
                      {PENSION_OPTIONS.map((po) => (
                        <option key={po} value={po}>{po}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pension Beneficiary Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md h-12 mt-2">
                  <div className="leading-none">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">Indigent Pension Beneficiary?</span>
                    <span className="text-[8.5px] text-slate-400 mt-0.5">Enrolled for the DSWD Social Pension program</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.pensionBeneficiary}
                    onChange={(e) => setForm({ ...form, pensionBeneficiary: e.target.checked })}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-1 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECTION F: EMERGENCY CONTACTS */}
              <div className="space-y-4">
                <h6 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                  Impormasyon sa Emergency (Emergency Contact Details)
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="emergency-contact" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">In case of Emergency *</label>
                    <input
                      id="emergency-contact"
                      type="text"
                      required
                      value={form.emergencyContactName}
                      onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                      placeholder="Enter In case of Emergency"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="emergency-phone" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Contact *</label>
                    <input
                      id="emergency-phone"
                      type="text"
                      required
                      value={form.emergencyContactPhone}
                      onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                      placeholder="Enter Contact"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>



            </div>
          )}

          {/* STEP 5: ADDRESS GEOTAGGING PIN */}
          {currentStep === 5 && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Lokalidad at Geotag Pinning (Address Details)</h5>
                  <p className="text-[10.5px] text-slate-400">Isulat ang exact address, at i-double-click o i-drag ang pin sa map upang makuha ang GPS coordinates.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 5 of 9
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="street" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Street Address / Phase / Block / Lot *</label>
                <input
                  id="street"
                  type="text"
                  required
                  value={form.streetAddress}
                  onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                  placeholder="e.g. Block 12 Lot 15, Phase 3, Heritage Homes"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Map rendering wrapper */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Juban LGU Geotag Map Node</label>
                <AddressMapPicker
                  value={form.coordinates}
                  onChange={(coords) => setForm({ ...form, coordinates: coords })}
                />
              </div>
            </div>
          )}

          {/* STEP 6: FACE CAPTURE BIOMETRICS */}
          {currentStep === 6 && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Biometric Profile Photo (Camera Sync)</h5>
                  <p className="text-[10.5px] text-slate-400">Kailangan ng malinaw na biometric profile shot laban sa maliwanag na background para sa ID Card rendering.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 6 of 9
                  </span>
                </div>
              </div>

              <InlineFaceCapture
                value={form.profilePhoto}
                onChange={(img) => setForm({ ...form, profilePhoto: img })}
              />
            </div>
          )}

          {/* STEP 7: DIGITAL SIGNATURE PAD */}
          {currentStep === 7 && (
            <div className="space-y-6 max-w-2xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">E-Lagda Digital Signature Pad</h5>
                  <p className="text-[10.5px] text-slate-400">Gawing digital ang lagda ng senior sa pamamagitan ng pagguhit gamit ang mouse o touch-pen sa tablet.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 7 of 9
                  </span>
                </div>
              </div>

              <SignaturePad
                value={form.signatureData}
                onChange={(sig) => setForm({ ...form, signatureData: sig })}
              />
            </div>
          )}

          {/* STEP 8: FINGERPRINT SCAN BIOMETRICS */}
          {currentStep === 8 && (
            <div className="space-y-6 max-w-2xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Fingerprint Biometric Scanner Sync</h5>
                  <p className="text-[10.5px] text-slate-400">I-scan ang hinlalaki ng senior sa connected USB biometric device upang ma-enroll ang fingerprint template.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 8 of 9
                  </span>
                </div>
              </div>

              <ThumbprintCapture
                value={form.fingerprintTemplate}
                onChange={(fp) => setForm({ ...form, fingerprintTemplate: fp })}
              />
            </div>
          )}

          {/* STEP 9: MASTER REVIEW PANEL */}
          {currentStep === 9 && (
            <div className="space-y-6 max-w-4xl animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Pagsusuri bago I-submit (Review Registration Details)</h5>
                  <p className="text-[10.5px] text-slate-400">Suriing mabuti ang lahat ng detalye sa ibaba. Ang records na ito ay isasailalim sa review bago maaprubahan.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">
                    Step 9 of 9
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left side details list */}
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-[11.5px] font-medium text-slate-600">
                  <h6 className="font-bold text-xs text-slate-800 uppercase border-b border-slate-200 pb-1.5 flex justify-between items-center">
                    <span>Master Information Card</span>
                    {form.profilePhoto && (
                      <span className="text-[9px] text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded">✓ Profile Photo Loaded</span>
                    )}
                  </h6>
                  <div className="grid grid-cols-2 gap-3 leading-normal">
                    <div className="col-span-2 p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between" id="generated-id-card-banner">
                      <div>
                        <span className="text-[8.5px] text-teal-700 uppercase tracking-wider block font-bold">Generated OSCA ID (Sistemang ID)</span>
                        <strong className="text-teal-900 font-mono text-xs tracking-wide uppercase">{previewOscaNumber}</strong>
                      </div>
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-teal-600 text-white uppercase tracking-wider">Awtomatiko</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">FirstName</span>
                      <strong className="text-slate-800 uppercase">{form.firstName}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Middle Name</span>
                      <strong className="text-slate-800 uppercase">{form.middleName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">LastName</span>
                      <strong className="text-slate-800 uppercase">{form.lastName}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Sex (Gender)</span>
                      <strong className="text-slate-800 uppercase">{form.sex || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Birthdate</span>
                      <strong className="text-slate-800 font-mono">{form.birthdate}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Place of Birth</span>
                      <strong className="text-slate-800 uppercase">{form.birthplace}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Region</span>
                      <strong className="text-slate-800 uppercase">{form.region}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Province</span>
                      <strong className="text-slate-800 uppercase">{form.province}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">City/Town</span>
                      <strong className="text-slate-800 uppercase">{form.cityTown}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Barangay (Residency)</span>
                      <strong className="text-slate-800 uppercase">Brgy. {form.barangay}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Address</span>
                      <strong className="text-slate-800 uppercase block truncate">{form.streetAddress}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Nasa Risk Area Ba?</span>
                      <strong className={`uppercase ${form.inRiskArea === 'yes' ? 'text-red-600 font-bold' : 'text-slate-800'}`}>
                        {form.inRiskArea === 'yes' ? 'Oo (Yes)' : 'Hindi (No)'}
                      </strong>
                    </div>
                    {form.inRiskArea === 'yes' && (
                      <div>
                        <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Uri at Critical Level</span>
                        <strong className="text-slate-800 uppercase">
                          {form.riskType === 'Others' ? form.riskDetails || 'Others' : form.riskType} ({form.riskSeverity})
                        </strong>
                      </div>
                    )}
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Mobile No.</span>
                      <strong className="text-slate-800 font-mono">{form.contactNumber || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Telephone</span>
                      <strong className="text-slate-800 font-mono">{form.telephone || 'N/A'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">E-mail Address</span>
                      <strong className="text-slate-800 block truncate">{form.emailAddress || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Blood Type</span>
                      <strong className="text-slate-800 uppercase">{form.bloodType || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Religion</span>
                      <strong className="text-slate-800 uppercase">{form.religion || 'N/A'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Highest Educational Attainment</span>
                      <strong className="text-slate-800 uppercase">{form.highestEducationalAttainment || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">GSIS</span>
                      <strong className="text-slate-800 font-mono uppercase">{form.gsis || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">SSS</span>
                      <strong className="text-slate-800 font-mono uppercase">{form.sss || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">TIN</span>
                      <strong className="text-slate-800 font-mono uppercase">{form.tin || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">PhilHealth</span>
                      <strong className="text-slate-800 font-mono uppercase">{form.philHealth || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Employment Status</span>
                      <strong className="text-slate-800 uppercase">{form.employmentStatus || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Classification</span>
                      <strong className="text-slate-800 uppercase">{form.classification || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Monthly Pension</span>
                      <strong className="text-slate-800 uppercase">{form.monthlyPension || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Indigent Beneficiary</span>
                      <strong className="text-slate-800 uppercase">{form.pensionBeneficiary ? 'YES' : 'NO'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">In case of Emergency</span>
                      <strong className="text-slate-800 uppercase">{form.emergencyContactName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">Emergency Contact</span>
                      <strong className="text-slate-800 font-mono uppercase">{form.emergencyContactPhone || 'N/A'}</strong>
                    </div>

                  </div>
                </div>

                {/* Right side attachments checklist */}
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h6 className="font-bold text-xs text-slate-800 uppercase border-b border-slate-200 pb-1.5">Biometrics & Digital Attachments</h6>
                  
                  <div className="space-y-3">
                    
                    {/* Photo Attach status */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Camera size={14} className="text-teal-600" />
                        <span className="text-[11px] font-bold text-slate-700">Photo Capture</span>
                      </div>
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">LOCKED</span>
                    </div>

                    {/* Signature pad Attach status */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-teal-600" />
                        <span className="text-[11px] font-bold text-slate-700">E-Lagda Signature</span>
                      </div>
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">RECORDED</span>
                    </div>

                    {/* Fingerprint Attach status */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Fingerprint size={14} className="text-teal-600" />
                        <span className="text-[11px] font-bold text-slate-700">Fingerprint Scan</span>
                      </div>
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">ENROLLED</span>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Form Wizard Navigation controls */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between shrink-0 mt-8">
          
          {/* Back button */}
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4.5 py-2.5 border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-150 active:scale-95"
            >
              <ArrowLeft size={13} />
              <span>Bumalik (Back)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentPage('SeniorsList')}
              className="px-4.5 py-2.5 border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-500 rounded-xl hover:bg-slate-50 transition-all duration-150 active:scale-95"
            >
              Bumalik sa Listahan
            </button>
          )}

          {/* Next / Submit button */}
          {currentStep < 9 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white rounded-xl shadow-md shadow-teal-600/10 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <span>Ipagpatuloy (Next)</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-xs font-bold text-white rounded-xl shadow-md shadow-emerald-600/10 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <Check size={13} />
              <span>{isSubmitting ? 'Sumusumite (Submitting...)' : 'Isumite ang Aplikasyon (Submit)'}</span>
            </button>
          )}

        </div>

      </div>



    </div>
  );
}

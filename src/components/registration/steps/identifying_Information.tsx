import React, { useState, useRef, useEffect } from 'react';
import { Trash, Upload, Camera } from 'lucide-react';
import AddressMapPicker from '../../profiling/AddressMapPicker';
import CustomSelect from '../../ui/CustomSelect';
import CustomDatePicker from '../../ui/CustomDatePicker';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
  barangaysData: any[];
  currentUser: any;
  handleBarangayChange: (val: string) => void;
  markTouched: (field: string) => void;
  inputErr: (field: string) => string;
}

const REGIONS = [

  "Region V (Bicol Region)",

  // "Region I (Ilocos Region)",

  // "Region II (Cagayan Valley)",

  // "Region III (Central Luzon)",

  // "Region IV-A (Calabarzon)",

  // "MIMAROPA Region",

  // "Region VI (Western Visayas)",

  // "Region VII (Central Visayas)",

  // "Region VIII (Eastern Visayas)",

  // "Region IX (Zamboanga Peninsula)",

  // "Region X (Northern Mindanao)",

  // "Region XI (Davao Region)",

  // "Region XII (SOCCSKSARGEN)",

  // "Region XIII (Caraga)",

  // "BARMM (Autonomous Region in Muslim Mindanao)",

  // "CAR (Cordillera Administrative Region)",

  // "NCR (National Capital Region)"

];

const PROVINCES = [

  "Sorsogon",

  // "Albay",

  // "Camarines Sur",

  // "Camarines Norte",

  // "Catanduanes",

  // "Masbate"

];

const CITIES_TOWNS = [

  "Juban",

  // "Sorsogon City",

  // "Bulan",

  // "Casiguran",

  // "Castilla",

  // "Donsol",

  // "Gubat",

  // "Irosin",

  // "Magallanes",

  // "Matnog",

  // "Pilar",

  // "Prieto Diaz",

  // "Santa Magdalena"

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


const formatGSIS = (val: string) => val.replace(/\D/g, '').slice(0, 11);
const formatSSS = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 2) return digits;
  if (digits.length <= 9) return digits.slice(0, 2) + '-' + digits.slice(2);
  return digits.slice(0, 2) + '-' + digits.slice(2, 9) + '-' + digits.slice(9);
};
const formatTIN = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 12);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.slice(0, 3) + '-' + digits.slice(3);
  if (digits.length <= 9) return digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
  return digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6, 9) + '-' + digits.slice(9);
};
const formatPhilHealth = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 12);
  if (digits.length <= 2) return digits;
  if (digits.length <= 11) return digits.slice(0, 2) + '-' + digits.slice(2);
  return digits.slice(0, 2) + '-' + digits.slice(2, 11) + '-' + digits.slice(11);
};
const isValidGSIS = (val: string) => !val || val.replace(/\D/g, '').length === 11;
const isValidSSS = (val: string) => !val || val.replace(/\D/g, '').length === 10;
const isValidTIN = (val: string) => { const d = val.replace(/\D/g, ''); return !val || d.length === 9 || d.length === 12; };
const isValidPhilHealth = (val: string) => !val || val.replace(/\D/g, '').length === 12;


export default function IdentifyingInformation({ form, setForm, barangaysData, currentUser, handleBarangayChange, markTouched, inputErr }: StepProps) {
  const [addressFocused, setAddressFocused] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = () => {
    setCameraOpen(true);
    setCapturedPreview(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }).catch(() => setCameraOpen(false));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPreview(dataUrl);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const confirmCapture = () => {
    if (capturedPreview) {
      setForm({ ...form, validIdPhoto: capturedPreview });
      setCameraOpen(false);
      setCapturedPreview(null);
    }
  };

  const retakePhoto = () => {
    setCapturedPreview(null);
    startCamera();
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraOpen(false);
    setCapturedPreview(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  return (
    <div className="space-y-6 max-w-full animate-fadeIn">

              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>

                  <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">I. Identifying Information</h5>

                  <p className="text-sm text-slate-400">Complete personal details, address, government IDs, and geolocation of the Senior Citizen.</p>

                </div>

                <div className="flex items-center gap-2">

                  <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">

                    Step 1 of 11

                  </span>

                </div>

              </div>

              {/* SECTION A: LOCATION */}

              <div className="space-y-4">

                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">

                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>

                  Location & Residency

                </h6>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                  <div className="space-y-1.5">

                    <label htmlFor="region-select" className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Region <span className="text-red-500">*</span></label>

                    <CustomSelect
                      value={form.region}
                      onChange={(val) => setForm({ ...form, region: val })}
                      options={REGIONS.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select Region--"
                      onBlur={() => markTouched('region')}
                      searchable
                    />

                  </div>

                  <div className="space-y-1.5">

                    <label htmlFor="province-select" className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Province <span className="text-red-500">*</span></label>

                    <CustomSelect
                      value={form.province}
                      onChange={(val) => setForm({ ...form, province: val })}
                      options={PROVINCES.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select Province--"
                      onBlur={() => markTouched('province')}
                    />

                  </div>

                  <div className="space-y-1.5">

                    <label htmlFor="city-select" className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">City/Town <span className="text-red-500">*</span></label>

                    <CustomSelect
                      value={form.cityTown}
                      onChange={(val) => setForm({ ...form, cityTown: val })}
                      options={CITIES_TOWNS.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select City/Town--"
                      onBlur={() => markTouched('cityTown')}
                    />

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                  <div className="space-y-1.5">

                    <label htmlFor="barangay-select" className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Barangay (Residency) <span className="text-red-500">*</span></label>

                    <CustomSelect
                      value={form.barangay}
                      onChange={(val) => setForm({ ...form, barangay: val })}
                      options={barangaysData.map((b) => ({ value: b.name, label: b.name }))}
                      placeholder="--Select Barangay--"
                      onBlur={() => markTouched('barangay')}
                      searchable
                    />

                  </div>

                  <div className="md:col-span-2 space-y-1.5">

                    <label htmlFor="street-address" className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Address <span className="text-red-500">*</span></label>

                    <div className={`flex items-stretch bg-slate-50 border ${inputErr('streetAddress') || 'border-slate-200'} rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-teal-500`}>
                      <input
                        id="street-address"
                        type="text"
                        required
                        value={addressFocused ? form.streetAddress : (form.streetAddress ? `${form.streetAddress}, ${form.barangay}, ${form.cityTown}, ${form.province}` : '')}
                        onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
                        onFocus={() => setAddressFocused(true)}
                        onBlur={() => {
                          setAddressFocused(false);
                          markTouched('streetAddress');
                        }}
                        placeholder="House No. / Street / Purok / Sitio"
                        className="flex-1 px-3 py-2.5 bg-transparent text-sm font-semibold focus:outline-none"
                      />
                      {addressFocused && (
                      <span className="flex items-center px-3 bg-slate-100 border-l border-slate-200 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {form.barangay || ''}, {form.cityTown || ''}, {form.province || ''}
                      </span>
                      )}
                    </div>

                  </div>

                </div>

              </div>

              {/* SECTION B: PERSONAL DETAILS */}

              <div className="space-y-4">

                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">

                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>

                  Personal Information

                </h6>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Last Name <span className="text-red-500">*</span></label>

                    <input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} onBlur={() => markTouched('lastName')} placeholder="Last Name" className={`w-full px-4 py-2.5 bg-slate-50 border ${inputErr('lastName') || 'border-slate-200'} rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none`} />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">First Name <span className="text-red-500">*</span></label>

                    <input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} onBlur={() => markTouched('firstName')} placeholder="First Name" className={`w-full px-4 py-2.5 bg-slate-50 border ${inputErr('firstName') || 'border-slate-200'} rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none`} />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Middle Name</label>

                    <input type="text" value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} placeholder="Middle Name" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Suffix</label>

                    <input type="text" value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} placeholder="Jr/Sr/III" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Birthdate <span className="text-red-500">*</span></label>

                    <CustomDatePicker
                      value={form.birthdate}
                      onChange={(val) => setForm({ ...form, birthdate: val })}
                      onBlur={() => markTouched('birthdate')}
                      placeholder="Select Birthdate"
                      maxDate={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 60); return d.toISOString().split('T')[0]; })()}
                    />
                    {form.birthdate && <p className="text-emerald-600 text-xs mt-1">Age: {Math.floor((Date.now() - new Date(form.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old ✓</p>}

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Place of Birth</label>

                    <input type="text" value={form.birthplace} onChange={(e) => setForm({ ...form, birthplace: e.target.value })} placeholder="Place of Birth" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Sex <span className="text-red-500">*</span></label>

                    <CustomSelect
                      value={form.sex}
                      onChange={(val) => setForm({ ...form, sex: val as any  })}
                      options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
                      placeholder="--Select--"
                      onBlur={() => markTouched('sex')}
                    />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Civil Status <span className="text-red-500">*</span></label>

                    <CustomSelect
                      value={form.civilStatus}
                      onChange={(val) => setForm({ ...form, civilStatus: val as any  })}
                      options={[{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Widowed', label: 'Widowed' }, { value: 'Separated', label: 'Separated' }, { value: 'Divorced', label: 'Divorced' }]}
                      placeholder="--Select--"
                      onBlur={() => markTouched('civilStatus')}
                    />

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Blood Type</label>

                    <CustomSelect
                      value={form.bloodType}
                      onChange={(val) => setForm({ ...form, bloodType: val })}
                      options={BLOOD_TYPES.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select--"
                    />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Religion</label>

                    <CustomSelect
                      value={form.religion}
                      onChange={(val) => setForm({ ...form, religion: val })}
                      options={RELIGIONS.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select--"
                    />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Ethnic Origin</label>

                    <input type="text" value={form.ethnicOrigin} onChange={(e) => setForm({ ...form, ethnicOrigin: e.target.value })} placeholder="e.g. Bicolano" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Language Spoken</label>

                    <input type="text" value={form.languageSpoken} onChange={(e) => setForm({ ...form, languageSpoken: e.target.value })} placeholder="e.g. Bicol, Tagalog" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Mobile No. <span className="text-red-500">*</span></label>

                    <input type="tel" required value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 11) })} onBlur={() => markTouched('contactNumber')} placeholder="09123456789" maxLength={11} className={`w-full px-4 py-2.5 bg-slate-50 border ${inputErr('contactNumber') || 'border-slate-200'} rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono`} />
                    {form.contactNumber && (form.contactNumber.length !== 11 || !form.contactNumber.startsWith('09')) && <p className="text-red-500 text-xs mt-1">Format: 09XXXXXXXXX (11 digits, starts with 09)</p>}

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Telephone</label>

                    <input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="Landline No." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono" />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>

                    <input type="email" value={form.emailAddress} onChange={(e) => setForm({ ...form, emailAddress: e.target.value })} placeholder="email@example.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />

                  </div>

                </div>

              </div>

              {/* SECTION C: GOVERNMENT IDs & STATUS */}

              <div className="space-y-4">

                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">

                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>

                  Government IDs & Classification

                </h6>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">GSIS No.</label>

                    <input type="text" value={form.gsis} onChange={(e) => setForm({ ...form, gsis: formatGSIS(e.target.value) })} maxLength={11} placeholder="XXXXXXXXXXX (11 digits)" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono" />
                    {form.gsis && !isValidGSIS(form.gsis) && <p className="text-red-500 text-xs mt-1">Format: 11 digits</p>}

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">SSS No.</label>

                    <input type="text" value={form.sss} onChange={(e) => setForm({ ...form, sss: formatSSS(e.target.value) })} maxLength={12} placeholder="XX-XXXXXXX-X" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono" />
                    {form.sss && !isValidSSS(form.sss) && <p className="text-red-500 text-xs mt-1">Format: XX-XXXXXXX-X (10 digits)</p>}

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">TIN</label>

                    <input type="text" value={form.tin} onChange={(e) => setForm({ ...form, tin: formatTIN(e.target.value) })} maxLength={15} placeholder="XXX-XXX-XXX" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono" />
                    {form.tin && !isValidTIN(form.tin) && <p className="text-red-500 text-xs mt-1">Format: XXX-XXX-XXX (9 or 12 digits)</p>}

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">PhilHealth No.</label>

                    <input type="text" value={form.philHealth} onChange={(e) => setForm({ ...form, philHealth: formatPhilHealth(e.target.value) })} maxLength={14} placeholder="XX-XXXXXXXXX-X" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono" />
                    {form.philHealth && !isValidPhilHealth(form.philHealth) && <p className="text-red-500 text-xs mt-1">Format: XX-XXXXXXXXX-X (12 digits)</p>}

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">SC Assoc/Org ID</label>

                    <input type="text" value={form.scAssocOrgId} onChange={(e) => setForm({ ...form, scAssocOrgId: e.target.value })} placeholder="SC Assoc ID" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono" />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Other Govt ID</label>

                    <input type="text" value={form.otherGovtId} onChange={(e) => setForm({ ...form, otherGovtId: e.target.value })} placeholder="Other Govt ID" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono" />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">NCSC Reference Code</label>

                    <input type="text" value={form.ncscReferenceCode || ''} onChange={(e) => setForm({ ...form, ncscReferenceCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 5) })} placeholder="5-digit code" maxLength={5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono tracking-widest" />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Employment Status</label>

                    <CustomSelect
                      value={form.employmentStatus}
                      onChange={(val) => setForm({ ...form, employmentStatus: val })}
                      options={EMPLOYMENT_STATUSES.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select--"
                    />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Classification</label>

                    <CustomSelect
                      value={form.classification}
                      onChange={(val) => setForm({ ...form, classification: val })}
                      options={CLASSIFICATIONS.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select--"
                    />

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Monthly Pension</label>

                    <CustomSelect
                      value={form.monthlyPension}
                      onChange={(val) => setForm({ ...form, monthlyPension: val })}
                      options={PENSION_OPTIONS.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select--"
                      searchable
                    />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Education Attainment</label>

                    <CustomSelect
                      value={form.highestEducationalAttainment}
                      onChange={(val) => setForm({ ...form, highestEducationalAttainment: val })}
                      options={EDUCATIONAL_ATTAINMENTS.map((v) => ({ value: v, label: v }))}
                      placeholder="--Select--"
                    />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Capable to Travel?</label>

                    <CustomSelect
                      value={form.capabilityToTravel ? 'yes' : 'no'}
                      onChange={(val) => setForm({ ...form, capabilityToTravel: val === 'yes' })}
                      options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                      placeholder="Select..."
                    />

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Emergency Contact Name</label>

                    <input type="text" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} placeholder="Emergency Contact" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />

                  </div>

                  <div className="space-y-1.5">

                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Emergency Contact Phone</label>

                    <input type="tel" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="09123456789" maxLength={11} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono" />
                    {form.emergencyContactPhone && (form.emergencyContactPhone.length !== 11 || !form.emergencyContactPhone.startsWith('09')) && <p className="text-red-500 text-xs mt-1">Format: 09XXXXXXXXX (11 digits, starts with 09)</p>}

                  </div>

                </div>

              </div>

              {/* SECTION D: VALID ID & GEOTAG (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                {/* LEFT: Geotag Map */}
                <div className="space-y-4 flex flex-col">
                  <h6 className="text-[13px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                    Geotag Map Pin
                  </h6>
                  <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 min-h-[250px]">
                    <AddressMapPicker
                      value={form.coordinates}
                      onChange={(coords) => setForm({ ...form, coordinates: coords })}
                    />
                  </div>
                </div>
                {/* RIGHT: Upload ID / Capture ID */}
                <div className="space-y-4 flex flex-col">
                  <h6 className="text-[13px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
                    Valid ID
                  </h6>

                  {/* STATE: Camera is open — full width/height camera */}
                  {cameraOpen && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-black relative w-full flex-1 flex flex-col">
                      {capturedPreview ? (
                        <img src={capturedPreview} alt="Captured ID" className="w-full flex-1 object-cover min-h-[250px]" />
                      ) : (
                        <video ref={videoRef} autoPlay playsInline muted className="w-full flex-1 object-cover min-h-[250px]" />
                      )}
                      {/* Camera Controls */}
                      <div className="flex items-center justify-center gap-3 p-3 bg-slate-900/80">
                        {capturedPreview ? (
                          <>
                            <button type="button" onClick={retakePhoto} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold rounded-lg transition-all">
                              Retake
                            </button>
                            <button type="button" onClick={confirmCapture} className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold rounded-lg transition-all">
                              Use Photo
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={capturePhoto} className="w-12 h-12 bg-white rounded-full border-4 border-slate-300 hover:border-teal-400 transition-all flex items-center justify-center">
                            <Camera size={20} className="text-slate-700" />
                          </button>
                        )}
                      </div>
                      <button type="button" onClick={closeCamera} className="absolute top-2 right-2 px-2 py-1 bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold rounded-lg">
                        ✕ Close
                      </button>
                    </div>
                  )}

                  {/* STATE: Photo uploaded — show preview */}
                  {!cameraOpen && form.validIdPhoto && (
                    <div className="relative w-full flex-1 flex flex-col">
                      <img src={form.validIdPhoto} alt="Valid ID" className="w-full flex-1 rounded-xl border border-slate-200 object-cover min-h-[250px]" />
                      <button type="button" onClick={() => setForm({ ...form, validIdPhoto: null })} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                        <Trash size={12} />
                      </button>
                    </div>
                  )}

                  {/* STATE: Idle — show upload + capture button */}
                  {!cameraOpen && !form.validIdPhoto && (
                    <div className="flex flex-col gap-3">
                      {/* Drag & Drop Upload */}
                      <div
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer"
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-teal-400', 'bg-teal-50/30'); }}
                        onDragLeave={(e) => { e.currentTarget.classList.remove('border-teal-400', 'bg-teal-50/30'); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-teal-400', 'bg-teal-50/30');
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setForm({ ...form, validIdPhoto: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                        onClick={() => document.getElementById('id-file-input')?.click()}
                      >
                        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs font-semibold text-slate-500">Drag & drop or click to upload</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
                        <input id="id-file-input" type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setForm({ ...form, validIdPhoto: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>
                      {/* Capture ID Button */}
                      <button type="button" onClick={startCamera} className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-all cursor-pointer">
                        <Camera size={16} />
                        <span>Capture ID (Camera)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
  );
}

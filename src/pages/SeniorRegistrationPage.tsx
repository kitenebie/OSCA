import React, { useState } from 'react';
import { UsbSignaturePadProvider } from '../contexts/UsbSignaturePadContext';



import { useSeniorsStore } from '../store/seniorsStore';



import { auditLogsService } from '../services/supabaseService';



import { useUIStore } from '../store/uiStore';



import { useAuthStore } from '../store/authStore';



import { formatOSCANumber } from '../utils/idGenerator';



import AddressMapPicker from '../components/profiling/AddressMapPicker';



import InlineFaceCapture from '../components/profiling/InlineFaceCapture';



import ThumbprintCapture from '../components/profiling/ThumbprintCapture';



import SignaturePad from '../components/profiling/SignaturePad';



import { useBarangays } from '../hooks/useBarangays';



import { Check, ArrowLeft, ArrowRight, User, MapPin, Camera, FileText, Fingerprint, LucideIcon, Trash, RotateCcw, Upload, FileUp, Eye, ShieldAlert, Users, Heart, Home } from 'lucide-react';



import EducationHRStep from '../components/registration/steps/education_HR_Profile';



import DependencyProfileStep from '../components/registration/steps/dependency_Profile';



import EconomicProfileStep from '../components/registration/steps/economic_Profile';



import HealthProfileStep from '../components/registration/steps/health_Profile';



import AssistingPersonStep from '../components/registration/steps/assisting_Person';



import IdentifyingInformation from '../components/registration/steps/identifying_Information';



import FamilyComposition from '../components/registration/steps/family_Composition';



import BiometricsPhoto from '../components/registration/steps/biometrics_Photo';



import SignaturePadStep from '../components/registration/steps/signature_Pad';



import DisasterRiskInfo from '../components/registration/steps/disaster_Risk_Info';



import ReviewSubmit from '../components/registration/steps/review_Submit';



import CustomDatePicker from '../components/ui/CustomDatePicker';



import CustomSelect from '../components/ui/CustomSelect';



interface Step {



  id: number;



  label: string;



  icon: LucideIcon;



}



const STEPS: Step[] = [



  { id: 1, label: 'Identifying Information', icon: User },



  { id: 2, label: 'Family Composition', icon: Users },



  { id: 3, label: 'Education / HR Profile', icon: FileText },



  { id: 4, label: 'Dependency Profile', icon: Home },



  { id: 5, label: 'Economic Profile', icon: FileText },



  { id: 6, label: 'Health Profile', icon: Heart },



  { id: 7, label: 'Biometrics & Photo', icon: Camera },



  { id: 8, label: 'Signature Pad', icon: FileText },



  { id: 9, label: 'Assisting Person', icon: Users },



  { id: 10, label: 'Disaster Risk Info', icon: ShieldAlert },



  { id: 11, label: 'Review & Submit', icon: Check },



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



  const { barangays: barangaysData } = useBarangays();



  const addSenior = useSeniorsStore((state) => state.addSenior);



  const updateSenior = useSeniorsStore((state) => state.updateSenior);



  const seniors = useSeniorsStore((state) => state.seniors);



  const showToast = useUIStore((state) => state.showToast);



  const { setCurrentPage } = useUIStore();



  const selectedSeniorId = useUIStore((state) => state.selectedSeniorId);



  const { currentUser } = useAuthStore();



  const countSeniors = seniors.length;



  const previewYear = new Date().getFullYear();



  const previewCount = String(countSeniors + 1).padStart(4, '0');



  const previewOscaNumber = `OSCA-JUB-${previewYear}-${previewCount}`;



  // Determine if we're in EDIT mode



  const editingSenior = selectedSeniorId



    ? seniors.find((s) => s.id === selectedSeniorId) || null



    : null;



  const isEditMode = !!editingSenior;



  const [currentStep, setCurrentStep] = useState(1);



  const [isSubmitting, setIsSubmitting] = useState(false);



  const [isCameraOpen, setIsCameraOpen] = useState(false);



  const [showIdPreview, setShowIdPreview] = useState(false);



  // Track which fields have been blurred for validation styling



  const [touched, setTouched] = useState<Record<string, boolean>>({});



  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));



  const isInvalid = (field: string) => touched[field] && !(form as any)[field]?.toString().trim();



  const inputErr = (field: string) => isInvalid(field) ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200';



  const FieldError = ({ field, message }: { field: string; message?: string }) => (



    isInvalid(field) ? <p className="text-red-500 text-xs mt-1">{message || 'This field is required'}</p> : null



  );



  // --- ID Number Format Validators & Formatters ---



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



  // --- REGISTRATION FORM STATE SCHEMA ---



  const [form, setForm] = useState({



    region: editingSenior?.region || 'Region V (Bicol Region)',



    province: editingSenior?.province || 'Sorsogon',



    cityTown: editingSenior?.cityTown || 'Juban',



    firstName: editingSenior?.firstName || '',



    middleName: editingSenior?.middleName || '',



    lastName: editingSenior?.lastName || '',



    suffix: editingSenior?.suffix || '',



    houseNo: editingSenior?.houseNo || '',
    street: editingSenior?.street || '',



    telephone: editingSenior?.telephone || '',



    contactNumber: editingSenior?.contactNumber || '',



    emailAddress: editingSenior?.emailAddress || '',



    birthdate: editingSenior?.birthdate || '',



    birthplace: editingSenior?.remarks || 'Juban, Sorsogon',



    sex: (editingSenior?.sex || '') as 'Male' | 'Female' | '',



    civilStatus: (editingSenior?.civilStatus || '') as 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Divorced' | '',



    bloodType: editingSenior?.bloodType || '',



    religion: editingSenior?.religion || '',



    highestEducationalAttainment: editingSenior?.highestEducationalAttainment || '',



    gsis: editingSenior?.gsis || '',



    sss: editingSenior?.sss || '',



    tin: editingSenior?.tin || '',



    philHealth: editingSenior?.philHealth || '',



    employmentStatus: editingSenior?.employmentStatus || '',



    classification: editingSenior?.classification || '',



    monthlyPension: editingSenior?.monthlyPension || '',



    emergencyContactName: editingSenior?.emergencyContactName || '',



    emergencyContactPhone: editingSenior?.emergencyContactPhone || '',



    validIdPhoto: (editingSenior?.validIdPhoto || null) as string | null,



    // Original system fields



    barangay: editingSenior?.barangay || (currentUser?.role === 'Barangay Encoder' ? currentUser.barangayAssigned : '') || '',



    pensionBeneficiary: editingSenior?.pensionBeneficiary || false,



    coordinates: editingSenior?.coordinates || { lat: 12.8753, lng: 123.9878 },



    



    profilePhoto: (editingSenior?.profilePhoto || null) as string | null,



    signatureData: (editingSenior?.signatureData || null) as string | null,



    fingerprintTemplate: (editingSenior?.thumbprintData || null) as string | null,



    // Disaster risk fields



    inRiskArea: (editingSenior?.inRiskArea || 'no') as 'yes' | 'no',



    riskType: editingSenior?.riskType || '',



    riskDetails: editingSenior?.riskDetails || '',



    riskSeverity: (editingSenior?.riskSeverity || '') as 'low' | 'medium' | 'high' | 'critical' | '',



    // NCSC-aligned fields



    placeOfBirth: editingSenior?.placeOfBirth || '',



    ethnicOrigin: editingSenior?.ethnicOrigin || '',



    languageSpoken: editingSenior?.languageSpoken || '',



    scAssocOrgId: editingSenior?.scAssocOrgId || '',



    otherGovtId: editingSenior?.otherGovtId || '',

    ncscReferenceCode: editingSenior?.ncscReferenceCode || '',



    capabilityToTravel: editingSenior?.capabilityToTravel ?? true,



    serviceBusinessEmployment: editingSenior?.serviceBusinessEmployment || '',



    // Family Composition



    spouseLastName: editingSenior?.spouseLastName || '',



    spouseFirstName: editingSenior?.spouseFirstName || '',



    spouseMiddleName: editingSenior?.spouseMiddleName || '',



    spouseExtension: editingSenior?.spouseExtension || '',



    fatherLastName: editingSenior?.fatherLastName || '',



    fatherFirstName: editingSenior?.fatherFirstName || '',



    fatherMiddleName: editingSenior?.fatherMiddleName || '',



    fatherExtension: editingSenior?.fatherExtension || '',



    motherLastName: editingSenior?.motherLastName || '',



    motherFirstName: editingSenior?.motherFirstName || '',



    motherMiddleName: editingSenior?.motherMiddleName || '',



    children: editingSenior?.children || [],



    dependents: editingSenior?.dependents || [],



    // III. Education / HR Profile



    specializations: (editingSenior?.specializations || []) as string[],



    specOthersText: editingSenior?.specOthersText || '',



    shareSkills: (editingSenior?.shareSkills || ['', '', '']) as string[],



    communityServices: (editingSenior?.communityServices || []) as string[],



    commOthersText: editingSenior?.commOthersText || '',



    // IV. Dependency Profile



    livingWith: (editingSenior?.livingWith || []) as string[],



    livingOthersText: editingSenior?.livingOthersText || '',



    householdCondition: (editingSenior?.householdCondition || []) as string[],



    householdOthersText: editingSenior?.householdOthersText || '',



    // V. Economic Profile



    incomeSources: (editingSenior?.incomeSources || []) as string[],



    incomeOthersText: editingSenior?.incomeOthersText || '',



    realProperties: (editingSenior?.realProperties || []) as string[],



    realPropOthersText: editingSenior?.realPropOthersText || '',



    movableProperties: (editingSenior?.movableProperties || []) as string[],



    movablePropOthersText: editingSenior?.movablePropOthersText || '',



    monthlyIncomeRange: editingSenior?.monthlyIncomeRange || '',



    problemsNeeds: (editingSenior?.problemsNeeds || []) as string[],



    problemsSkillsText: editingSenior?.problemsSkillsText || '',



    problemsLivelihoodText: editingSenior?.problemsLivelihoodText || '',



    problemsOthersText: editingSenior?.problemsOthersText || '',



    // VI. Health Profile



    physicalDisability: editingSenior?.physicalDisability || false,



    physicalDisabilityText: editingSenior?.physicalDisabilityText || '',



    medicalConcerns: (editingSenior?.medicalConcerns || []) as string[],



    medicalOthersText: editingSenior?.medicalOthersText || '',



    dentalConcerns: (editingSenior?.dentalConcerns || []) as string[],



    dentalOthersText: editingSenior?.dentalOthersText || '',



    opticalConcerns: (editingSenior?.opticalConcerns || []) as string[],



    opticalOthersText: editingSenior?.opticalOthersText || '',



    hearingConcerns: (editingSenior?.hearingConcerns || []) as string[],



    hearingOthersText: editingSenior?.hearingOthersText || '',



    socialEmotional: (editingSenior?.socialEmotional || []) as string[],



    socialEmotionalOthersText: editingSenior?.socialEmotionalOthersText || '',



    areaDifficulty: (editingSenior?.areaDifficulty || []) as string[],



    areaDifficultyOthersText: editingSenior?.areaDifficultyOthersText || '',



    medicines: (editingSenior?.medicines || [{ name: '', dosage: '', notes: '' }, { name: '', dosage: '', notes: '' }, { name: '', dosage: '', notes: '' }, { name: '', dosage: '', notes: '' }]) as { name: string; dosage: string; notes: string }[],



    scheduledCheckup: (editingSenior?.scheduledCheckup || '') as 'yes' | 'no' | '',



    checkupFrequency: editingSenior?.checkupFrequency || '',



    // IX. Assisting Person



    assistingPerson1Name: editingSenior?.assistingPerson1Name || '',



    assistingPerson1Relationship: editingSenior?.assistingPerson1Relationship || '',



    assistingPerson2Name: editingSenior?.assistingPerson2Name || '',



    assistingPerson2Relationship: editingSenior?.assistingPerson2Relationship || '',

    assistingPerson1Signature: editingSenior?.assistingPerson1Signature || null,

    assistingPerson2Signature: editingSenior?.assistingPerson2Signature || null,

    interviewerSignature: editingSenior?.interviewerSignature || null,



    interviewerName: editingSenior?.interviewerName || '',



    interviewerOrganization: editingSenior?.interviewerOrganization || '',



    interviewDate: editingSenior?.interviewDate || new Date().toISOString().split('T')[0],



    interviewPlace: editingSenior?.interviewPlace || 'OSCA Office, Juban, Sorsogon',



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



    // Step 1: Identifying Information (location + personal + IDs + address)



    if (stepNum === 1) {



      const requiredFields = [



        { key: 'region', label: 'Region' },



        { key: 'province', label: 'Province' },



        { key: 'cityTown', label: 'City/Town' },



        { key: 'barangay', label: 'Barangay' },

        { key: 'houseNo', label: 'House No.' },



        { key: 'firstName', label: 'First Name' },



        { key: 'lastName', label: 'Last Name' },



        { key: 'contactNumber', label: 'Mobile No.' },



        { key: 'birthdate', label: 'Birthdate' },



        { key: 'sex', label: 'Sex' },



        { key: 'civilStatus', label: 'Civil Status' },



      ];



      for (const field of requiredFields) {



        const val = (form as any)[field.key];



        if (!val || (typeof val === 'string' && !val.trim())) {



          showToast(`Please fill in the required field: ${field.label} *`, 'warning');



          return false;



        }



      }



      // Birthdate must be at least 60 years old



      if (form.birthdate) {



        const age = Math.floor((Date.now() - new Date(form.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));



        if (age < 60) {



          showToast(`Senior citizen must be at least 60 years old. Current age based on birthdate: ${age}`, 'warning');



          return false;



        }



      }



    }



    // Step 2: Family Composition — no hard requirements



    // Step 3: Education / HR Profile — no hard requirements



    // Step 4: Dependency Profile — no hard requirements



    // Step 5: Economic Profile — no hard requirements



    // Step 6: Health Profile — no hard requirements



    // Step 7: Biometrics & Photo



    if (stepNum === 7) {



      if (!form.profilePhoto) {



        showToast('A biometric profile photo is required before proceeding.', 'warning');



        return false;



      }



    }



    // Step 8: Signature Pad



    if (stepNum === 8) {



      if (!form.signatureData) {



        showToast('Please sign on the digital signature pad.', 'warning');



        return false;



      }



    }



    // Step 9: Assisting Person — no hard requirements



    // Step 10: Disaster Risk Info



    if (stepNum === 10) {



      if (form.inRiskArea === 'yes') {



        if (!form.riskType) {



          showToast('Please select the Risk Type.', 'warning');



          return false;



        }



        if (!form.riskSeverity) {



          showToast('Please select the Severity Level.', 'warning');



          return false;



        }



        if (form.riskType === 'Others' && (!form.riskDetails || !form.riskDetails.trim())) {



          showToast('Please specify the Other Risk Details.', 'warning');



          return false;



        }



      }



    }



    return true;



  };



  const handleNext = () => {



    if (validateStep(currentStep)) {

      // Save interviewer data to lookup table when leaving Step 9

      if (currentStep === 9 && form._saveInterviewer) {

        form._saveInterviewer();

      }



      setCurrentStep((prev) => prev + 1);

      window.scrollTo({ top: 0, behavior: 'smooth' });

    }



  };



  const handleBack = () => {



    setCurrentStep((prev) => prev - 1);

    window.scrollTo({ top: 0, behavior: 'smooth' });

  };



  // Submit Handler



  const handleSubmit = async (e: React.FormEvent) => {



    e.preventDefault();



    if (!validateStep(11)) return;



    setIsSubmitting(true);



    showToast('Submitting registration to LGU database...', 'info');



    // Simulate database write delay



    await new Promise((resolve) => setTimeout(resolve, 1200));



    // Calculate age based on birthdate



    const birthday = new Date(form.birthdate);



    const ageDiff = Date.now() - birthday.getTime();



    const ageDate = new Date(ageDiff);



    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);



    if (calculatedAge < 45) {



      showToast('Cannot register: Age must be at least 45 years old.', 'error');



      return;



    }



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



      address: [form.houseNo, form.street, form.barangay, form.cityTown, form.province].filter(Boolean).join(', '),

      houseNo: form.houseNo || '',

      street: form.street || '',



      coordinates: form.coordinates,



      profilePhoto: form.profilePhoto || '',



      thumbprintData: form.fingerprintTemplate,



      signatureData: form.signatureData,



      status: isEditMode && editingSenior ? editingSenior.status : 'Pending' as const,



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



      validIdPhoto: form.validIdPhoto || '',



      suffix: form.suffix || '',



      inRiskArea: form.inRiskArea || 'no',



      riskType: form.riskType || '',



      riskDetails: form.riskDetails || '',



      riskSeverity: form.riskSeverity || undefined,



      // NCSC-aligned fields



      placeOfBirth: form.placeOfBirth || form.birthplace || '',



      ethnicOrigin: form.ethnicOrigin || '',



      languageSpoken: form.languageSpoken || '',



      scAssocOrgId: form.scAssocOrgId || '',



      otherGovtId: form.otherGovtId || '',

      ncscReferenceCode: form.ncscReferenceCode || '',



      capabilityToTravel: form.capabilityToTravel,



      serviceBusinessEmployment: form.serviceBusinessEmployment || '',



      // Family Composition



      spouseLastName: form.spouseLastName || '',



      spouseFirstName: form.spouseFirstName || '',



      spouseMiddleName: form.spouseMiddleName || '',



      spouseExtension: form.spouseExtension || '',



      fatherLastName: form.fatherLastName || '',



      fatherFirstName: form.fatherFirstName || '',



      fatherMiddleName: form.fatherMiddleName || '',



      fatherExtension: form.fatherExtension || '',



      motherLastName: form.motherLastName || '',



      motherFirstName: form.motherFirstName || '',



      motherMiddleName: form.motherMiddleName || '',



      children: form.children || [],



      dependents: form.dependents || [],



      // III. Education / HR Profile



      specializations: form.specializations || [],



      specOthersText: form.specOthersText || '',



      shareSkills: form.shareSkills || ['', '', ''],



      communityServices: form.communityServices || [],



      commOthersText: form.commOthersText || '',



      // IV. Dependency Profile



      livingWith: form.livingWith || [],



      livingOthersText: form.livingOthersText || '',



      householdCondition: form.householdCondition || [],



      householdOthersText: form.householdOthersText || '',



      // V. Economic Profile



      incomeSources: form.incomeSources || [],



      incomeOthersText: form.incomeOthersText || '',



      realProperties: form.realProperties || [],



      realPropOthersText: form.realPropOthersText || '',



      movableProperties: form.movableProperties || [],



      movablePropOthersText: form.movablePropOthersText || '',



      monthlyIncomeRange: form.monthlyIncomeRange || '',



      problemsNeeds: form.problemsNeeds || [],



      problemsSkillsText: form.problemsSkillsText || '',



      problemsLivelihoodText: form.problemsLivelihoodText || '',



      problemsOthersText: form.problemsOthersText || '',



      // VI. Health Profile



      physicalDisability: form.physicalDisability || false,



      physicalDisabilityText: form.physicalDisabilityText || '',



      medicalConcerns: form.medicalConcerns || [],



      medicalOthersText: form.medicalOthersText || '',



      dentalConcerns: form.dentalConcerns || [],



      dentalOthersText: form.dentalOthersText || '',



      opticalConcerns: form.opticalConcerns || [],



      opticalOthersText: form.opticalOthersText || '',



      hearingConcerns: form.hearingConcerns || [],



      hearingOthersText: form.hearingOthersText || '',



      socialEmotional: form.socialEmotional || [],



      socialEmotionalOthersText: form.socialEmotionalOthersText || '',



      areaDifficulty: form.areaDifficulty || [],



      areaDifficultyOthersText: form.areaDifficultyOthersText || '',



      checkupFrequency: form.checkupFrequency || '',

      medicines: form.medicines || [],

      scheduledCheckup: form.scheduledCheckup || '',



      // IX. Assisting Person



      assistingPerson1Name: form.assistingPerson1Name || '',



      assistingPerson1Relationship: form.assistingPerson1Relationship || '',



      assistingPerson2Name: form.assistingPerson2Name || '',



      assistingPerson2Relationship: form.assistingPerson2Relationship || '',

      assistingPerson1Signature: form.assistingPerson1Signature || null,

      assistingPerson2Signature: form.assistingPerson2Signature || null,

      interviewerSignature: form.interviewerSignature || null,



      interviewerName: form.interviewerName || '',



      interviewerOrganization: form.interviewerOrganization || '',



      interviewDate: form.interviewDate || '',



      interviewPlace: form.interviewPlace || '',



    };



    if (isEditMode && editingSenior) {



      // UPDATE existing senior



      await updateSenior(editingSenior.id, mappedSenior);



      setIsSubmitting(false);



      showToast('Senior record updated successfully!', 'success');



      setCurrentPage('SeniorsList');



    } else {



      // CREATE new senior



      await addSenior(mappedSenior, currentUser?.fullName || 'LGU Encoder');



      setIsSubmitting(false);



      showToast('Application successfully registered! SMS Alert has been broadcast to the senior.', 'success');



      // Notify all users



      auditLogsService.log({



        action: 'CREATE',



        entity: 'Senior',



        details: `New Senior Citizen registered: ${form.firstName} ${form.lastName} — Barangay ${form.barangay}`,



        actorName: currentUser?.fullName || 'System',



        actorRole: currentUser?.role || 'encoder',



        barangay: form.barangay,



        severity: 'success',



      });



      setCurrentPage('SeniorsList');



    }



  };



    



  return (
    <UsbSignaturePadProvider>



    <div className="space-y-6 animate-fadeIn font-sans">



      



      {/* Page Title */}



      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:block hidden">



        <h4 className="font-bold text-slate-800 text-base md:text-base">



          {isEditMode ? `Edit Record: ${editingSenior?.firstName} ${editingSenior?.lastName}` : 'New Senior Citizen Registration'}



        </h4>



        <p className="text-sm text-slate-400">



          {isEditMode ? 'Update the senior citizen information' : 'Step-by-step biometric and geographic registration form wizard'}



        </p>



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



                  // In edit mode: allow jumping to ANY step (data is pre-filled)



                  // In new registration: only allow jumping back to completed steps



                  if (isEditMode || step.id < currentStep) {



                    setCurrentStep(step.id);



                  }



                }}



                className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-150 flex-1



                  ${isActive 



                    ? 'text-teal-700 font-bold scale-[1.03]' 



                    : isCompleted 



                      ? 'text-emerald-600 hover:text-emerald-700' 



                      : isEditMode



                        ? 'text-slate-500 hover:text-teal-600 cursor-pointer'



                        : 'text-slate-400 cursor-not-allowed'}`}



              >



                {/* Circle step number/icon */}



                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold font-mono transition-colors shadow-sm



                  ${isActive 



                    ? 'bg-teal-600 text-white ring-4 ring-teal-500/10' 



                    : isCompleted 



                      ? 'bg-emerald-500 text-white' 



                      : isEditMode



                        ? 'bg-slate-200 border border-slate-300 text-slate-600 hover:bg-teal-100 hover:border-teal-300 hover:text-teal-700 transition-colors'



                        : 'bg-slate-100 border border-slate-200 text-slate-400'}`}



                >



                  {isCompleted ? <Check size={12} className="stroke-[3]" /> : step.id}



                </div>



                {/* Label text */}



                <span className={`text-xs text-center font-bold tracking-tight max-w-[85px] leading-tight block truncate



                  ${isActive ? 'text-teal-800' : isCompleted ? 'text-emerald-700' : isEditMode ? 'text-slate-600' : 'text-slate-400'}`}



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



                <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold font-mono shadow-sm">



                  {currentStep}



                </div>



                <div>



                  <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block font-sans leading-none">



                    Step {currentStep} of {STEPS.length}



                  </span>



                  <h5 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight mt-1 leading-none">



                    {STEPS[currentStep - 1].label}



                  </h5>



                </div>



              </div>



              



              {currentStep > 1 && (



                <button



                  type="button"



                  onClick={() => setCurrentStep(prev => prev - 1)}



                  className="text-[13px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100 transition-all cursor-pointer"



                >



                  ← Back



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



            {/* Mobile Edit Mode: Clickable step numbers */}



            {isEditMode && (



              <div className="flex flex-wrap gap-1.5 mt-1">



                {STEPS.map((step) => (



                  <button



                    key={step.id}



                    type="button"



                    onClick={() => setCurrentStep(step.id)}



                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all



                      ${currentStep === step.id



                        ? 'bg-teal-600 text-white ring-2 ring-teal-500/20 scale-110'



                        : 'bg-slate-100 text-slate-600 hover:bg-teal-100 hover:text-teal-700 border border-slate-200 hover:border-teal-300'



                      }`}



                    title={step.label}



                  >



                    {step.id}



                  </button>



                ))}



              </div>



            )}



          </div>



                    {/* STEP 1: IDENTIFYING INFORMATION */}



          {currentStep === 1 && <IdentifyingInformation form={form} setForm={setForm} barangaysData={barangaysData} currentUser={currentUser} handleBarangayChange={handleBarangayChange} markTouched={markTouched} inputErr={inputErr} />}



          {/* STEP 2: FAMILY COMPOSITION */}



          {currentStep === 2 && <FamilyComposition form={form} setForm={setForm} />}



{/* STEP 3: EDUCATION / HR PROFILE */}



          {currentStep === 3 && <EducationHRStep form={form} setForm={setForm} />}



          {/* STEP 4: DEPENDENCY PROFILE */}



          {currentStep === 4 && <DependencyProfileStep form={form} setForm={setForm} />}



          {/* STEP 5: ECONOMIC PROFILE */}



          {currentStep === 5 && <EconomicProfileStep form={form} setForm={setForm} />}



          {/* STEP 6: HEALTH PROFILE */}



          {currentStep === 6 && <HealthProfileStep form={form} setForm={setForm} />}



                    {/* STEP 7: BIOMETRICS & PHOTO */}



          {currentStep === 7 && <BiometricsPhoto form={form} setForm={setForm} />}



          {/* STEP 8: SIGNATURE PAD */}



          {currentStep === 8 && <SignaturePadStep form={form} setForm={setForm} />}



{/* STEP 9: ASSISTING PERSON */}



          {currentStep === 9 && <AssistingPersonStep form={form} setForm={setForm} />}



                    {/* STEP 10: DISASTER RISK INFO */}



          {currentStep === 10 && <DisasterRiskInfo form={form} setForm={setForm} />}



          {/* STEP 11: REVIEW & SUBMIT */}



          {currentStep === 11 && <ReviewSubmit form={form} setForm={setForm} previewOscaNumber={previewOscaNumber} />}



{/* NAVIGATION BUTTONS */}



          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">



          



            {/* Back button */}



            {currentStep > 1 ? (



              <button



                type="button"



                onClick={handleBack}



                className="flex items-center gap-1.5 px-4.5 py-2.5 border border-slate-200 hover:border-slate-400 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-150 active:scale-95"



              >



                <ArrowLeft size={13} />



                <span>Back</span>



              </button>



            ) : (



              <div></div>



            )}



            {/* Next / Submit button */}



            {currentStep < 11 ? (



              <button



                type="button"



                onClick={handleNext}



                className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-sm font-bold text-white rounded-xl shadow-md shadow-teal-600/10 transition-all duration-150 active:scale-95 cursor-pointer"



              >



                <span>Next</span>



                <ArrowRight size={13} />



              </button>



            ) : (



              <button



                type="button"



                disabled={isSubmitting}



                onClick={handleSubmit}



                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-sm font-bold text-white rounded-xl shadow-md shadow-emerald-600/10 transition-all duration-150 active:scale-95 cursor-pointer"



              >



                <Check size={13} />



                <span>{isSubmitting ? 'Submitting...' : isEditMode ? 'Update Record' : 'Submit Application'}</span>



              </button>



            )}



          </div>



        </div>



      </div>



    </div>



    </UsbSignaturePadProvider>
  );



}




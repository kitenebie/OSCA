import React, { useState, useEffect } from 'react';







import { supabase } from '../../utils/supabase';







import { useUIStore } from '../store/uiStore';

import { useAuthStore } from '../store/authStore';

import { useSeniorsStore } from '../store/seniorsStore';

import { auditLogsService } from '../services/supabaseService';







import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, RefreshCw, X, Maximize2, ShieldCheck, ShieldX, User, MapPin, Users, Wallet, Heart, Plus } from 'lucide-react';

// Defined outside the page component so controlled inputs retain focus while
// a field is being edited. A component declared inside the page is recreated
// on every keystroke and React remounts its input.
const EditableInfoRow = ({ label, value, field, record, onUpdate }: {
  label: string;
  value: string | null | undefined;
  field: string;
  record: Record<string, any> | null;
  onUpdate: (field: string, value: string) => void;
}) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <input
      type={field === 'birthdate' || field === 'date_of_death' ? 'date' : field === 'age' ? 'number' : 'text'}
      value={record?.[field] ?? value ?? ''}
      onChange={(event) => onUpdate(field, event.target.value)}
      className="w-full px-3 py-2 mt-1 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
    />
  </div>
);







// Document labels







const DOC_LABELS: Record<string, string> = {







  doc1: 'Accomplished Annex A Grantee/Claimant Form',







  doc2: 'Primary ID for Local Applicants: PSA/LCR issued birth certificate, PhilSys / National ID, or Valid Philippine Passport, Grantee\'s Digital NSCID verified',







  doc3: 'Primary ID for Applicants Abroad: Valid PH Passport or Identification Certificate',







  doc4: 'Secondary IDs: Photocopy of any two (2) identified secondary IDs',







  doc5: 'Whole-body/half-upper body photo',







  doc6: 'Photocopy of Grantee\'s bank-verified deposit slip or screenshot of GCash Profile Information Sheet',







  doc7: 'PSA/LCR Death Certificate or apostilled equivalent document issued overseas',







  doc8: 'Proof of Relationship: Photocopy of PSA/LCR certificates/documents',







  doc9: 'Photocopy of Claimant\'s Bank-verified deposit slip or screenshot of GCash Profile Information',







  doc10: 'Original Copy of Warranty and Release From Liability Form',







  doc11: 'Original LGU/RCF Certification of no relative',







};







const STATUS_OPTIONS = ['All', 'Pending', 'Under Review', 'Verified', 'Approved', 'Rejected', 'Claimed', 'Unclaimed'];







const STATUS_BADGE: Record<string, string> = {







  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',







  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',







  'Verified': 'bg-teal-50 text-teal-700 border-teal-200',







  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',







  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'Claimed': 'bg-purple-50 text-purple-700 border-purple-200',
  'Unclaimed': 'bg-orange-50 text-orange-700 border-orange-200',







};







export default function GranteeClaimFormsPage() {







  const { showToast, selectedFormId, setCurrentPage } = useUIStore();
  const { currentUser, login } = useAuthStore();
  const { seniors, sendSMS, sendBatchSMS } = useSeniorsStore();

  // Password confirmation modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [processingToggle, setProcessingToggle] = useState(false);







  const [records, setRecords] = useState<any[]>([]);

  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [createFormSearch, setCreateFormSearch] = useState('');
  const [showCreateFormSuggestions, setShowCreateFormSuggestions] = useState(false);
  const [creatingForSeniorId, setCreatingForSeniorId] = useState<string | null>(null);







  const [loading, setLoading] = useState(true);







  const [searchQuery, setSearchQuery] = useState('');







  const [statusFilter, setStatusFilter] = useState('All');







  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const logClaimStatusSMS = async (record: any, status: string) => {
    const recipientName = [record.first_name, record.last_name].filter(Boolean).join(' ') || 'Senior Citizen';
    const recipientPhone = record.contact_number?.trim() || '';
    const message = recipientPhone
      ? `Hello ${recipientName}, your OSCA Grantee Claim Form status has been updated to "${status}".`
      : `OSCA Grantee Claim Form status for ${recipientName} was updated to "${status}", but no SMS was sent because no contact number is on file.`;

    const logCreated = await sendSMS(
      recipientName,
      recipientPhone,
      record.barangay || '',
      message,
      currentUser?.fullName || 'OSCA System',
      recipientPhone ? 'Pending' : 'Failed',
    );

    return logCreated;
  };







  const [drawerOpen, setDrawerOpen] = useState(false);







  // Verification state







  const [remarks, setRemarks] = useState('');







  const [rejectRemarks, setRejectRemarks] = useState('');







  const [showRejectInput, setShowRejectInput] = useState(false);







  const [docValidation, setDocValidation] = useState<Record<string, boolean | null>>({});







  const [updatingStatus, setUpdatingStatus] = useState(false);







  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);







  // Verification form fields







  const [isEligible, setIsEligible] = useState(false);







  const [isNotEligible, setIsNotEligible] = useState(false);







  const [verifierName, setVerifierName] = useState('');







  const [verificationDate, setVerificationDate] = useState('');







  const [ncscRegNo, setNcscRegNo] = useState('');







  const [verifierContactInfo, setVerifierContactInfo] = useState('');
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [togglingRegistration, setTogglingRegistration] = useState(false);







  const fetchRecords = async () => {







    setLoading(true);







    const { data, error } = await supabase







      .from('centenarian_honoring')







      .select('*, senior:seniors(status,is_deceased)')







      .order('created_at', { ascending: false });







    if (error) showToast('Failed to load records', 'error');







    else setRecords(data || []);







    setLoading(false);







  };







  useEffect(() => { fetchRecords(); }, []);

  const latestRecordForSenior = (senior: any) => records.find(record => record.osca_number === senior.oscaNumber);
  const isSeniorDeceased = (record: any) => record.senior
    ? Boolean(record.senior.is_deceased || record.senior.status === 'Deceased')
    : Boolean(record.is_deceased);
  const eligibleSeniors = seniors
    .filter(senior => senior.status === 'Qualified for Honoring')
    .filter(senior => {
      const latestRecord = latestRecordForSenior(senior);
      return !latestRecord || latestRecord.status === 'Rejected' || Boolean(latestRecord.deleted_at);
    });
  const filteredEligibleSeniors = eligibleSeniors.filter(senior => {
    const query = createFormSearch.trim().toLowerCase();
    if (!query) return true;
    return `${senior.firstName} ${senior.middleName || ''} ${senior.lastName} ${senior.suffix || ''} ${senior.oscaNumber} ${senior.barangay || ''}`
      .toLowerCase().includes(query);
  });
  const createFormSuggestions = createFormSearch.trim()
    ? filteredEligibleSeniors.slice(0, 5)
    : [];

  const handleCreateClaimForm = async (senior: any) => {
    setCreatingForSeniorId(senior.id);
    try {
      // Re-check eligibility and duplicate forms against the database before creating.
      const { data: currentSenior, error: seniorError } = await supabase
        .from('seniors')
        .select('id, status, is_deceased')
        .eq('id', senior.id)
        .maybeSingle();
      if (seniorError) throw seniorError;
      if (!currentSenior || currentSenior.status !== 'Qualified for Honoring') {
        showToast('This senior is no longer qualified for the form.', 'error');
        return;
      }

      const { data: existingRecord, error: existingError } = await supabase
        .from('centenarian_honoring')
        .select('id, status, deleted_at')
        .eq('osca_number', senior.oscaNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existingRecord && existingRecord.status !== 'Rejected' && !existingRecord.deleted_at) {
        showToast('This senior already has an active claim form.', 'error');
        await fetchRecords();
        return;
      }

      const claimFormId = `cen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const { error: insertError } = await supabase.from('centenarian_honoring').insert({
        id: claimFormId,
        senior_id: senior.id,
        status: 'Pending',
        is_deceased: currentSenior.is_deceased || currentSenior.status === 'Deceased',
        ...Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`is_doc${i + 1}_valid`, null])),
        osca_number: senior.oscaNumber,
        first_name: senior.firstName,
        middle_name: senior.middleName || null,
        last_name: senior.lastName,
        suffix: senior.suffix || null,
        birthdate: senior.birthdate || null,
        age: senior.age || null,
        contact_number: senior.contactNumber || null,
        sex: senior.sex || null,
        civil_status: senior.civilStatus || null,
        address: senior.address || null,
        barangay: senior.barangay || null,
        city_town: senior.cityTown || null,
        province: senior.province || null,
        region: senior.region || null,
      });
      if (insertError) throw insertError;

      auditLogsService.log({
        action: 'CREATE',
        entity: 'Grantee Claim Form',
        details: `${currentUser?.fullName || 'Staff'} created a claim form for ${senior.firstName} ${senior.lastName} (${senior.oscaNumber}).`,
        actorName: currentUser?.fullName || 'Staff',
        actorRole: currentUser?.role || 'admin',
        barangay: senior.barangay || '',
        severity: 'success',
        targetPage: 'GranteeClaimForms',
        targetId: claimFormId,
      });

      showToast(`Claim form created for ${senior.firstName} ${senior.lastName}.`, 'success');
      setShowCreateFormModal(false);
      setCreateFormSearch('');
      await fetchRecords();
    } catch (error) {
      console.error('Create claim form error:', error);
      showToast('Failed to create claim form. Please try again.', 'error');
    } finally {
      setCreatingForSeniorId(null);
    }
  };

  // Load registration toggle setting
  useEffect(() => {
    const loadSetting = async () => {
      const { data } = await supabase.from('system_settings').select('setting_value').eq('setting_key', 'grantee_form_registration_enabled').maybeSingle();
      setRegistrationEnabled(data?.setting_value === 'true');
    };
    loadSetting();
  }, []);

  // Toggle registration ON/OFF
  const handleToggleRegistration = async () => {
    if (!registrationEnabled) {
      // Turning ON — show password modal first
      setConfirmPassword('');
      setPasswordError('');
      setShowPasswordModal(true);
    } else {
      // Turning OFF — just disable directly
      setTogglingRegistration(true);
      await supabase.from('system_settings').upsert({ setting_key: 'grantee_form_registration_enabled', setting_value: 'false' }, { onConflict: 'setting_key' });
      setRegistrationEnabled(false);
      setTogglingRegistration(false);
      showToast('Registration disabled', 'success');
    }
  };

  // Generate random 10-character password (uppercase + numbers)
  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Confirm password and process toggle ON
  const handleConfirmToggleOn = async () => {
    if (!confirmPassword.trim()) {
      setPasswordError('Please enter your password.');
      return;
    }
    if (!currentUser) return;

    setProcessingToggle(true);
    setPasswordError('');

    try {
      // Verify admin password via login attempt
      const success = await login(currentUser.username || currentUser.fullName, confirmPassword, false);
      if (!success) {
        setPasswordError('Incorrect password. Please try again.');
        setProcessingToggle(false);
        return;
      }

      // 1. Enable registration setting
      await supabase.from('system_settings').upsert({ setting_key: 'grantee_form_registration_enabled', setting_value: 'true' }, { onConflict: 'setting_key' });
      setRegistrationEnabled(true);

      // 2. Get all seniors with status "Qualified for Honoring"
      const qualifiedSeniors = seniors.filter(s => s.status === 'Qualified for Honoring' && s.contactNumber);

      // 3. Generate passwords and update + send SMS
      let smsCount = 0;
      for (const senior of qualifiedSeniors) {
        const newPassword = generatePassword();

        // Update password in seniors table
        await supabase.from('seniors').update({ password: newPassword }).eq('id', senior.id);

        // Send SMS
        const smsMessage = `The OSCA Grantee Claim Forms is now OPEN. Go to OSCA official page, click "Register for Grantee Claim Form". Enter your OSCA ID: ${senior.oscaNumber} and this is your password: ${newPassword}. Start to fill up your form.`;
        await sendSMS(
          `${senior.firstName} ${senior.lastName}`,
          senior.contactNumber,
          senior.barangay,
          smsMessage,
          currentUser.fullName
        );
        smsCount++;
      }

      // 4. Audit log
      auditLogsService.log({
        action: 'TOGGLE',
        entity: 'Grantee Registration',
        details: `${currentUser.fullName} enabled Grantee Claim Form registration. Generated passwords and sent SMS to ${smsCount} qualified seniors.`,
        actorName: currentUser.fullName,
        actorRole: currentUser.role || 'admin',
        barangay: '',
        severity: 'success',
      });

      setShowPasswordModal(false);
      showToast(`Registration enabled! SMS sent to ${smsCount} qualified senior(s).`, 'success');
    } catch (err) {
      console.error('Toggle ON error:', err);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setProcessingToggle(false);
    }
  };








  const filtered = records.filter(r => {







    const matchesSearch = searchQuery === '' ||







      `${r.first_name} ${r.middle_name || ''} ${r.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||







      (r.osca_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||







      (r.ncsc_reference_code || '').toLowerCase().includes(searchQuery.toLowerCase());







    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;







    return matchesSearch && matchesStatus;







  });







  // Open drawer with record







  const openDrawer = (record: any) => {







    setSelectedRecord(record);







    setRemarks(record.remarks_note_lacking_docs || '');







    setIsEligible(Boolean(record.is_eligible));







    setIsNotEligible(Boolean(record.is_not_eligible && !record.is_eligible));







    setVerifierName(record.verifier_signature_name || '');







    setVerificationDate(record.verification_date || '');







    setNcscRegNo(record.ncsc_reg_no || '');







    setVerifierContactInfo(record.verifier_contact_info || '');







    setShowRejectInput(false);







    setRejectRemarks('');







    // Load doc validation (simple boolean per doc)







    const validation: Record<string, boolean | null> = {};







    for (let i = 1; i <= 11; i++) {







      const key = `doc${i}`;
      const wasDefaultInvalid = record[`is_doc${i}_valid`] === false && !(record[key] || []).length && !String(record.invalid_documents || '').includes(DOC_LABELS[key]);
      validation[key] = wasDefaultInvalid ? null : record[`is_doc${i}_valid`] ?? null;







    }







    setDocValidation(validation);







    setDrawerOpen(true);







  };







  useEffect(() => {
    if (!selectedFormId || !records.length) return;
    const formRecord = records.find((record) => record.id === selectedFormId);
    if (!formRecord) return;
    openDrawer(formRecord);
    setCurrentPage('GranteeClaimForms');
  }, [selectedFormId, records, setCurrentPage]);

  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => setSelectedRecord(null), 300); };







  // Toggle file validation







  // Toggle document validation (valid/invalid per document type)







  const setDocValid = (docKey: string, isValid: boolean | null) => {

    setDocValidation(prev => ({ ...prev, [docKey]: isValid }));

    // Auto-append/remove invalid doc name in remarks

    const docLabel = DOC_LABELS[docKey];

    const invalidTag = `invalid ${docLabel}`;

    if (isValid === false) {

      // Append if not already in remarks

      setRemarks(prev => {

        if (prev.includes(invalidTag)) return prev;

        return prev ? `${prev}\n${invalidTag}` : invalidTag;

      });

    } else {

      // Remove from remarks if previously added

      setRemarks(prev => prev.split('\n').filter(line => line.trim() !== invalidTag).join('\n'));

    }

  };







  // Get list of invalid document names







  // Get list of invalid document names







  const getInvalidDocNames = (): string => {







    const invalidDocs: string[] = [];







    for (let i = 1; i <= 11; i++) {







      const key = `doc${i}`;







      if (docValidation[key] === false) {







        invalidDocs.push(`invalid ${DOC_LABELS[key]}`);







      }







    }







    return invalidDocs.join(', ');







  };







  // Save verification + doc validation







  const handleSave = async (): Promise<boolean> => {







    if (!selectedRecord || selectedRecord.status === 'Rejected') return false;







    setUpdatingStatus(true);







    const invalidDocNames = getInvalidDocNames();







    const editableFields = [
      'ncsc_reference_code', 'osca_number', 'first_name', 'middle_name', 'last_name', 'suffix',
      'birthdate', 'age', 'sex', 'civil_status', 'citizenship', 'contact_number', 'address',
      'barangay', 'city_town', 'province', 'region', 'zip_code', 'ethnic_origin',
      'physical_disability_text', 'abroad_house_no', 'abroad_street', 'abroad_city',
      'abroad_state', 'abroad_country', 'abroad_zip_code', 'spouse_last_name',
      'spouse_first_name', 'spouse_middle_name', 'spouse_contact_number', 'date_of_death',
      'claimant_first_name', 'claimant_middle_name', 'claimant_last_name', 'claimant_relationship',
      'claimant_contact_number', 'claimant_email', 'claimant_payment_mode',
      'claimant_account_number', 'claimant_bank_name', 'claimant_branch_name',
      'preferred_payment_mode', 'account_number', 'bank_name', 'branch_name', 'bank_address',
      'is_joint_account', 'children',
    ];
    const editableRecord = Object.fromEntries(
      editableFields.map((field) => [field, selectedRecord[field] ?? null]),
    );

    const updatePayload: any = {
      ...editableRecord,







      remarks_note_lacking_docs: remarks || null,







      is_eligible: isEligible,







      is_not_eligible: isNotEligible,







      verifier_signature_name: verifierName || null,







      verification_date: verificationDate || null,







      ncsc_reg_no: ncscRegNo || null,







      verifier_contact_info: verifierContactInfo || null,







      invalid_documents: invalidDocNames || null,







    };







    // Save doc validation booleans







    for (let i = 1; i <= 11; i++) {







      updatePayload[`is_doc${i}_valid`] = docValidation[`doc${i}`] ?? null;







    }







    const { error } = await supabase.from('centenarian_honoring').update(updatePayload).eq('id', selectedRecord.id);







    if (error) showToast('Failed to save', 'error');







    else { showToast('Form details and verification saved', 'success'); fetchRecords(); }







    setUpdatingStatus(false);

    return !error;







  };







  // Approve







  const handleApprove = async () => {
    if (!selectedRecord || selectedRecord.status === 'Rejected') return;
    setUpdatingStatus(true);
    if (!(await handleSave())) return;

    const { error } = await supabase.from('centenarian_honoring').update({ status: 'Approved' }).eq('id', selectedRecord.id);
    if (error) showToast('Failed to approve', 'error');
    else {
      const logCreated = await logClaimStatusSMS(selectedRecord, 'Approved');
      showToast(logCreated ? 'Claim form APPROVED' : 'Claim form approved, but the SMS log could not be saved.', logCreated ? 'success' : 'error');
      setSelectedRecord({ ...selectedRecord, status: 'Approved' });
      fetchRecords();
    }
    setUpdatingStatus(false);
  };

  const handleRestore = async () => {
    if (!selectedRecord || selectedRecord.status !== 'Rejected') return;
    setUpdatingStatus(true);
    const { error } = await supabase.from('centenarian_honoring').update({
      status: 'Pending',
      is_eligible: false,
      is_not_eligible: false,
    }).eq('id', selectedRecord.id);
    if (error) showToast('Failed to restore claim form', 'error');
    else {
      const logCreated = await logClaimStatusSMS(selectedRecord, 'Pending');
      showToast(logCreated ? 'Claim form restored to Pending' : 'Claim form restored, but the SMS log could not be saved.', logCreated ? 'success' : 'error');
      setIsEligible(false);
      setIsNotEligible(false);
      setSelectedRecord({ ...selectedRecord, status: 'Pending', is_eligible: false, is_not_eligible: false });
      setShowRejectInput(false);
      fetchRecords();
    }
    setUpdatingStatus(false);
  };

  // Reject







  const handleReject = async () => {







    if (!rejectRemarks.trim()) { showToast('Please enter remarks for rejection', 'error'); return; }







    if (!selectedRecord) return;







    setUpdatingStatus(true);







    const invalidDocNames = getInvalidDocNames();







    const fullRemarks = [remarks, rejectRemarks, invalidDocNames].filter(Boolean).join('\n');







    const updatePayload: any = {







      status: 'Rejected',







      remarks_note_lacking_docs: fullRemarks || null,







      invalid_documents: invalidDocNames || null,







      is_eligible: false,







      is_not_eligible: true,







    };







    for (let i = 1; i <= 11; i++) {







      updatePayload[`is_doc${i}_valid`] = docValidation[`doc${i}`] ?? null;







    }







    const { error } = await supabase.from('centenarian_honoring').update(updatePayload).eq('id', selectedRecord.id);







    if (error) showToast('Failed to reject', 'error');







    else {







      const logCreated = await logClaimStatusSMS(selectedRecord, 'Rejected');
      showToast(logCreated ? 'Claim form REJECTED' : 'Claim form rejected, but the SMS log could not be saved.', logCreated ? 'success' : 'error');







      setSelectedRecord({ ...selectedRecord, status: 'Rejected' });







      fetchRecords();







    }







    setUpdatingStatus(false);







    setShowRejectInput(false);







  };







  const formatDate = (d: string) => {







    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }







    catch { return d; }







  };







  const updateSelectedRecord = (field: string, value: string) => {
    setSelectedRecord((record: any) => record ? { ...record, [field]: value } : record);
  };

  return (







    <div className="space-y-6 animate-fadeIn font-sans">







      {/* Page Header */}







      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">







        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">







          <div className="flex items-center gap-3">







            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">







              <FileText size={20} className="text-amber-600" />







            </div>







            <div>







              <h4 className="font-bold text-slate-800 text-base">Grantee Claim Forms</h4>







              <p className="text-sm text-slate-400">R.A. 11982 — Centenarian Honoring Program</p>







            </div>







          </div>







          <div className="flex items-center gap-2">
            {/* Registration Toggle */}
            <div className="flex items-center gap-2 mr-3 pr-3 border-r border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Registration</span>
              <button
                onClick={handleToggleRegistration}
                disabled={togglingRegistration}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${registrationEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${registrationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-[11px] font-bold ${registrationEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>{registrationEnabled ? 'ON' : 'OFF'}</span>
            </div>







            <button
              onClick={() => { setCreateFormSearch(''); setShowCreateFormModal(true); }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <Plus size={15} /> Create New Form
            </button>

            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">{filtered.length} Record{filtered.length !== 1 ? 's' : ''}</span>







            <button onClick={fetchRecords} className="p-2 hover:bg-slate-100 rounded-xl transition-colors" title="Refresh">







              <RefreshCw size={16} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />







            </button>







          </div>







        </div>







      </div>







      {/* Filters */}







      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">







        <div className="flex-1 relative">







          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />







          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}







            placeholder="Search by name, OSCA No., or NCSC Ref..."







            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />







        </div>







        <div className="flex items-center gap-2 flex-wrap">







          <Filter size={14} className="text-slate-400" />







          {STATUS_OPTIONS.map(s => (







            <button key={s} onClick={() => setStatusFilter(s)}







              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${statusFilter === s ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>







              {s}







            </button>







          ))}







        </div>







      </div>







      {/* Table */}







      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">







        {loading ? (







          <div className="flex items-center justify-center p-12">







            <RefreshCw size={24} className="text-teal-500 animate-spin" />







            <span className="text-sm text-slate-400 font-medium ml-3">Loading records...</span>







          </div>







        ) : filtered.length === 0 ? (







          <div className="flex items-center justify-center p-12">







            <div className="text-center space-y-2">







              <FileText size={32} className="text-slate-300 mx-auto" />







              <p className="text-sm text-slate-400 font-medium">No claim forms found</p>







            </div>







          </div>







        ) : (







          <div className="overflow-x-auto">







            <table className="w-full">







              <thead>







                <tr className="border-b border-slate-100 bg-slate-50/50">







                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</th>







                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">OSCA No.</th>







                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Barangay</th>







                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age/Sex</th>







                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>







                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>







                  <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date Filed</th>







                  <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>







                </tr>







              </thead>







              <tbody>







                {filtered.map((record) => (







                  <tr key={record.id} className="border-b border-slate-50 hover:bg-teal-50/30 transition-colors">







                    <td className="px-4 py-3">







                      <span className="text-sm font-bold text-slate-800">{record.first_name} {record.middle_name ? record.middle_name[0] + '. ' : ''}{record.last_name}</span>







                      {record.suffix && record.suffix !== 'N/A' && <span className="text-xs text-slate-400 ml-1">{record.suffix}</span>}







                    </td>







                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{record.osca_number || '—'}</td>







                    <td className="px-4 py-3 text-xs text-slate-600 font-medium">{record.barangay || '—'}</td>







                    <td className="px-4 py-3 text-xs text-slate-600">{record.age || '—'} / {record.sex?.[0] || '—'}</td>







                    <td className="px-4 py-3">







                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isSeniorDeceased(record) ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>







                        {isSeniorDeceased(record) ? 'Deceased' : 'Living'}







                      </span>







                    </td>







                    <td className="px-4 py-3">







                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_BADGE[record.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>







                        {record.status}







                      </span>







                    </td>







                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(record.created_at)}</td>







                    <td className="px-4 py-3 text-center">







                      <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => openDrawer(record)}







                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5 mx-auto" title="View">







                        <Eye size={13} className="text-teal-600" />







                        <span className="text-[11px] font-bold text-teal-700">View</span>







                      </button>
                {record.status === 'Approved' && (
                  <>
                    <button onClick={async () => {
                      const { error } = await supabase.from('centenarian_honoring').update({ status: 'Claimed' }).eq('id', record.id);
                      if (error) showToast('Failed to mark as Claimed', 'error');
                      else {
                        const logCreated = await logClaimStatusSMS(record, 'Claimed');
                        showToast(logCreated ? 'Marked as Claimed' : 'Marked as Claimed, but the SMS log could not be saved.', logCreated ? 'success' : 'error');
                        fetchRecords();
                      }
                    }} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5" title="Mark as Claimed">
                      <CheckCircle size={13} className="text-emerald-600" />
                      <span className="text-[11px] font-bold text-emerald-700">Claimed</span>
                    </button>
                    <button onClick={async () => {
                      const { error } = await supabase.from('centenarian_honoring').update({ status: 'Unclaimed' }).eq('id', record.id);
                      if (error) showToast('Failed to mark as Unclaimed', 'error');
                      else {
                        const logCreated = await logClaimStatusSMS(record, 'Unclaimed');
                        showToast(logCreated ? 'Marked as Unclaimed' : 'Marked as Unclaimed, but the SMS log could not be saved.', logCreated ? 'success' : 'error');
                        fetchRecords();
                      }
                    }} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5" title="Mark as Unclaimed">
                      <Clock size={13} className="text-amber-600" />
                      <span className="text-[11px] font-bold text-amber-700">Unclaimed</span>
                    </button>
                  </>
                )}
                      </div>
                    </td>







                  </tr>







                ))}







              </tbody>







            </table>







          </div>







        )}







      </div>







      {/* ===== 95% DRAWER ===== */}







      <div className={`fixed inset-0 z-50 flex transition-all duration-300 ${drawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>







          {/* Overlay */}







          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500" onClick={closeDrawer} />







          {/* Drawer Panel */}







          <div className={`relative ml-auto w-[95%] h-full bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>







            {selectedRecord && (<>



            {/* Drawer Header */}







            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">







              <div className="flex items-center gap-3">







                <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">







                  <FileText size={18} className="text-amber-600" />







                </div>







                <div>







                  <h3 className="font-bold text-lg text-slate-800">{selectedRecord.first_name} {selectedRecord.middle_name || ''} {selectedRecord.last_name} {selectedRecord.suffix && selectedRecord.suffix !== 'N/A' ? selectedRecord.suffix : ''}</h3>







                  <p className="text-xs text-slate-400">Filed: {formatDate(selectedRecord.created_at)} • ID: {selectedRecord.id}</p>







                </div>







                <span className={`ml-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${STATUS_BADGE[selectedRecord.status] || ''}`}>{selectedRecord.status}</span>







              </div>







              <div className="flex items-center gap-2">







                {/* Approve / Reject buttons */}







                







                <button onClick={closeDrawer} className="p-2 hover:bg-slate-100 rounded-xl transition-colors ml-2">







                  <X size={20} className="text-slate-500" />







                </button>







              </div>







            </div>







            {/* Reject Remarks Input */}







            {showRejectInput && (







              <div className="sticky top-[73px] z-10 bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3">







                <input type="text" value={rejectRemarks} onChange={(e) => setRejectRemarks(e.target.value)}







                  placeholder="Reason for rejection (required)..."







                  className="flex-1 px-4 py-2 bg-white border border-red-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-red-400 focus:outline-none" autoFocus />







                <button onClick={handleReject} disabled={updatingStatus}







                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl disabled:opacity-50">Confirm Reject</button>







                <button onClick={() => setShowRejectInput(false)} className="px-3 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl">Cancel</button>







              </div>







            )}







            {/* Drawer Content */}







            <div className="p-6 space-y-8">







              {/* === SECTION: Personal Information === */}







              <section className="space-y-4">







                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>A. Personal Information







                </h6>







                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="NCSC Ref Code" value={selectedRecord.ncsc_reference_code} field="ncsc_reference_code" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="OSCA Number" value={selectedRecord.osca_number} field="osca_number" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="First Name" value={selectedRecord.first_name} field="first_name" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Middle Name" value={selectedRecord.middle_name} field="middle_name" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Last Name" value={selectedRecord.last_name} field="last_name" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Suffix" value={selectedRecord.suffix} field="suffix" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Birthdate" value={selectedRecord.birthdate} field="birthdate" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Age" value={selectedRecord.age?.toString()} field="age" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Sex" value={selectedRecord.sex} field="sex" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Civil Status" value={selectedRecord.civil_status} field="civil_status" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Citizenship" value={selectedRecord.citizenship} field="citizenship" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Contact No." value={selectedRecord.contact_number} field="contact_number" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Address" value={selectedRecord.address} field="address" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Barangay" value={selectedRecord.barangay} field="barangay" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="City/Town" value={selectedRecord.city_town} field="city_town" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Province" value={selectedRecord.province} field="province" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Region" value={selectedRecord.region} field="region" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Zip Code" value={selectedRecord.zip_code} field="zip_code" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Ethnicity / IP" value={selectedRecord.ethnic_origin} field="ethnic_origin" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Disability Details" value={selectedRecord.physical_disability_text} field="physical_disability_text" />







                </div>







                {selectedRecord.place_of_submission === 'Abroad' && (







                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Abroad House No." value={selectedRecord.abroad_house_no} field="abroad_house_no" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Abroad Street" value={selectedRecord.abroad_street} field="abroad_street" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Abroad City" value={selectedRecord.abroad_city} field="abroad_city" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Abroad State" value={selectedRecord.abroad_state} field="abroad_state" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Abroad Country" value={selectedRecord.abroad_country} field="abroad_country" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Abroad Zip" value={selectedRecord.abroad_zip_code} field="abroad_zip_code" />







                  </div>







                )}







              </section>







              {/* === SECTION: Family === */}







              <section className="space-y-4">







                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>D. Family Information







                </h6>







                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Spouse Last Name" value={selectedRecord.spouse_last_name} field="spouse_last_name" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Spouse First Name" value={selectedRecord.spouse_first_name} field="spouse_first_name" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Spouse Middle Name" value={selectedRecord.spouse_middle_name} field="spouse_middle_name" />







                  <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Spouse Contact" value={selectedRecord.spouse_contact_number} field="spouse_contact_number" />







                </div>







                {selectedRecord.children && selectedRecord.children.length > 0 && (







                  <div className="space-y-2">







                    <span className="text-[11px] font-bold text-slate-500 uppercase">Children</span>







                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">







                      {selectedRecord.children.map((child: any, idx: number) => (







                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">







                          <input type="text" value={child.name || ""} aria-label={`Child ${idx + 1} name`} onChange={(event) => setSelectedRecord((record: any) => ({ ...record, children: record.children.map((item: any, childIndex: number) => childIndex === idx ? { ...item, name: event.target.value } : item) }))} className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none" />







                          <div className="grid grid-cols-3 gap-2 mt-2"><input type="number" value={child.age ?? ""} aria-label={`Child ${idx + 1} age`} onChange={(event) => setSelectedRecord((record: any) => ({ ...record, children: record.children.map((item: any, childIndex: number) => childIndex === idx ? { ...item, age: event.target.value } : item) }))} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 outline-none" /><input type="text" value={child.sex || ""} aria-label={`Child ${idx + 1} sex`} onChange={(event) => setSelectedRecord((record: any) => ({ ...record, children: record.children.map((item: any, childIndex: number) => childIndex === idx ? { ...item, sex: event.target.value } : item) }))} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 outline-none" /><input type="text" value={child.occupation || ""} aria-label={`Child ${idx + 1} occupation`} onChange={(event) => setSelectedRecord((record: any) => ({ ...record, children: record.children.map((item: any, childIndex: number) => childIndex === idx ? { ...item, occupation: event.target.value } : item) }))} className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 outline-none" /></div>







                        </div>







                      ))}







                    </div>







                  </div>







                )}







              </section>







              {/* === SECTION: Transaction / Deceased === */}







              {isSeniorDeceased(selectedRecord) ? (







                <section className="space-y-4">







                  <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>C. Deceased Grantee — Claimant Info







                  </h6>







                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Date of Death" value={selectedRecord.date_of_death} field="date_of_death" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant First Name" value={selectedRecord.claimant_first_name} field="claimant_first_name" />
                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant Middle Name" value={selectedRecord.claimant_middle_name} field="claimant_middle_name" />
                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant Last Name" value={selectedRecord.claimant_last_name} field="claimant_last_name" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Relationship" value={selectedRecord.claimant_relationship} field="claimant_relationship" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant Contact" value={selectedRecord.claimant_contact_number} field="claimant_contact_number" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant Email" value={selectedRecord.claimant_email} field="claimant_email" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant Payment Mode" value={selectedRecord.claimant_payment_mode} field="claimant_payment_mode" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant Account No." value={selectedRecord.claimant_account_number} field="claimant_account_number" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant Bank" value={selectedRecord.claimant_bank_name} field="claimant_bank_name" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Claimant Branch" value={selectedRecord.claimant_branch_name} field="claimant_branch_name" />







                  </div>







                </section>







              ) : (







                <section className="space-y-4">







                  <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>E. Grantee's Transaction Account







                  </h6>







                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Payment Mode" value={selectedRecord.preferred_payment_mode} field="preferred_payment_mode" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Account No." value={selectedRecord.account_number} field="account_number" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Bank Name" value={selectedRecord.bank_name} field="bank_name" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Branch" value={selectedRecord.branch_name} field="branch_name" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Bank Address" value={selectedRecord.bank_address} field="bank_address" />







                    <EditableInfoRow record={selectedRecord} onUpdate={updateSelectedRecord} label="Joint Account?" value={selectedRecord.is_joint_account} field="is_joint_account" />







                  </div>







                </section>







              )}















              {/* === SECTION: Verification (staff fills) === */}







              <section className="space-y-4">







                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>D. Verification Result







                </h6>







                <div className="flex gap-5">







                  <label className="flex items-center gap-2 cursor-pointer">







                    <input type="checkbox" checked={isEligible} onChange={(e) => { setIsEligible(e.target.checked); if (e.target.checked) setIsNotEligible(false); }} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />







                    <span className="text-[13px] text-slate-600 font-medium">Eligible</span>







                  </label>







                  <label className="flex items-center gap-2 cursor-pointer">







                    <input type="checkbox" checked={isNotEligible} onChange={(e) => { setIsNotEligible(e.target.checked); if (e.target.checked) setIsEligible(false); }} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />







                    <span className="text-[13px] text-slate-600 font-medium">Not Eligible</span>







                  </label>







                </div>







                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">







                  <div className="space-y-1.5">







                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Verifier's Name</label>







                    <input type="text" value={verifierName} onChange={(e) => setVerifierName(e.target.value)}







                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />







                  </div>







                  <div className="space-y-1.5">







                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Verification Date</label>







                    <input type="date" value={verificationDate} onChange={(e) => setVerificationDate(e.target.value)}







                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />







                  </div>







                  <div className="space-y-1.5">







                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">NCSC Reg No.</label>







                    <input type="text" value={ncscRegNo} onChange={(e) => setNcscRegNo(e.target.value)}







                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />







                  </div>







                  <div className="space-y-1.5">







                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Verifier Contact Info</label>







                    <input type="text" value={verifierContactInfo} onChange={(e) => setVerifierContactInfo(e.target.value)}







                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" placeholder="Office, Phone, Email" />







                  </div>







                </div>







                <div className="space-y-1.5">







                  <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Remarks / Notes</label>







                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}







                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"







                    placeholder="Notes, lacking documents, reasons..." />







                </div>







                <div className="flex gap-3 pt-2">



                <button onClick={handleSave} disabled={updatingStatus || selectedRecord.status === 'Rejected'}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98]">
                  <CheckCircle size={16} /> {updatingStatus ? 'Saving...' : 'Save Changes'}
                </button>

                <button onClick={handleApprove} disabled={updatingStatus || selectedRecord.status === 'Rejected'}



                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]">



                  <CheckCircle size={16} /> {updatingStatus ? 'Processing...' : 'Approve'}



                </button>



                {selectedRecord.status === 'Rejected' ? (
                  <button onClick={handleRestore} disabled={updatingStatus}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/10 transition-all active:scale-[0.98]">
                    <RefreshCw size={16} /> Restore
                  </button>
                ) : (
                  <button onClick={() => setShowRejectInput(true)} disabled={updatingStatus}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-red-500/10 transition-all active:scale-[0.98]">
                    <XCircle size={16} /> Reject
                  </button>
                )}



              </div>







              </section>







            </div>







          </>)}



          </div>







        </div>







      







      {/* Fullscreen Image Viewer */}

      {/* Create Claim Form Modal */}
      {showCreateFormModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateFormModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn" onClick={event => event.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Create New Claim Form</h3>
                <p className="text-xs text-slate-500 mt-1">Search for a senior qualified for honoring.</p>
              </div>
              <button onClick={() => setShowCreateFormModal(false)} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Close">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  value={createFormSearch}
                  onFocus={() => setShowCreateFormSuggestions(true)}
                  onChange={event => {
                    setCreateFormSearch(event.target.value);
                    setShowCreateFormSuggestions(true);
                  }}
                  placeholder="Search name, OSCA number, or barangay..."
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
                />
                {showCreateFormSuggestions && createFormSuggestions.length > 0 && (
                  <div
                    role="listbox"
                    aria-label="Matching eligible seniors"
                    className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                  >
                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggestions</p>
                    {createFormSuggestions.map(senior => (
                      <button
                        key={senior.id}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => {
                          setCreateFormSearch([senior.firstName, senior.middleName, senior.lastName, senior.suffix].filter(Boolean).join(' '));
                          setShowCreateFormSuggestions(false);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-teal-50 focus:bg-teal-50 focus:outline-none"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-slate-800">
                            {[senior.firstName, senior.middleName, senior.lastName, senior.suffix].filter(Boolean).join(' ')}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">{senior.oscaNumber} · {senior.barangay || 'Barangay not set'}</span>
                        </span>
                        <Search size={13} className="shrink-0 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="max-h-[55vh] overflow-y-auto space-y-2">
                {filteredEligibleSeniors.length === 0 ? (
                  <div className="py-10 text-center">
                    <Users size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-500">
                      {eligibleSeniors.length === 0 ? 'No eligible seniors are available for a new form.' : 'No matching eligible seniors found.'}
                    </p>
                  </div>
                ) : filteredEligibleSeniors.map(senior => (
                  <div key={senior.id} className="flex items-center justify-between gap-4 p-3 border border-slate-200 rounded-xl hover:border-teal-200 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {[senior.firstName, senior.middleName, senior.lastName, senior.suffix].filter(Boolean).join(' ')}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {senior.oscaNumber} <span className="mx-1 text-slate-300">•</span> {senior.barangay || 'Barangay not set'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCreateClaimForm(senior)}
                      disabled={creatingForSeniorId !== null}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 disabled:opacity-50 text-teal-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      {creatingForSeniorId === senior.id ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                      {creatingForSeniorId === senior.id ? 'Creating...' : 'Create Form'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Confirm Action</h3>
                    <p className="text-teal-100 text-[11px]">Enter your password to enable registration</p>
                  </div>
                </div>
                <button onClick={() => { setShowPasswordModal(false); setProcessingToggle(false); }} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>This will:</strong> Generate unique passwords for all seniors with status <strong>"Qualified for Honoring"</strong> and send them an SMS with their credentials to access the Grantee Claim Form.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Your Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmToggleOn(); }}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                  disabled={processingToggle}
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                    <XCircle size={12} /> {passwordError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowPasswordModal(false); setProcessingToggle(false); }}
                  disabled={processingToggle}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmToggleOn}
                  disabled={processingToggle || !confirmPassword.trim()}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {processingToggle ? (
                    <><RefreshCw size={14} className="animate-spin" /> Processing...</>
                  ) : (
                    <><CheckCircle size={14} /> Confirm & Enable</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}








      {fullscreenImage && (







        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setFullscreenImage(null)}>







          <button onClick={() => setFullscreenImage(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full">







            <X size={24} className="text-white" />







          </button>







          <img src={fullscreenImage} alt="Document Preview" className="max-w-full max-h-full object-contain rounded-lg" />







        </div>







      )}







    </div>







  );







}








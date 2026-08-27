import React, { useState, useEffect } from 'react';







import { supabase } from '../../utils/supabase';







import { useUIStore } from '../store/uiStore';

import { useAuthStore } from '../store/authStore';

import { useSeniorsStore } from '../store/seniorsStore';

import { auditLogsService } from '../services/supabaseService';







import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, RefreshCw, X, Maximize2, ShieldCheck, ShieldX, User, MapPin, Users, Wallet, Heart } from 'lucide-react';







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







  const { showToast } = useUIStore();
  const { currentUser, login } = useAuthStore();
  const { seniors, sendSMS, sendBatchSMS } = useSeniorsStore();

  // Password confirmation modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [processingToggle, setProcessingToggle] = useState(false);







  const [records, setRecords] = useState<any[]>([]);







  const [loading, setLoading] = useState(true);







  const [searchQuery, setSearchQuery] = useState('');







  const [statusFilter, setStatusFilter] = useState('All');







  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);







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







      .select('*')







      .order('created_at', { ascending: false });







    if (error) showToast('Failed to load records', 'error');







    else setRecords(data || []);







    setLoading(false);







  };







  useEffect(() => { fetchRecords(); }, []);

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







    setIsEligible(record.is_eligible || false);







    setIsNotEligible(record.is_not_eligible || false);







    setVerifierName(record.verifier_signature_name || '');







    setVerificationDate(record.verification_date || '');







    setNcscRegNo(record.ncsc_reg_no || '');







    setVerifierContactInfo(record.verifier_contact_info || '');







    setShowRejectInput(false);







    setRejectRemarks('');







    // Load doc validation (simple boolean per doc)







    const validation: Record<string, boolean | null> = {};







    for (let i = 1; i <= 11; i++) {







      validation[`doc${i}`] = record[`is_doc${i}_valid`] ?? null;







    }







    setDocValidation(validation);







    setDrawerOpen(true);







  };







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







  const handleSave = async () => {







    if (!selectedRecord) return;







    setUpdatingStatus(true);







    const invalidDocNames = getInvalidDocNames();







    const updatePayload: any = {







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







    else { showToast('Verification saved', 'success'); fetchRecords(); }







    setUpdatingStatus(false);







  };







  // Approve







  const handleApprove = async () => {
    if (!selectedRecord) return;
    setUpdatingStatus(true);

    const hasInvalidDocs = getInvalidDocNames() !== '';

    if (hasInvalidDocs) {
      // If there are invalid docs, just save and set status to Pending
      await handleSave();
      await supabase.from('centenarian_honoring').update({ status: 'Pending' }).eq('id', selectedRecord.id);
      showToast('Documents saved. Status set to Pending due to invalid documents.', 'info');
      setSelectedRecord({ ...selectedRecord, status: 'Pending' });
      fetchRecords();
      setUpdatingStatus(false);
      return;
    }

    await handleSave();
    const { error } = await supabase.from('centenarian_honoring').update({ status: 'Approved' }).eq('id', selectedRecord.id);
    if (error) showToast('Failed to approve', 'error');
    else {
      showToast('Claim form APPROVED', 'success');
      setSelectedRecord({ ...selectedRecord, status: 'Approved' });
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







      showToast('Claim form REJECTED', 'success');







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







  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (







    <div className="flex flex-col">







      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>







      <span className="text-sm font-semibold text-slate-800">{value || '—'}</span>







    </div>







  );







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







                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${record.is_deceased ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>







                        {record.is_deceased ? 'Deceased' : 'Living'}







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
                      await supabase.from('centenarian_honoring').update({ status: 'Claimed' }).eq('id', record.id);
                      showToast('Marked as Claimed', 'success');
                      fetchRecords();
                    }} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5" title="Mark as Claimed">
                      <CheckCircle size={13} className="text-emerald-600" />
                      <span className="text-[11px] font-bold text-emerald-700">Claimed</span>
                    </button>
                    <button onClick={async () => {
                      await supabase.from('centenarian_honoring').update({ status: 'Unclaimed' }).eq('id', record.id);
                      showToast('Marked as Unclaimed', 'success');
                      fetchRecords();
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







                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>C. Personal Information







                </h6>







                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">







                  <InfoRow label="NCSC Ref Code" value={selectedRecord.ncsc_reference_code} />







                  <InfoRow label="OSCA Number" value={selectedRecord.osca_number} />







                  <InfoRow label="First Name" value={selectedRecord.first_name} />







                  <InfoRow label="Middle Name" value={selectedRecord.middle_name} />







                  <InfoRow label="Last Name" value={selectedRecord.last_name} />







                  <InfoRow label="Suffix" value={selectedRecord.suffix} />







                  <InfoRow label="Birthdate" value={selectedRecord.birthdate} />







                  <InfoRow label="Age" value={selectedRecord.age?.toString()} />







                  <InfoRow label="Sex" value={selectedRecord.sex} />







                  <InfoRow label="Civil Status" value={selectedRecord.civil_status} />







                  <InfoRow label="Citizenship" value={selectedRecord.citizenship} />







                  <InfoRow label="Contact No." value={selectedRecord.contact_number} />







                  <InfoRow label="Address" value={selectedRecord.address} />







                  <InfoRow label="Barangay" value={selectedRecord.barangay} />







                  <InfoRow label="City/Town" value={selectedRecord.city_town} />







                  <InfoRow label="Province" value={selectedRecord.province} />







                  <InfoRow label="Region" value={selectedRecord.region} />







                  <InfoRow label="Zip Code" value={selectedRecord.zip_code} />







                  {selectedRecord.ethnic_origin && <InfoRow label="Ethnicity / IP" value={selectedRecord.ethnic_origin} />}







                  {selectedRecord.physical_disability && <InfoRow label="Disability" value={selectedRecord.physical_disability_text || 'Yes'} />}







                </div>







                {selectedRecord.place_of_submission === 'Abroad' && (







                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">







                    <InfoRow label="Abroad House No." value={selectedRecord.abroad_house_no} />







                    <InfoRow label="Abroad Street" value={selectedRecord.abroad_street} />







                    <InfoRow label="Abroad City" value={selectedRecord.abroad_city} />







                    <InfoRow label="Abroad State" value={selectedRecord.abroad_state} />







                    <InfoRow label="Abroad Country" value={selectedRecord.abroad_country} />







                    <InfoRow label="Abroad Zip" value={selectedRecord.abroad_zip_code} />







                  </div>







                )}







              </section>







              {/* === SECTION: Family === */}







              <section className="space-y-4">







                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>D. Family Information







                </h6>







                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">







                  <InfoRow label="Spouse Last Name" value={selectedRecord.spouse_last_name} />







                  <InfoRow label="Spouse First Name" value={selectedRecord.spouse_first_name} />







                  <InfoRow label="Spouse Middle Name" value={selectedRecord.spouse_middle_name} />







                  <InfoRow label="Spouse Contact" value={selectedRecord.spouse_contact_number} />







                </div>







                {selectedRecord.children && selectedRecord.children.length > 0 && (







                  <div className="space-y-2">







                    <span className="text-[11px] font-bold text-slate-500 uppercase">Children</span>







                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">







                      {selectedRecord.children.map((child: any, idx: number) => (







                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">







                          <span className="font-bold text-slate-700">{child.name}</span>







                          <span className="text-slate-400 ml-2">{child.age}yrs • {child.sex} • {child.occupation || 'N/A'}</span>







                        </div>







                      ))}







                    </div>







                  </div>







                )}







              </section>







              {/* === SECTION: Transaction / Deceased === */}







              {selectedRecord.is_deceased ? (







                <section className="space-y-4">







                  <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>F. Deceased Grantee — Claimant Info







                  </h6>







                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">







                    <InfoRow label="Date of Death" value={selectedRecord.date_of_death} />







                    <InfoRow label="Claimant Name" value={`${selectedRecord.claimant_first_name || ''} ${selectedRecord.claimant_middle_name || ''} ${selectedRecord.claimant_last_name || ''}`} />







                    <InfoRow label="Relationship" value={selectedRecord.claimant_relationship} />







                    <InfoRow label="Claimant Contact" value={selectedRecord.claimant_contact_number} />







                    <InfoRow label="Claimant Email" value={selectedRecord.claimant_email} />







                    <InfoRow label="Payment Mode" value={selectedRecord.claimant_payment_mode} />







                    <InfoRow label="Account No." value={selectedRecord.claimant_account_number} />







                    <InfoRow label="Bank" value={selectedRecord.claimant_bank_name} />







                    <InfoRow label="Branch" value={selectedRecord.claimant_branch_name} />







                  </div>







                </section>







              ) : (







                <section className="space-y-4">







                  <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                    <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>E. Grantee's Transaction Account







                  </h6>







                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">







                    <InfoRow label="Payment Mode" value={selectedRecord.preferred_payment_mode} />







                    <InfoRow label="Account No." value={selectedRecord.account_number} />







                    <InfoRow label="Bank Name" value={selectedRecord.bank_name} />







                    <InfoRow label="Branch" value={selectedRecord.branch_name} />







                    <InfoRow label="Bank Address" value={selectedRecord.bank_address} />







                    <InfoRow label="Joint Account?" value={selectedRecord.is_joint_account} />







                  </div>







                </section>







              )}







              {/* === SECTION: Uploaded Documents with Validation === */}







              <section className="space-y-4">







                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>H. Uploaded Documents







                </h6>







                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">







                  {Object.entries(DOC_LABELS).map(([key, label]) => {







                    const files: string[] = selectedRecord[key] || [];







                    const docNum = parseInt(key.replace('doc', ''));














                    const validStatus = docValidation[key];







                    return (







                      <div key={key} className={`p-3 rounded-2xl border space-y-2.5 ${validStatus === false ? 'bg-red-50/50 border-red-200' : validStatus === true ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/80 border-slate-100'}`}>







                        <div className="flex items-start justify-between gap-2">







                          <span className="text-[10px] font-bold text-slate-500 uppercase leading-tight flex-1">{docNum}. {label}</span>







                          {validStatus === true && <span className="shrink-0 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle size={12} className="text-white" /></span>}







                          {validStatus === false && <span className="shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"><XCircle size={12} className="text-white" /></span>}







                        </div>







                        {files.length === 0 ? (







                          <span className="text-xs text-slate-400 italic">No files uploaded</span>







                        ) : (







                          <div className="flex flex-wrap gap-1.5">







                            {files.map((fileUrl: string, idx: number) => {







                              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);







                              return (







                                <div key={idx} className="relative group cursor-pointer" onClick={() => setFullscreenImage(fileUrl)}>







                                  {isImage ? (







                                    <img src={fileUrl} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200 hover:border-teal-400 transition-colors" />







                                  ) : (







                                    <div className="w-16 h-16 rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center hover:border-teal-400 transition-colors">







                                      <FileText size={16} className="text-slate-400" />







                                      <span className="text-[7px] text-slate-400 font-bold mt-0.5 uppercase">{fileUrl.split('.').pop()}</span>







                                    </div>







                                  )}







                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">







                                    <Maximize2 size={14} className="text-white" />







                                  </div>







                                </div>







                              );







                            })}







                          </div>







                        )}







                        {files.length > 0 && (







                          <div className="flex gap-2 pt-1">







                            <button onClick={() => setDocValid(key, true)}







                              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all ${validStatus === true ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-400'}`}>







                              <ShieldCheck size={12} /> Valid







                            </button>







                            <button onClick={() => setDocValid(key, false)}







                              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all ${validStatus === false ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-400'}`}>







                              <ShieldX size={12} /> Invalid







                            </button>







                          </div>







                        )}







                      </div>







                    );







                  })}







                </div>







                {/* Invalid docs summary */}







                {getInvalidDocNames() && (







                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">







                    <span className="text-[11px] font-bold text-red-700 uppercase">Invalid Documents:</span>







                    <p className="text-xs text-red-600 mt-1">{getInvalidDocNames()}</p>







                  </div>







                )}







              </section>







              {/* === SECTION: Verification (staff fills) === */}







              <section className="space-y-4">







                <h6 className="text-sm font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50/50 pb-1 flex items-center gap-1.5">







                  <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>I. Verification Result







                </h6>







                <div className="flex gap-5">







                  <label className="flex items-center gap-2 cursor-pointer">







                    <input type="checkbox" checked={isEligible} onChange={(e) => setIsEligible(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />







                    <span className="text-[13px] text-slate-600 font-medium">Eligible</span>







                  </label>







                  <label className="flex items-center gap-2 cursor-pointer">







                    <input type="checkbox" checked={isNotEligible} onChange={(e) => setIsNotEligible(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />







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



                <button onClick={handleApprove} disabled={updatingStatus}



                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98]">



                  <CheckCircle size={16} /> {updatingStatus ? 'Processing...' : (getInvalidDocNames() ? 'Save Document' : 'Approve')}



                </button>



                <button onClick={() => setShowRejectInput(true)} disabled={updatingStatus}



                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-red-500/10 transition-all active:scale-[0.98]">



                  <XCircle size={16} /> Reject



                </button>



              </div>







              </section>







            </div>







          </>)}



          </div>







        </div>







      







      {/* Fullscreen Image Viewer */}

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








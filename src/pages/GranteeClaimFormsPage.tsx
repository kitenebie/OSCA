import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useUIStore } from '../store/uiStore';
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, RefreshCw, ChevronDown } from 'lucide-react';

interface ClaimRecord {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  osca_number: string | null;
  barangay: string | null;
  age: number | null;
  sex: string | null;
  is_deceased: boolean;
  status: string;
  created_at: string;
  contact_number: string | null;
  ncsc_reference_code: string | null;
  remarks_note_lacking_docs: string | null;
  is_eligible: boolean;
  is_not_eligible: boolean;
  verifier_signature_name: string | null;
  verification_date: string | null;
  ncsc_reg_no: string | null;
  verifier_contact_info: string | null;
}

const STATUS_OPTIONS = ['All', 'Pending', 'Under Review', 'Verified', 'Approved', 'Rejected'];

const STATUS_BADGE: Record<string, string> = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  'Verified': 'bg-teal-50 text-teal-700 border-teal-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
};

export default function GranteeClaimFormsPage() {
  const { showToast } = useUIStore();
  const [records, setRecords] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<ClaimRecord | null>(null);

  // Verification form state (for the selected record)
  const [remarks, setRemarks] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [isNotEligible, setIsNotEligible] = useState(false);
  const [verifierName, setVerifierName] = useState('');
  const [verificationDate, setVerificationDate] = useState('');
  const [ncscRegNo, setNcscRegNo] = useState('');
  const [verifierContactInfo, setVerifierContactInfo] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch records
  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('centenarian_honoring')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      showToast('Failed to load records', 'error');
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  // Filter records
  const filtered = records.filter(r => {
    const matchesSearch = searchQuery === '' ||
      `${r.first_name} ${r.middle_name || ''} ${r.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.osca_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.ncsc_reference_code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update status
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from('centenarian_honoring')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) {
      showToast('Failed to update status', 'error');
    } else {
      showToast(`Status updated to "${newStatus}"`, 'success');
      fetchRecords();
      if (selectedRecord?.id === id) setSelectedRecord({ ...selectedRecord, status: newStatus });
    }
    setUpdatingStatus(false);
  };

  // Save verification result
  const handleSaveVerification = async () => {
    if (!selectedRecord) return;
    setUpdatingStatus(true);
    const { error } = await supabase
      .from('centenarian_honoring')
      .update({
        remarks_note_lacking_docs: remarks || null,
        is_eligible: isEligible,
        is_not_eligible: isNotEligible,
        verifier_signature_name: verifierName || null,
        verification_date: verificationDate || null,
        ncsc_reg_no: ncscRegNo || null,
        verifier_contact_info: verifierContactInfo || null,
      })
      .eq('id', selectedRecord.id);
    if (error) {
      showToast('Failed to save verification', 'error');
    } else {
      showToast('Verification result saved', 'success');
      fetchRecords();
    }
    setUpdatingStatus(false);
  };

  // Open record detail
  const openRecord = (record: ClaimRecord) => {
    setSelectedRecord(record);
    setRemarks(record.remarks_note_lacking_docs || '');
    setIsEligible(record.is_eligible || false);
    setIsNotEligible(record.is_not_eligible || false);
    setVerifierName(record.verifier_signature_name || '');
    setVerificationDate(record.verification_date || '');
    setNcscRegNo(record.ncsc_reg_no || '');
    setVerifierContactInfo(record.verifier_contact_info || '');
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
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
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, OSCA No., or NCSC Ref..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
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
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={24} className="text-teal-500 animate-spin" />
              <span className="text-sm text-slate-400 font-medium">Loading records...</span>
            </div>
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
                      <button onClick={() => openRecord(record)}
                        className="p-1.5 hover:bg-teal-100 rounded-lg transition-colors" title="View / Verify">
                        <Eye size={15} className="text-teal-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Modal/Panel */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{selectedRecord.first_name} {selectedRecord.last_name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">ID: {selectedRecord.id} • Filed: {formatDate(selectedRecord.created_at)}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <XCircle size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Status Update */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Update Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.filter(s => s !== 'All').map(s => (
                  <button key={s} onClick={() => handleStatusUpdate(selectedRecord.id, s)} disabled={updatingStatus}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border ${selectedRecord.status === s ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* I. Verification Result */}
            <div className="space-y-4 pt-2">
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

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">Remarks / Note for Lacking Documents</label>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
                  placeholder="List any lacking documents or special notes..." />
              </div>

              <button onClick={handleSaveVerification} disabled={updatingStatus}
                className="w-full px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-teal-600/10 transition-all active:scale-[0.98]">
                {updatingStatus ? 'Saving...' : 'Save Verification Result'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

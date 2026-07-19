import React, { useState, useEffect } from 'react';
import { useSeniorsStore } from '../store/seniorsStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import barangaysData from '../Dummy/data/barangays.json';
import { Search, MapPin, Filter, Plus, ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

export default function SeniorsListPage() {
  const { seniors, selectedStatus, setSelectedStatus } = useSeniorsStore();
  const { currentUser, hasPermission } = useAuthStore();
  const { setCurrentPage } = useUIStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBarangay, setFilterBarangay] = useState('All');
  const [filterPension, setFilterPension] = useState('All');

  // Pagination states
  const [currentRecordsPage, setCurrentRecordsPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination to first page when any filters change
  useEffect(() => {
    setCurrentRecordsPage(1);
  }, [searchTerm, filterBarangay, selectedStatus, filterPension]);

  // RBAC permissions checks
  const canRegister = hasPermission('canCreateSenior');
  const isEncoder = currentUser?.role === 'Barangay Encoder';
  const defaultBarangay = isEncoder ? currentUser.barangayAssigned : 'All';

  // Enforce barangay encoder restriction at search level
  const activeBarangayFilter = isEncoder ? defaultBarangay : filterBarangay;

  // --- FILTERING LOGIC ---
  const filteredSeniors = seniors.filter((senior) => {
    // 1. Search term check (names, OSCA number)
    const matchesSearch = 
      `${senior.firstName} ${senior.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senior.oscaNumber.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Barangay check
    const matchesBarangay = activeBarangayFilter === 'All' || senior.barangay === activeBarangayFilter;

    // 3. Status check
    const matchesStatus = selectedStatus === 'All' || senior.status === selectedStatus;

    // 4. Pension check
    const matchesPension = 
      filterPension === 'All' || 
      (filterPension === 'Pensioner' && senior.pensionBeneficiary) ||
      (filterPension === 'Non-Pensioner' && !senior.pensionBeneficiary);

    return matchesSearch && matchesBarangay && matchesStatus && matchesPension;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSeniors.length / itemsPerPage);
  const startIndex = (currentRecordsPage - 1) * itemsPerPage;
  const paginatedSeniors = filteredSeniors.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (id: string) => {
    setCurrentPage('SeniorProfile', id);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Controls / Filter Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">Rehistro ng mga Senior Citizens</h4>
          <p className="text-[11px] text-slate-400">Manage, review, filter and search Master List records</p>
        </div>

        {canRegister && (
          <button
            onClick={() => setCurrentPage('Register')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white rounded-xl shadow-md shadow-teal-600/10 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            <span>Bagong Rehistro</span>
          </button>
        )}
      </div>

      {/* Filter Row Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* Search Input */}
        <div className="space-y-1.5">
          <label htmlFor="search" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Paghahanap (Search)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pangalan o OSCA ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Barangay Filter Dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="barangay" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Barangay</label>
          <select
            id="barangay"
            disabled={isEncoder}
            value={isEncoder ? currentUser.barangayAssigned : filterBarangay}
            onChange={(e) => setFilterBarangay(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">Lahat ng Barangay</option>
            {barangaysData.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Verification Status Dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Verification Status</label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">Lahat ng Status</option>
            <option value="Approved">Approved (Aktibo)</option>
            <option value="Pending">Pending Application</option>
            <option value="For Verification">For Verification</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Pension Status Filter */}
        <div className="space-y-1.5">
          <label htmlFor="pension" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pension Program</label>
          <select
            id="pension"
            value={filterPension}
            onChange={(e) => setFilterPension(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">Lahat (Pensioner/Non)</option>
            <option value="Pensioner">Pension Beneficiary (SocPen)</option>
            <option value="Non-Pensioner">Non-Beneficiary</option>
          </select>
        </div>

      </div>

      {/* Grid Results / Table Stage */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredSeniors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
              <UserCheck size={24} />
            </div>
            <p className="text-xs font-semibold">Walang nahanap na record ng Senior Citizen.</p>
            <p className="text-[10px] text-slate-400 mt-1">Suriing muli ang spelling o baguhin ang nilagay na filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-4 px-5">Senior Citizen Info</th>
                  <th className="py-4 px-5">OSCA Number</th>
                  <th className="py-4 px-5">Barangay Hall</th>
                  <th className="py-4 px-5 text-center">Edad (Age)</th>
                  <th className="py-4 px-5 text-center">Pension Enrollee</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSeniors.map((senior) => (
                  <tr
                    key={senior.id}
                    onClick={() => handleRowClick(senior.id)}
                    className="hover:bg-slate-50/50 cursor-pointer group transition-all duration-150"
                  >
                    {/* Basic details */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {senior.profilePhoto ? (
                          <img
                            referrerPolicy="no-referrer"
                            src={senior.profilePhoto}
                            alt={senior.firstName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100/50 flex items-center justify-center font-black text-xs text-teal-600 shrink-0">
                            {senior.firstName.charAt(0)}{senior.lastName.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-800 leading-tight group-hover:text-teal-600 transition-colors">
                            {senior.firstName} {senior.lastName}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">{senior.sex} • Born: {senior.birthdate}</p>
                        </div>
                      </div>
                    </td>

                    {/* OSCA Num */}
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-600">
                      {senior.oscaNumber}
                    </td>

                    {/* Barangay */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={12} className="text-teal-500 shrink-0" />
                        <span className="font-semibold text-[11.5px]">{senior.barangay}</span>
                      </div>
                    </td>

                    {/* Age */}
                    <td className="py-3.5 px-5 text-center font-bold text-slate-700">
                      {senior.age} y/o
                    </td>

                    {/* Pension */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase
                        ${senior.pensionBeneficiary 
                          ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                          : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                        {senior.pensionBeneficiary ? 'Pensioner' : 'Non-Pensioner'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase
                        ${senior.status === 'Approved' ? 'bg-teal-500/10 text-teal-600 border border-teal-500/20' : ''}
                        ${senior.status === 'Pending' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse' : ''}
                        ${senior.status === 'For Verification' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : ''}
                        ${senior.status === 'Rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : ''}
                      `}>
                        {senior.status}
                      </span>
                    </td>

                    {/* Actions link indicator */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        className="p-1 text-slate-400 group-hover:text-teal-600 group-hover:bg-teal-50 rounded-lg transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredSeniors.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-slate-100 bg-slate-50/40" id="pagination-controls-container">
            <span className="text-[11px] font-semibold text-slate-500" id="pagination-info">
              Ipinapakita ang <strong className="text-slate-800">{startIndex + 1}</strong> hanggang{' '}
              <strong className="text-slate-800">{Math.min(startIndex + itemsPerPage, filteredSeniors.length)}</strong> sa kabuuang{' '}
              <strong className="text-slate-800">{filteredSeniors.length}</strong> na records
            </span>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5" id="pagination-buttons">
                <button
                  type="button"
                  disabled={currentRecordsPage === 1}
                  onClick={() => setCurrentRecordsPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
                  id="prev-page-btn"
                >
                  <ChevronLeft size={14} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    totalPages > 5 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - currentRecordsPage) > 1
                  ) {
                    if (pageNum === 2 && currentRecordsPage > 3) {
                      return <span key="dots-1" className="px-1 text-slate-400 text-xs">...</span>;
                    }
                    if (pageNum === totalPages - 1 && currentRecordsPage < totalPages - 2) {
                      return <span key="dots-2" className="px-1 text-slate-400 text-xs">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentRecordsPage(pageNum)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        currentRecordsPage === pageNum
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/10'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                      id={`page-btn-${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  type="button"
                  disabled={currentRecordsPage === totalPages}
                  onClick={() => setCurrentRecordsPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
                  id="next-page-btn"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

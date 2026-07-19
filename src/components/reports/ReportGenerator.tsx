import React, { useState } from 'react';
import { useSeniorsStore } from '../../store/seniorsStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { calculateAge, formatCurrency, formatDate } from '../../utils/idGenerator';
import { exportElementToPDF } from '../../utils/pdfExport';
import { FileSpreadsheet, Printer, FileDown, CheckCircle, MapPin, Users, Heart, AlertCircle } from 'lucide-react';
import barangaysData from '../../Dummy/data/barangays.json';

const REPORT_TEMPLATES = [
  { id: 'master', name: 'Master List of Senior Citizens', desc: 'Comprehensive listing of senior citizens grouped alphabetically.' },
  { id: 'pension', name: 'Pension Beneficiary Roster', desc: 'Listing of indigent seniors registered for the DSWD SocPen monthly grant.' },
  { id: 'census', name: 'Census & Demographics Sheet', desc: 'Demographic audit detailing age brackets, gender and barangay statistics.' }
];

export default function ReportGenerator() {
  const seniors = useSeniorsStore((state) => state.seniors);
  const showToast = useUIStore((state) => state.showToast);
  const { currentUser } = useAuthStore();

  const [selectedTemplate, setSelectedTemplate] = useState('master');
  const [filterBarangay, setFilterBarangay] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Approved');
  const [isRendering, setIsRendering] = useState(false);

  // --- FILTERING DATA ACCORDING TO USER PARAMETERS ---
  const filteredSeniors = seniors.filter((s) => {
    const matchBarangay = filterBarangay === 'All' || s.barangay === filterBarangay;
    const matchStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchBarangay && matchStatus;
  });

  const handleExportPDF = async () => {
    setIsRendering(true);
    showToast('Inihahanda ang layout para sa pag-export ng PDF...', 'info');
    
    // Slight pause to allow rendering thread to settle
    await new Promise((resolve) => setTimeout(resolve, 350));
    
    const filename = `LGU_JUBAN_REPORT_${selectedTemplate.toUpperCase()}_${Date.now()}.pdf`;
    const success = await exportElementToPDF('printable-report-sheet', filename, 'p', 'a4');
    
    setIsRendering(false);
    if (success) {
      showToast('Matagumpay na na-download ang report (PDF)!', 'success');
    } else {
      showToast('Nagka-error sa pag-download ng PDF.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Control Filters panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5 self-start h-full">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800 text-sm md:text-base font-sans">Report Configurator</h4>
          <p className="text-[11px] text-slate-400">Select templates, apply filters and run audit processes</p>
        </div>

        {/* Template Select */}
        <div className="space-y-2">
          <label htmlFor="template-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pumili ng Template (Report Format)</label>
          <div className="space-y-2">
            {REPORT_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`w-full text-left p-3.5 rounded-xl border flex flex-col transition-all duration-150 active:scale-99
                  ${selectedTemplate === tpl.id 
                    ? 'bg-teal-50 border-teal-200 shadow-sm shadow-teal-500/5' 
                    : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 hover:border-slate-350'}`}
              >
                <span className={`text-[11.5px] font-bold ${selectedTemplate === tpl.id ? 'text-teal-700' : 'text-slate-700'}`}>
                  {tpl.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">
                  {tpl.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Barangay Filter */}
        <div className="space-y-1.5 pt-2">
          <label htmlFor="report-barangay-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Barangay Filter</label>
          <select
            id="report-barangay-select"
            value={filterBarangay}
            onChange={(e) => setFilterBarangay(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">Lahat ng Barangay (LGU Juban)</option>
            {barangaysData.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label htmlFor="report-status-select" className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status Filter</label>
          <select
            id="report-status-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">Lahat ng Status (Approved/Pending/etc)</option>
            <option value="Approved">Approved (Aktibo)</option>
            <option value="Pending">Pending Applications</option>
            <option value="For Verification">For Verification</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Actions row */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-auto border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-3 border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
          >
            <Printer size={13} />
            <span>I-print (Print)</span>
          </button>
          <button
            type="button"
            disabled={isRendering || filteredSeniors.length === 0}
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-1.5 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-350 text-xs font-bold text-white rounded-xl shadow-lg shadow-teal-600/10 transition-all active:scale-95"
          >
            <FileDown size={13} />
            <span>{isRendering ? 'Saving...' : 'I-save sa PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Sheet Live Preview */}
      <div className="xl:col-span-2 flex flex-col gap-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 font-mono">Live Document Sheet Sheet (A4 Sheet Preview)</span>
        
        {/* Printable/Canvas Container */}
        <div 
          id="printable-report-sheet"
          className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between font-sans text-slate-800 min-h-[842px] overflow-x-auto"
          style={{ width: '100%', minWidth: '600px' }}
        >
          {/* Sheet Header */}
          <div className="flex flex-col items-center text-center border-b-2 border-double border-slate-850 pb-5 shrink-0">
            <span className="text-[8px] font-bold text-slate-500 tracking-wider">REPUBLIKA NG PILIPINAS</span>
            <span className="text-[10px] font-black text-slate-800 tracking-wider mt-0.5">MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT OFFICE</span>
            <span className="text-[9px] font-semibold text-teal-700 mt-0.5">Bayan ng Juban, Lalawigan ng Sorsogon</span>
            <div className="w-12 h-px bg-slate-300 my-2"></div>
            
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              {selectedTemplate === 'master' && 'E-CENSUS MASTER LIST OF REGISTERED SENIOR CITIZENS'}
              {selectedTemplate === 'pension' && 'INDIGENT PENSION PROGRAM DISBURSEMENT ROSTER'}
              {selectedTemplate === 'census' && 'MUNICIPAL DEMOGRAPHICS & CENSUS SHEET'}
            </h3>
            
            <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase font-mono">
              Filters: {filterBarangay === 'All' ? 'Lahat ng Barangay' : `Brgy. ${filterBarangay}`} • Status: {filterStatus === 'All' ? 'Lahat' : filterStatus}
            </p>
          </div>

          {/* Sheet Content table */}
          <div className="flex-1 mt-6">
            {filteredSeniors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <AlertCircle size={36} className="text-slate-300 stroke-[1.5] mb-2" />
                <p className="text-xs font-semibold">Walang nahanap na records para sa filter na ito.</p>
                <p className="text-[10px] text-slate-400 mt-1">Subukang i-adjust ang Barangay o Status filters sa control panel.</p>
              </div>
            ) : selectedTemplate === 'master' ? (
              /* MASTER LIST TABLE */
              <table className="w-full text-left text-[9px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-350 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-2">OSCA ID</th>
                    <th className="py-2.5 px-2">Senior Citizen Name</th>
                    <th className="py-2.5 px-2">Barangay</th>
                    <th className="py-2.5 px-1 text-center">Edad</th>
                    <th className="py-2.5 px-1 text-center">Kasarian</th>
                    <th className="py-2.5 px-2">Contact Number</th>
                    <th className="py-2.5 px-2 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSeniors.map((senior) => (
                    <tr key={senior.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-mono text-slate-600 font-bold">{senior.oscaNumber}</td>
                      <td className="py-2 px-2 text-slate-900 uppercase font-bold">{senior.firstName} {senior.lastName}</td>
                      <td className="py-2 px-2 text-slate-600">{senior.barangay}</td>
                      <td className="py-2 px-1 text-center text-slate-800">{senior.age}</td>
                      <td className="py-2 px-1 text-center text-slate-600">{senior.sex}</td>
                      <td className="py-2 px-2 text-slate-600 font-mono">{senior.contactNumber || 'N/A'}</td>
                      <td className="py-2 px-2 text-right text-slate-500 font-mono">{senior.registeredDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : selectedTemplate === 'pension' ? (
              /* PENSION BENEFICIARY ROSTER */
              <table className="w-full text-left text-[9px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-350 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-2">OSCA ID</th>
                    <th className="py-2.5 px-2">Beneficiary Name</th>
                    <th className="py-2.5 px-2">Barangay</th>
                    <th className="py-2.5 px-1 text-center">Edad</th>
                    <th className="py-2.5 px-2">Qualified Track</th>
                    <th className="py-2.5 px-2 text-right">SocPen Amount</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSeniors.map((senior) => (
                    <tr key={senior.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-mono text-slate-600 font-bold">{senior.oscaNumber}</td>
                      <td className="py-2 px-2 text-slate-900 uppercase font-bold">{senior.firstName} {senior.lastName}</td>
                      <td className="py-2 px-2 text-slate-600">{senior.barangay}</td>
                      <td className="py-2 px-1 text-center">{senior.age}</td>
                      <td className="py-2 px-2 text-slate-500 truncate max-w-[120px]">
                        {senior.pensionBeneficiary ? 'SocPen Indigent Grant' : 'Non-Beneficiary'}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-teal-700">
                        {senior.pensionBeneficiary ? formatCurrency(1000) : formatCurrency(0)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`inline-block text-[8px] font-bold px-1 py-0.2 rounded font-mono uppercase
                          ${senior.pensionBeneficiary ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-slate-100 text-slate-400'}`}>
                          {senior.pensionBeneficiary ? 'Eligible' : 'Not Enrolled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* DEMOGRAPHIC SUMMARY */
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-150">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Poblacion Demographics</span>
                    <p className="text-xs font-semibold text-slate-700">Seniors in Poblacion Barangays (North & South): <strong className="text-slate-950 font-extrabold">{seniors.filter(s => s.barangay.includes('Poblacion')).length}</strong></p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Outer Barangays Demographics</span>
                    <p className="text-xs font-semibold text-slate-700">Seniors in Outer Barangays (Añog, Bacolod, etc.): <strong className="text-slate-950 font-extrabold">{seniors.filter(s => !s.barangay.includes('Poblacion')).length}</strong></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Barangay Census Breakdowns</span>
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="py-2 px-2">Barangay Hall Node</th>
                        <th className="py-2 px-2 text-center">Est. Population</th>
                        <th className="py-2 px-2 text-center">Census Register</th>
                        <th className="py-2 px-2 text-right">Pen Beneficiary Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {barangaysData.map((b) => {
                        const localSeniorsCount = seniors.filter(s => s.barangay === b.name).length;
                        const localPensionCount = seniors.filter(s => s.barangay === b.name && s.pensionBeneficiary).length;
                        return (
                          <tr key={b.id}>
                            <td className="py-2 px-2 font-bold text-slate-900">{b.name}</td>
                            <td className="py-2 px-2 text-center">{b.population.toLocaleString()}</td>
                            <td className="py-2 px-2 text-center font-bold text-teal-700">{localSeniorsCount} Seniors</td>
                            <td className="py-2 px-2 text-right font-mono">{localPensionCount} of {localSeniorsCount} ({localSeniorsCount > 0 ? Math.round((localPensionCount / localSeniorsCount) * 100) : 0}%)</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sheet Footer Sign-off (A4 Bottom Signatories) */}
          <div className="border-t border-slate-200 pt-8 mt-12 shrink-0 grid grid-cols-2 gap-10 text-[9px]">
            <div className="space-y-8">
              <p className="text-slate-500 uppercase font-semibold">Inihanda ni (Prepared by):</p>
              <div>
                <p className="font-extrabold text-slate-800 uppercase leading-none">{currentUser?.fullName || 'LGU SYSTEM ENCODER'}</p>
                <p className="text-[8px] text-slate-400 uppercase mt-1 leading-none">{currentUser?.role || 'LGU Encoder Node'}</p>
              </div>
            </div>

            <div className="space-y-8 flex flex-col items-end text-right">
              <p className="text-slate-500 uppercase font-semibold">Sertipikadong Wasto at Aprubado (Approved & Certified):</p>
              <div className="flex flex-col items-end pr-4">
                <p className="font-extrabold text-slate-800 uppercase leading-none">Maria Consuelo Santos, RSW</p>
                <p className="text-[8px] text-slate-400 uppercase mt-1 leading-none">MSWDO Head Officer</p>
              </div>
            </div>
          </div>

          {/* Document Stamps */}
          <div className="pt-6 border-t border-slate-100 mt-6 flex justify-between items-center text-[7.5px] text-slate-400 font-mono shrink-0 uppercase">
            <span>STAMPED CERTIFICATE OF LGU CENSUS DEPT</span>
            <span>DATE GENERATED: {new Date().toLocaleString()}</span>
          </div>

        </div>
      </div>

    </div>
  );
}

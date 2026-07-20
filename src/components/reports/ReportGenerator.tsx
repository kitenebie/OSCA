import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSeniorsStore } from '../../store/seniorsStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/idGenerator';
import { exportElementToPDF, generatePDFBlobUrl } from '../../utils/pdfExport';
import { FileDown, Printer, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import barangaysData from '../../Dummy/data/barangays.json';
import { SeniorCitizen } from '../../types';

const REPORT_TEMPLATES = [
  { id: 'master',  name: 'Master List of Senior Citizens',    desc: 'Comprehensive listing of senior citizens grouped alphabetically.' },
  { id: 'pension', name: 'Pension Beneficiary Roster',        desc: 'Listing of indigent seniors registered for the DSWD SocPen monthly grant.' },
  { id: 'census',  name: 'Census & Demographics Sheet',       desc: 'Demographic audit detailing age brackets, gender and barangay statistics.' },
];

const HIDDEN_SHEET_ID = 'printable-report-sheet';

// Partitions records into pages to fit exactly on A4 pages without slicing rows
const partitionSeniors = (items: SeniorCitizen[]) => {
  const pages: SeniorCitizen[][] = [];
  const temp = [...items];
  
  const singlePageMax = 33; // Full header + signatories fits 33 rows
  const firstPageMax  = 37; // Full header, no signatories fits 37 rows
  const middlePageMax = 41; // Small header, no signatories fits 41 rows
  const lastPageMax   = 33; // Small header + signatories fits 33 rows

  if (temp.length <= singlePageMax) {
    return [temp];
  }

  // Page 1
  let p1Take = firstPageMax;
  if (temp.length - p1Take < 1) {
    p1Take = temp.length - 1;
  }
  pages.push(temp.splice(0, p1Take));

  while (temp.length > 0) {
    if (temp.length <= lastPageMax) {
      pages.push(temp.splice(0, temp.length));
    } else {
      let take = middlePageMax;
      if (temp.length - take < 1) {
        take = temp.length - 1;
      }
      pages.push(temp.splice(0, take));
    }
  }
  return pages;
};

export default function ReportGenerator() {
  const seniors         = useSeniorsStore((state) => state.seniors);
  const showToast       = useUIStore((state) => state.showToast);
  const { currentUser } = useAuthStore();

  const [selectedTemplate, setSelectedTemplate] = useState('master');
  const [filterBarangay,   setFilterBarangay]   = useState('All');
  const [filterStatus,     setFilterStatus]     = useState('Approved');
  const [isRendering,      setIsRendering]      = useState(false);
  const [isGenerating,     setIsGenerating]     = useState(false);
  const [pdfBlobUrl,       setPdfBlobUrl]       = useState<string | null>(null);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevBlobRef  = useRef<string | null>(null);

  const filteredSeniors = seniors.filter((s) => {
    const matchBarangay = filterBarangay === 'All' || s.barangay === filterBarangay;
    const matchStatus   = filterStatus   === 'All' || s.status   === filterStatus;
    return matchBarangay && matchStatus;
  });

  const generatePreview = useCallback(async () => {
    if (filteredSeniors.length === 0) { setPdfBlobUrl(null); return; }
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    // Revoke previous blob URL to free memory
    if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    const url = await generatePDFBlobUrl(HIDDEN_SHEET_ID, 'p', 'a4');
    prevBlobRef.current = url;
    setPdfBlobUrl(url);
    setIsGenerating(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, filterBarangay, filterStatus, seniors.length]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { generatePreview(); }, 700);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [generatePreview]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => { if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current); };
  }, []);

  const handleExportPDF = async () => {
    setIsRendering(true);
    showToast('Inihahanda ang layout para sa pag-export ng PDF...', 'info');
    await new Promise((r) => setTimeout(r, 350));
    const filename = 'LGU_JUBAN_REPORT_' + selectedTemplate.toUpperCase() + '_' + Date.now() + '.pdf';
    const success  = await exportElementToPDF(HIDDEN_SHEET_ID, filename, 'p', 'a4');
    setIsRendering(false);
    showToast(success ? 'Matagumpay na na-download ang report (PDF)!' : 'Nagka-error sa pag-download ng PDF.', success ? 'success' : 'error');
  };

  const cell  = { padding: '5px 4px' } as React.CSSProperties;
  const hcell = { padding: '6px 4px', color: '#64748b', textTransform: 'uppercase' as const, fontSize: '7.5px', fontWeight: 600 };
  const stripe = (i: number): React.CSSProperties => ({ background: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderBottom: '1px solid #f1f5f9' });

  const pageStyle = {
    width: '794px',
    height: '1123px',
    padding: '48px',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
    background: 'white',
  };

  const headerStyle = {
    borderBottom: '2px double #cbd5e1',
    paddingBottom: '20px',
    textAlign: 'center' as const,
  };

  const partitionedPages = partitionSeniors(filteredSeniors);

  return (
    <>
      {/* Hidden Printable Sheet */}
      <div
        id={HIDDEN_SHEET_ID}
        aria-hidden="true"
        style={{ position:'absolute', top:'-99999px', left:'-99999px', width:'794px', background:'#64748b', display:'flex', flexDirection:'column', gap:'20px' }}
      >
        {selectedTemplate === 'census' ? (
          // ─── CENSUS: Single Page ───
          <div className="pdf-page" style={pageStyle}>
            <div style={headerStyle}>
              <p style={{ fontSize:'8px', fontWeight:700, color:'#64748b', letterSpacing:'0.1em', textTransform:'uppercase', margin:0 }}>Republika ng Pilipinas</p>
              <p style={{ fontSize:'10px', fontWeight:900, color:'#0f172a', letterSpacing:'0.08em', textTransform:'uppercase', margin:'3px 0 0' }}>Municipal Social Welfare and Development Office</p>
              <p style={{ fontSize:'9px', fontWeight:600, color:'#0f766e', margin:'3px 0 0' }}>Bayan ng Juban, Lalawigan ng Sorsogon</p>
              <div style={{ width:'48px', height:'1px', background:'#cbd5e1', margin:'8px auto' }} />
              <h3 style={{ fontSize:'12px', fontWeight:900, color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.03em', margin:0 }}>
                MUNICIPAL DEMOGRAPHICS & CENSUS SHEET
              </h3>
              <p style={{ fontSize:'8px', color:'#94a3b8', marginTop:'6px', textTransform:'uppercase', fontFamily:'monospace' }}>
                Filters: {filterBarangay === 'All' ? 'Lahat ng Barangay' : 'Brgy. ' + filterBarangay} • Status: {filterStatus === 'All' ? 'Lahat' : filterStatus}
              </p>
            </div>

            <div style={{ flex:1, marginTop:'24px' }}>
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', background:'#f8fafc', padding:'16px', borderRadius:'8px', border:'1px solid #e2e8f0', marginBottom:'24px' }}>
                  <div>
                    <p style={{ fontSize:'9px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 4px' }}>Poblacion Demographics</p>
                    <p style={{ fontSize:'11px', fontWeight:600, color:'#334155', margin:0 }}>Seniors in Poblacion Barangays: <strong style={{ color:'#0f172a' }}>{seniors.filter(s => s.barangay.includes('Poblacion')).length}</strong></p>
                  </div>
                  <div>
                    <p style={{ fontSize:'9px', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 4px' }}>Outer Barangays Demographics</p>
                    <p style={{ fontSize:'11px', fontWeight:600, color:'#334155', margin:0 }}>Seniors in Outer Barangays: <strong style={{ color:'#0f172a' }}>{seniors.filter(s => !s.barangay.includes('Poblacion')).length}</strong></p>
                  </div>
                </div>
                <p style={{ fontSize:'9px', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'8px' }}>Barangay Census Breakdowns</p>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'8px' }}>
                  <thead><tr>
                    {['Barangay Hall Node','Est. Population','Census Register','Pension Beneficiary Ratio'].map((h) => (
                      <th key={h} style={hcell}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {barangaysData.map((b, i) => {
                      const cnt = seniors.filter(s => s.barangay === b.name).length;
                      const pen = seniors.filter(s => s.barangay === b.name && s.pensionBeneficiary).length;
                      return (
                        <tr key={b.id} style={stripe(i)}>
                          <td style={{ ...cell, fontWeight:700, color:'#0f172a' }}>{b.name}</td>
                          <td style={{ ...cell, textAlign:'center' }}>{b.population.toLocaleString()}</td>
                          <td style={{ ...cell, textAlign:'center', fontWeight:700, color:'#0f766e' }}>{cnt} Seniors</td>
                          <td style={{ ...cell, textAlign:'right', fontFamily:'monospace' }}>{pen} of {cnt} ({cnt > 0 ? Math.round((pen/cnt)*100) : 0}%)</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:'32px', marginTop:'48px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', fontSize:'8px' }}>
              <div>
                <p style={{ color:'#94a3b8', textTransform:'uppercase', fontWeight:600, margin:'0 0 28px' }}>Inihanda ni (Prepared by):</p>
                <p style={{ fontWeight:900, color:'#0f172a', textTransform:'uppercase', margin:0, lineHeight:1 }}>{currentUser?.fullName || 'LGU SYSTEM ENCODER'}</p>
                <p style={{ fontSize:'7px', color:'#94a3b8', textTransform:'uppercase', marginTop:'3px', lineHeight:1 }}>{currentUser?.role || 'LGU Encoder Node'}</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ color:'#94a3b8', textTransform:'uppercase', fontWeight:600, margin:'0 0 28px' }}>Sertipikadong Wasto at Aprubado:</p>
                <p style={{ fontWeight:900, color:'#0f172a', textTransform:'uppercase', margin:0, lineHeight:1 }}>Maria Consuelo Santos, RSW</p>
                <p style={{ fontSize:'7px', color:'#94a3b8', textTransform:'uppercase', marginTop:'3px', lineHeight:1 }}>MSWDO Head Officer</p>
              </div>
            </div>
            <div style={{ borderTop:'1px solid #f1f5f9', marginTop:'24px', paddingTop:'16px', display:'flex', justifyContent:'space-between', fontSize:'7px', color:'#94a3b8', fontFamily:'monospace', textTransform:'uppercase' }}>
              <span>STAMPED CERTIFICATE OF LGU CENSUS DEPT</span>
              <span>DATE GENERATED: {new Date().toLocaleString()}</span>
            </div>
          </div>
        ) : (
          // ─── MASTER / PENSION: Multi-Page ───
          partitionedPages.map((pageRows, pageIdx) => {
            const isFirstPage = pageIdx === 0;
            const isLastPage = pageIdx === partitionedPages.length - 1;
            const totalPages = partitionedPages.length;

            return (
              <div key={pageIdx} className="pdf-page" style={pageStyle}>
                {isFirstPage ? (
                  <div style={headerStyle}>
                    <p style={{ fontSize:'8px', fontWeight:700, color:'#64748b', letterSpacing:'0.1em', textTransform:'uppercase', margin:0 }}>Republika ng Pilipinas</p>
                    <p style={{ fontSize:'10px', fontWeight:900, color:'#0f172a', letterSpacing:'0.08em', textTransform:'uppercase', margin:'3px 0 0' }}>Municipal Social Welfare and Development Office</p>
                    <p style={{ fontSize:'9px', fontWeight:600, color:'#0f766e', margin:'3px 0 0' }}>Bayan ng Juban, Lalawigan ng Sorsogon</p>
                    <div style={{ width:'48px', height:'1px', background:'#cbd5e1', margin:'8px auto' }} />
                    <h3 style={{ fontSize:'12px', fontWeight:900, color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.03em', margin:0 }}>
                      {selectedTemplate === 'master' ? 'E-CENSUS MASTER LIST OF REGISTERED SENIOR CITIZENS' : 'INDIGENT PENSION PROGRAM DISBURSEMENT ROSTER'}
                    </h3>
                    <p style={{ fontSize:'8px', color:'#94a3b8', marginTop:'6px', textTransform:'uppercase', fontFamily:'monospace' }}>
                      Filters: {filterBarangay === 'All' ? 'Lahat ng Barangay' : 'Brgy. ' + filterBarangay} • Status: {filterStatus === 'All' ? 'Lahat' : filterStatus}
                    </p>
                  </div>
                ) : (
                  <div style={{ borderBottom:'1px solid #e2e8f0', paddingBottom:'8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'9px', fontWeight:800, color:'#0f172a', textTransform:'uppercase' }}>
                      {selectedTemplate === 'master' ? 'E-CENSUS MASTER LIST' : 'PENSION BENEFICIARY ROSTER'}
                    </span>
                    <span style={{ fontSize:'8px', fontFamily:'monospace', color:'#94a3b8' }}>
                      Page {pageIdx + 1} of {totalPages}
                    </span>
                  </div>
                )}

                <div style={{ flex:1, marginTop:'20px' }}>
                  {selectedTemplate === 'master' ? (
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'8px' }}>
                      <thead><tr>
                        {['OSCA ID','Senior Citizen Name','Barangay','Edad','Kasarian','Contact No.','Registered'].map((h) => (
                          <th key={h} style={hcell}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {pageRows.map((s, i) => (
                          <tr key={s.id} style={stripe(i)}>
                            <td style={{ ...cell, fontFamily:'monospace', fontWeight:700, color:'#475569' }}>{s.oscaNumber}</td>
                            <td style={{ ...cell, fontWeight:700, textTransform:'uppercase' }}>{s.firstName} {s.lastName}</td>
                            <td style={{ ...cell, color:'#475569' }}>{s.barangay}</td>
                            <td style={{ ...cell, textAlign:'center' }}>{s.age}</td>
                            <td style={{ ...cell, textAlign:'center', color:'#475569' }}>{s.sex}</td>
                            <td style={{ ...cell, fontFamily:'monospace', color:'#475569' }}>{s.contactNumber || 'N/A'}</td>
                            <td style={{ ...cell, textAlign:'right', fontFamily:'monospace', color:'#94a3b8' }}>{s.registeredDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'8px' }}>
                      <thead><tr>
                        {['OSCA ID','Beneficiary Name','Barangay','Edad','Qualified Track','SocPen Amount','Status'].map((h) => (
                          <th key={h} style={hcell}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {pageRows.map((s, i) => (
                          <tr key={s.id} style={stripe(i)}>
                            <td style={{ ...cell, fontFamily:'monospace', fontWeight:700, color:'#475569' }}>{s.oscaNumber}</td>
                            <td style={{ ...cell, fontWeight:700, textTransform:'uppercase' }}>{s.firstName} {s.lastName}</td>
                            <td style={{ ...cell, color:'#475569' }}>{s.barangay}</td>
                            <td style={{ ...cell, textAlign:'center' }}>{s.age}</td>
                            <td style={{ ...cell, color:'#64748b' }}>{s.pensionBeneficiary ? 'SocPen Indigent Grant' : 'Non-Beneficiary'}</td>
                            <td style={{ ...cell, textAlign:'right', fontFamily:'monospace', fontWeight:700, color:'#0f766e' }}>{s.pensionBeneficiary ? formatCurrency(1000) : formatCurrency(0)}</td>
                            <td style={{ ...cell, textAlign:'center' }}>
                              <span style={{ fontSize:'7px', fontWeight:700, padding:'1px 4px', borderRadius:'3px', textTransform:'uppercase', fontFamily:'monospace', background: s.pensionBeneficiary ? '#f0fdf4' : '#f1f5f9', color: s.pensionBeneficiary ? '#15803d' : '#94a3b8', border: '1px solid ' + (s.pensionBeneficiary ? '#bbf7d0' : '#e2e8f0') }}>
                                {s.pensionBeneficiary ? 'Eligible' : 'Not Enrolled'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {isLastPage ? (
                  <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:'20px', marginTop:'24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', fontSize:'8px' }}>
                    <div>
                      <p style={{ color:'#94a3b8', textTransform:'uppercase', fontWeight:600, margin:'0 0 20px' }}>Inihanda ni (Prepared by):</p>
                      <p style={{ fontWeight:900, color:'#0f172a', textTransform:'uppercase', margin:0, lineHeight:1 }}>{currentUser?.fullName || 'LGU SYSTEM ENCODER'}</p>
                      <p style={{ fontSize:'7px', color:'#94a3b8', textTransform:'uppercase', marginTop:'3px', lineHeight:1 }}>{currentUser?.role || 'LGU Encoder Node'}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ color:'#94a3b8', textTransform:'uppercase', fontWeight:600, margin:'0 0 20px' }}>Sertipikadong Wasto at Aprubado:</p>
                      <p style={{ fontWeight:900, color:'#0f172a', textTransform:'uppercase', margin:0, lineHeight:1 }}>Maria Consuelo Santos, RSW</p>
                      <p style={{ fontSize:'7px', color:'#94a3b8', textTransform:'uppercase', marginTop:'3px', lineHeight:1 }}>MSWDO Head Officer</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderTop:'1px solid #f1f5f9', paddingTop:'8px', marginTop:'8px', textAlign:'center', fontSize:'7px', color:'#94a3b8' }}>
                    Master list continues on the next page...
                  </div>
                )}

                <div style={{ borderTop:'1px solid #f1f5f9', marginTop:'12px', paddingTop:'8px', display:'flex', justifyContent:'space-between', fontSize:'7px', color:'#94a3b8', fontFamily:'monospace', textTransform:'uppercase' }}>
                  <span>STAMPED CERTIFICATE OF LGU CENSUS DEPT</span>
                  <span>Page {pageIdx + 1} of {totalPages} • DATE GENERATED: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Control Panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5 self-start">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-800 text-sm md:text-base font-sans">Report Configurator</h4>
            <p className="text-[11px] text-slate-400">Select templates, apply filters and run audit processes</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pumili ng Template</label>
            <div className="space-y-2">
              {REPORT_TEMPLATES.map((tpl) => (
                <button key={tpl.id} type="button" onClick={() => setSelectedTemplate(tpl.id)}
                  className={'w-full text-left p-3.5 rounded-xl border flex flex-col transition-all duration-150 ' + (selectedTemplate === tpl.id ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50')}>
                  <span className={'text-[11.5px] font-bold ' + (selectedTemplate === tpl.id ? 'text-teal-700' : 'text-slate-700')}>{tpl.name}</span>
                  <span className="text-[10px] text-slate-400 mt-1 leading-normal">{tpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Barangay Filter</label>
            <select value={filterBarangay} onChange={(e) => setFilterBarangay(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none">
              <option value="All">Lahat ng Barangay (LGU Juban)</option>
              {barangaysData.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status Filter</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none">
              <option value="All">Lahat ng Status</option>
              <option value="Approved">Approved (Aktibo)</option>
              <option value="Pending">Pending Applications</option>
              <option value="For Verification">For Verification</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="pt-3 mt-auto border-t border-slate-100">
            <button type="button" disabled={isRendering || isGenerating || filteredSeniors.length === 0} onClick={handleExportPDF}
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 disabled:text-slate-400 text-xs font-bold text-white rounded-xl shadow-lg shadow-teal-600/10 transition-all active:scale-95">
              <FileDown size={13} /><span>{isRendering ? 'Saving...' : 'I-save sa PDF'}</span>
            </button>
          </div>
        </div>

        {/* Native PDF Viewer */}
        <div className="xl:col-span-2 flex flex-col gap-3 min-w-0 w-full">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Live PDF Preview</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">Browser Native • Open Source</span>
            </div>
            <div className="flex items-center gap-3">
              {pdfBlobUrl && (
                <a href={pdfBlobUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-[10.5px] font-bold text-slate-700 shadow-sm transition-all duration-150 active:scale-95">
                  <ExternalLink size={12} className="text-teal-600" />
                  <span>Buksan sa Bagong Tab</span>
                </a>
              )}
              <button onClick={generatePreview} disabled={isGenerating}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-teal-600 hover:text-teal-700 disabled:opacity-50 transition-colors">
                <RefreshCw size={11} className={isGenerating ? 'animate-spin' : ''} />
                {isGenerating ? 'Generating...' : 'Refresh Preview'}
              </button>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden bg-slate-100" style={{ minHeight: '750px' }}>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[750px] gap-4 text-slate-400">
                <RefreshCw size={28} className="animate-spin text-teal-500" />
                <p className="text-xs font-semibold">Ginagawa ang PDF preview...</p>
                <p className="text-[10px] text-slate-300">Sandali lamang po</p>
              </div>
            ) : filteredSeniors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[750px] gap-3 text-slate-400">
                <AlertCircle size={36} className="text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-semibold">Walang nahanap na records para sa filter na ito.</p>
                <p className="text-[10px] text-slate-400">I-adjust ang Barangay o Status filters sa control panel.</p>
              </div>
            ) : pdfBlobUrl ? (
              <iframe
                key={pdfBlobUrl}
                src={pdfBlobUrl}
                title="PDF Preview"
                className="w-full border-none"
                style={{ height: '750px' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[750px] gap-3 text-slate-400">
                <RefreshCw size={28} className="text-slate-300" />
                <p className="text-xs font-semibold">I-click ang Refresh Preview para makita ang PDF.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

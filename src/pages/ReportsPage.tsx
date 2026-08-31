import React, { useState, useEffect, useRef } from 'react';
import { FileText, Send, ArrowRightLeft, Award, X, Printer, ClipboardList, Save, ChevronDown, Download, Plus, Trash2 } from 'lucide-react';
import { useSeniorsStore } from '../store/seniorsStore';
import { signatoriesService, DocumentSignatory } from '../services/supabaseService';
import { transmittalBarangayService } from '../services/supabaseService';
import { philhealthTransmittalService } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';
import { useBarangays } from '../hooks/useBarangays';
import { useUIStore } from '../store/uiStore';
import { generateTransmittalDocx, downloadTransmittalDocx } from '../utils/transmittalDocxGenerator';
import { generateCertificateTransferDocx, downloadCertificateTransferDocx } from '../utils/certificateTransferDocxGenerator';
import { generateMasterlistDocx, downloadMasterlistDocx } from '../utils/masterlistDocxGenerator';
import { generatePhilHealthTransmittalDocx, downloadPhilHealthTransmittalDocx } from '../utils/philhealthTransmittalDocxGenerator';
import { renderAsync } from 'docx-preview';

type DocumentType = 'osca-transmittal' | 'mswdo-transmittal' | 'certificate-transfer' | 'certification' | 'masterlist' | 'philhealth-transmittal' | null;

export default function ReportsPage() {
  const [activeDoc, setActiveDoc] = useState<DocumentType>(null);
  const { seniors } = useSeniorsStore();
  const { currentUser } = useAuthStore();
  const { barangays: barangaysData } = useBarangays();
  const showToast = useUIStore((s) => s.showToast);

  const [barangayTableOpen, setBarangayTableOpen] = useState(false);

  // DOCX-based OSCA Transmittal
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [docxLoading, setDocxLoading] = useState(false);
  const docxPreviewRef = useRef<HTMLDivElement>(null);

  // DOCX-based Certificate of Transfer
  const [certTransferBlob, setCertTransferBlob] = useState<Blob | null>(null);
  const [certTransferLoading, setCertTransferLoading] = useState(false);
  const certTransferPreviewRef = useRef<HTMLDivElement>(null);

  // DOCX-based Masterlist
  const [masterlistBlob, setMasterlistBlob] = useState<Blob | null>(null);
  const [masterlistLoading, setMasterlistLoading] = useState(false);
  const masterlistPreviewRef = useRef<HTMLDivElement>(null);

  // Selected seniors for masterlist (user picks from qualified pool)
  const [selectedMasterlistIds, setSelectedMasterlistIds] = useState<Set<string>>(new Set());
  const [masterlistFormTab, setMasterlistFormTab] = useState<'seniors' | 'signatories'>('seniors');

  // DOCX-based PhilHealth Transmittal
  const [phBlob, setPhBlob] = useState<Blob | null>(null);
  const [phLoading, setPhLoading] = useState(false);
  const phPreviewRef = useRef<HTMLDivElement>(null);
  const [phSelectedIds, setPhSelectedIds] = useState<Set<string>>(new Set());
  const [phAddress, setPhAddress] = useState('Legazpi City, Albay');
  const [phBarangay, setPhBarangay] = useState('');

  // Editable barangay rows for OSCA Transmittal
  const [transmittalBarangayRows, setTransmittalBarangayRows] = useState<{ name: string; count: string }[]>([{ name: '', count: '' }]);

  // Sub-tab for OSCA Transmittal form (right panel)
  const [oscaFormTab, setOscaFormTab] = useState<'signatories' | 'barangays'>('signatories');

  // Signatories from Supabase
  const [signatories, setSignatories] = useState<DocumentSignatory[]>([]);
  const [sigLoading, setSigLoading] = useState(false);

  // Load signatories when document type changes
  useEffect(() => {
    if (activeDoc) {
      setSigLoading(true);
      signatoriesService.getByDocumentType(activeDoc)
        .then((data) => {
          setSignatories(data);
          const oscaHead = data.find(s => s.roleKey === 'osca_head');
          const mswdoHead = data.find(s => s.roleKey === 'mswdo_head');
          const recipient = data.find(s => s.roleKey === 'recipient');
          const mayor = data.find(s => s.roleKey === 'mayor');
          const noted = data.find(s => s.roleKey === 'noted_by');
          const admin = data.find(s => s.roleKey === 'admin_assistant');
          
          setSigs(prev => ({
            ...prev,
            oscaHead: { name: oscaHead?.fullName || prev.oscaHead.name, position: oscaHead?.title || prev.oscaHead.position },
            mswdoHead: { name: mswdoHead?.fullName || prev.mswdoHead.name, position: mswdoHead?.title || prev.mswdoHead.position },
            recipient: { name: recipient?.fullName || prev.recipient.name, position: recipient?.title || prev.recipient.position },
            recipientAddress: recipient?.address || prev.recipientAddress,
            notedBy: { name: (mayor?.fullName || noted?.fullName) || prev.notedBy.name, position: (mayor?.title || noted?.title) || prev.notedBy.position },
            adminAssistant: { name: admin?.fullName || prev.adminAssistant.name, position: admin?.title || prev.adminAssistant.position },
            mswdoLicense: mswdoHead?.licenseNo || prev.mswdoLicense,
            mswdoDesignation: mswdoHead?.designation || prev.mswdoDesignation,
          }));
        })
        .catch(err => console.error('Failed to load signatories:', err))
        .finally(() => setSigLoading(false));
    }
  }, [activeDoc]);

  // Load saved barangay signature rows when OSCA Transmittal is selected
  useEffect(() => {
    if (activeDoc === 'osca-transmittal') {
      transmittalBarangayService.getByDocumentType('osca-transmittal')
        .then((data) => {
          if (data.length > 0) {
            setTransmittalBarangayRows(data.map(r => ({ name: r.barangayName, count: String(r.signatureCount) })));
          }
        })
        .catch(err => console.error('Failed to load barangay signatures:', err));
    }
  }, [activeDoc]);

  // Save signatories to Supabase
  const handleSaveSignatories = async () => {
    if (!activeDoc) return;
    try {
      // Save signatories common to most doc types
      if (activeDoc !== 'philhealth-transmittal') {
        await signatoriesService.upsert({ documentType: activeDoc, roleKey: 'osca_head', fullName: sigs.oscaHead.name, title: sigs.oscaHead.position });
        await signatoriesService.upsert({ documentType: activeDoc, roleKey: 'mswdo_head', fullName: sigs.mswdoHead.name, title: sigs.mswdoHead.position, designation: sigs.mswdoDesignation, licenseNo: sigs.mswdoLicense });
        await signatoriesService.upsert({ documentType: activeDoc, roleKey: 'recipient', fullName: sigs.recipient.name, title: sigs.recipient.position, address: sigs.recipientAddress });
        await signatoriesService.upsert({ documentType: activeDoc, roleKey: 'mayor', fullName: sigs.notedBy.name, title: sigs.notedBy.position });
        await signatoriesService.upsert({ documentType: activeDoc, roleKey: 'admin_assistant', fullName: sigs.adminAssistant.name, title: sigs.adminAssistant.position });
      }
      // Also save barangay signature rows for transmittal documents
      if (activeDoc === 'osca-transmittal' || activeDoc === 'mswdo-transmittal') {
        await transmittalBarangayService.saveAll(activeDoc, transmittalBarangayRows);
      }
      // Save PhilHealth transmittal data
      if (activeDoc === 'philhealth-transmittal') {
        await philhealthTransmittalService.saveSetting('ph_office_address', phAddress);
        await philhealthTransmittalService.saveSelectedSeniors(Array.from(phSelectedIds), phBarangay);
      }
      showToast('Data saved successfully!', 'success');
    } catch (err) {
      console.error('Save signatories error:', err);
      showToast('Failed to save data. Please try again.', 'error');
    }
  };

  // Form states
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    purpose: 'Submitting herewith the accomplished forms of 12 million signatures:',
    mswdoBody: 'Respectfully forwarding to the National Commission of Senior Citizens (NCSC) with office address at Legazpi City, Albay the attached documents of Senior Citizens of this Municipality necessary for the application for the Expanded Centenarian Act OF 2024 (RA 11982). Hence, attached herewith are the masterlist of the potential beneficiaries including the filled-out ECA Application Forms and other pertinent documents. Thank you',
    // Certificate of Transfer
    transferSeniorId: '',
    transferTo: '',
    transferSince: '2022',
    transferAddress: '',
    municipalAddress: 'Juban, Sorsogon',
    oscaIdNo: '',
    oscaIdDateIssued: '',
    // Certification
    certSeniorId: '',
    certProgram: 'DSWD Social Pension Program',
  });

  // Signatories state (name + position pairs)
  const [sigs, setSigs] = useState({
    oscaHead: { name: 'MARCIANA G. OLONDRIZ', position: 'OSCA Head' },
    mswdoHead: { name: 'JANELA J. HAINTO', position: 'Acting MSWDO' },
    recipient: { name: 'ATTY. CLARISSA LAVENA A. BOMBASE PACAMARRA', position: 'NCSC Regional Director' },
    receiverName: 'Atty. Bombase Pacamarra',
    recipientAddress: 'Legazpi City, Albay',
    notedBy: { name: 'HON. ROGEL "BOTOX" B. FULLEROS', position: 'Municipal Mayor' },
    adminAssistant: { name: 'VHINZ KENNETH LORAYES', position: 'Administrative Assistant I' },
    mswdoLicense: 'Lic. No. 0032243',
    mswdoDesignation: 'RSW',
  });

  // Barangay table data - auto-computed from seniors table (count of Approved seniors per barangay)
  const barangayRows = React.useMemo(() => {
    const counts: Record<string, number> = {};
    seniors.filter(s => s.status === 'Approved').forEach(s => {
      const brgy = s.barangay || 'Unknown';
      counts[brgy] = (counts[brgy] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.toUpperCase(), count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [seniors]);

  const handlePrint = () => {
    const el = previewRef.current;
    if (!el) return;

    // Clone the preview content
    const content = el.innerHTML;
    const isLandscape = activeDoc === 'masterlist';

    // Create a print-only wrapper
    const printWindow = document.createElement('div');
    printWindow.id = 'print-container';
    const printPadding = isLandscape ? '10mm 15mm' : '15mm';
    printWindow.style.cssText = `font-family: "Libre Baskerville", "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.6; color: #000; padding: ${printPadding};`;
    printWindow.innerHTML = content;

    // Hide everything in body, show only print container
    const root = document.getElementById('root');
    if (root) root.classList.add('print-hidden');

    // Apply doc-preview class for styling
    printWindow.className = `doc-preview ${isLandscape ? 'landscape' : ''}`;
    document.body.appendChild(printWindow);

    // Inject @page rule
    const style = document.createElement('style');
    style.id = 'print-page-style';
    style.textContent = isLandscape
      ? '@page { size: landscape; margin: 0.38in 0 0.5in 0; }'
      : '@page { size: letter portrait; margin: 0.38in 0 0.5in 0; }';
    document.head.appendChild(style);

    window.print();

    // Cleanup
    setTimeout(() => {
      document.getElementById('print-container')?.remove();
      document.getElementById('print-page-style')?.remove();
      if (root) root.classList.remove('print-hidden');
    }, 1000);

    showToast('Printing document...', 'success');
  };

  // Generate filled OSCA Transmittal DOCX from template
  const handleGenerateTransmittal = async () => {
    setDocxLoading(true);
    try {
      const blob = await generateTransmittalDocx({
        NCSC_Reg_Director: sigs.recipient.name,
        OSCA_Head: sigs.oscaHead.name,
        Acting_MSWDO: sigs.mswdoHead.name,
        Receiver_Name: sigs.receiverName,
        barangayRows: transmittalBarangayRows.filter(r => r.name.trim() || r.count.trim()),
      });
      setDocxBlob(blob);
      // showToast('Transmittal generated successfully!', 'success');
    } catch (err) {
      console.error('Generate transmittal error:', err);
      showToast('Failed to generate transmittal.', 'error');
    } finally {
      setDocxLoading(false);
    }
  };

  const handleDownloadDocx = () => {
    if (docxBlob) {
      downloadTransmittalDocx(docxBlob);
      showToast('Downloading OSCA Transmittal...', 'success');
    }
  };

  // Render DOCX preview when blob changes
  useEffect(() => {
    if (docxBlob && docxPreviewRef.current) {
      docxPreviewRef.current.innerHTML = '';
      renderAsync(docxBlob, docxPreviewRef.current, undefined, {
        className: 'docx',
        inWrapper: true,
      }).catch((err: unknown) => console.error('DOCX preview error:', err));
    }
  }, [docxBlob]);

  // Auto-generate DOCX when OSCA Transmittal is selected or signatories change
  useEffect(() => {
    if (activeDoc === 'osca-transmittal' && !sigLoading) {
      handleGenerateTransmittal();
    } else if (activeDoc !== 'osca-transmittal') {
       setDocxBlob(null);
       if (docxPreviewRef.current) {
        docxPreviewRef.current.innerHTML = '';
      }
    }
  }, [activeDoc, sigLoading, sigs.recipient.name, sigs.oscaHead.name, sigs.mswdoHead.name, sigs.receiverName, transmittalBarangayRows]);

  const getSelectedSenior = (id: string) => seniors.find(s => s.id === id);

  // ---- Certificate of Transfer DOCX handlers ----
  const handleGenerateCertTransfer = async () => {
    const senior = getSelectedSenior(formData.transferSeniorId);
    if (!senior) return;
    setCertTransferLoading(true);
    try {
      const age = Math.abs(new Date(Date.now() - new Date(senior.birthdate).getTime()).getUTCFullYear() - 1970);
      const dateObj = new Date(formData.date);
      const day = dateObj.getDate().toString();
      const monthYear = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const fullName = `${senior.firstName} ${senior.middleName || ''} ${senior.lastName}`.replace(/\s+/g, ' ').trim().toUpperCase();

      const blob = await generateCertificateTransferDocx({
        Person_Name: fullName,
        Age: String(age),
        Brgy: senior.barangay || '',
        Address: formData.municipalAddress || 'Juban, Sorsogon',
        Transferred_Place: formData.transferTo || '',
        Transfer_Address: formData.transferAddress || formData.transferTo?.split(',').slice(1).join(',').trim() || '',
        Osca_Id_No: formData.oscaIdNo || senior.oscaNumber || senior.id || '',
        Date_Issued: formData.oscaIdDateIssued || '',
        Day: day,
        Month_Year: monthYear,
        OSCA_Head_Name: sigs.oscaHead.name,
        Acting_Head_Name: sigs.mswdoHead.name,
        License_No: sigs.mswdoLicense || 'Lic. No. ___________',
        Acting_Position: sigs.mswdoHead.position || 'Acting MSWDO',
      });
      setCertTransferBlob(blob);
    } catch (err) {
      console.error('Generate cert transfer error:', err);
      showToast('Failed to generate certificate.', 'error');
    } finally {
      setCertTransferLoading(false);
    }
  };

  const handleDownloadCertTransfer = () => {
    if (certTransferBlob) {
      const senior = getSelectedSenior(formData.transferSeniorId);
      const name = senior ? `${senior.lastName}-${senior.firstName}` : 'Certificate';
      downloadCertificateTransferDocx(certTransferBlob, `Certificate-of-Transfer-${name}.docx`);
      showToast('Downloading Certificate of Transfer...', 'success');
    }
  };

  // Render Certificate of Transfer DOCX preview
  useEffect(() => {
    if (certTransferBlob && certTransferPreviewRef.current) {
      certTransferPreviewRef.current.innerHTML = '';
      renderAsync(certTransferBlob, certTransferPreviewRef.current, undefined, {
        className: 'docx',
        inWrapper: true,
      }).catch((err: unknown) => console.error('Cert transfer preview error:', err));
    }
  }, [certTransferBlob]);

  // Auto-generate when senior/form data changes
  useEffect(() => {
    if (activeDoc === 'certificate-transfer' && formData.transferSeniorId && !sigLoading) {
      handleGenerateCertTransfer();
    } else if (activeDoc !== 'certificate-transfer') {
      setCertTransferBlob(null);
      if (certTransferPreviewRef.current) {
        certTransferPreviewRef.current.innerHTML = '';
      }
    }
  }, [activeDoc, sigLoading, formData.transferSeniorId, formData.transferTo, formData.transferSince, formData.date, formData.transferAddress, formData.municipalAddress, formData.oscaIdNo, formData.oscaIdDateIssued, sigs.oscaHead.name, sigs.mswdoHead.name, sigs.mswdoLicense, sigs.mswdoDesignation, sigs.mswdoHead.position]);

  // ---- Masterlist DOCX handlers ----
  const handleGenerateMasterlist = async () => {
    setMasterlistLoading(true);
    try {
      const selected = seniors
        .filter(s => {
          const age = Math.abs(new Date(Date.now() - new Date(s.birthdate).getTime()).getUTCFullYear() - 1970);
          return age >= 80 && (s.status === 'Qualified for Honoring' || s.status === 'Approved') && selectedMasterlistIds.has(s.id);
        })
        .sort((a, b) => a.lastName.localeCompare(b.lastName));

      const blob = await generateMasterlistDocx({
        OSCA_Head: sigs.oscaHead.name,
        MSWDO: sigs.mswdoHead.name,
        seniors: selected.map((s, idx) => ({
          no: idx + 1,
          lastName: s.lastName,
          firstName: s.firstName,
          middleName: s.middleName || '',
          sex: s.sex || '',
          barangay: s.barangay || '',
        })),
      });
      setMasterlistBlob(blob);
    } catch (err) {
      console.error('Generate masterlist error:', err);
      showToast('Failed to generate masterlist.', 'error');
    } finally {
      setMasterlistLoading(false);
    }
  };

  const handleDownloadMasterlist = () => {
    if (masterlistBlob) {
      downloadMasterlistDocx(masterlistBlob);
      showToast('Downloading Masterlist...', 'success');
    }
  };

  // Render Masterlist DOCX preview
  useEffect(() => {
    if (masterlistBlob && masterlistPreviewRef.current) {
      masterlistPreviewRef.current.innerHTML = '';
      renderAsync(masterlistBlob, masterlistPreviewRef.current, undefined, {
        className: 'docx',
        inWrapper: true,
      }).catch((err: unknown) => console.error('Masterlist preview error:', err));
    }
  }, [masterlistBlob]);

  // Auto-generate when masterlist is selected
  useEffect(() => {
    if (activeDoc === 'masterlist' && !sigLoading && selectedMasterlistIds.size > 0) {
      handleGenerateMasterlist();
    } else if (activeDoc !== 'masterlist') {
      setMasterlistBlob(null);
      setSelectedMasterlistIds(new Set());
      if (masterlistPreviewRef.current) {
        masterlistPreviewRef.current.innerHTML = '';
      }
    }
  }, [activeDoc, sigLoading, sigs.oscaHead.name, sigs.mswdoHead.name, seniors, selectedMasterlistIds.size]);

  // Auto-select "Qualified for Honoring" seniors when masterlist is first opened
  useEffect(() => {
    if (activeDoc === 'masterlist' && selectedMasterlistIds.size === 0 && seniors.length > 0) {
      const honoringIds = seniors
        .filter(s => {
          const age = Math.abs(new Date(Date.now() - new Date(s.birthdate).getTime()).getUTCFullYear() - 1970);
          return age >= 80 && s.status === 'Qualified for Honoring';
        })
        .map(s => s.id);
      if (honoringIds.length > 0) setSelectedMasterlistIds(new Set(honoringIds));
    }
  }, [activeDoc, seniors]);

  // ---- PhilHealth Transmittal handlers ----
  const handleGeneratePhilHealth = async () => {
    setPhLoading(true);
    try {
      const selected = seniors
        .filter(s => phSelectedIds.has(s.id) && s.status === 'Approved')
        .sort((a, b) => a.lastName.localeCompare(b.lastName));

      const blob = await generatePhilHealthTransmittalDocx({
        address: phAddress,
        barangay: phBarangay,
        OSCA_Head: sigs.oscaHead.name,
        seniors: selected.map((s, idx) => ({
          no: idx + 1,
          fullName: `${s.lastName}, ${s.firstName} ${s.middleName || ''}`.trim(),
          sex: s.sex || '',
          birthdate: new Date(s.birthdate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
          civilStatus: s.civilStatus || '',
        })),
      });
      setPhBlob(blob);
    } catch (err) {
      console.error('Generate PhilHealth transmittal error:', err);
      showToast('Failed to generate PhilHealth transmittal.', 'error');
    } finally {
      setPhLoading(false);
    }
  };

  const handleDownloadPhilHealth = () => {
    if (phBlob) {
      downloadPhilHealthTransmittalDocx(phBlob, `PhilHealth-Transmittal-${phBarangay || 'All'}.docx`);
      showToast('Downloading PhilHealth Transmittal...', 'success');
    }
  };

  // Render PhilHealth preview
  useEffect(() => {
    if (phBlob && phPreviewRef.current) {
      phPreviewRef.current.innerHTML = '';
      renderAsync(phBlob, phPreviewRef.current, undefined, {
        className: 'docx',
        inWrapper: true,
      }).catch((err: unknown) => console.error('PhilHealth preview error:', err));
    }
  }, [phBlob]);

  // Auto-generate when PhilHealth data changes
  useEffect(() => {
    if (activeDoc === 'philhealth-transmittal' && phSelectedIds.size > 0 && !sigLoading) {
      handleGeneratePhilHealth();
    } else if (activeDoc !== 'philhealth-transmittal') {
      setPhBlob(null);
      setPhSelectedIds(new Set());
      if (phPreviewRef.current) {
        phPreviewRef.current.innerHTML = '';
      }
    }
  }, [activeDoc, sigLoading, phSelectedIds.size, phAddress, phBarangay, sigs.oscaHead.name]);

  // Load saved PhilHealth data from DB when tab opens
  useEffect(() => {
    if (activeDoc === 'philhealth-transmittal') {
      philhealthTransmittalService.getSetting('ph_office_address')
        .then(addr => { if (addr) setPhAddress(addr); })
        .catch(err => console.error('Load PH address error:', err));

      philhealthTransmittalService.getSelectedSeniors(phBarangay)
        .then(ids => { if (ids.length > 0) setPhSelectedIds(new Set(ids)); })
        .catch(err => console.error('Load PH seniors error:', err));
    }
  }, [activeDoc]);

  const previewRef = useRef<HTMLDivElement>(null);

  const documentCards = [
    {
      id: 'osca-transmittal' as DocumentType,
      title: 'OSCA Transmittal',
      subtitle: 'Office of the Senior Citizen Affairs',
      description: 'Transmittal letter for NCSC Regional Office â€” submission of accomplished forms and signatures.',
      icon: Send,
      color: 'teal',
    },
    {
      id: 'mswdo-transmittal' as DocumentType,
      title: 'MSWDO Transmittal',
      subtitle: 'Municipal Social Welfare & Development Office',
      description: 'Transmittal letter for NCSC â€” ECA application forms, masterlist, and pertinent documents.',
      icon: FileText,
      color: 'blue',
    },
    {
      id: 'certificate-transfer' as DocumentType,
      title: 'Certificate of Transfer',
      subtitle: 'Transfer of Residence Certification',
      description: 'Certificate for senior citizens who transferred residence to another municipality.',
      icon: ArrowRightLeft,
      color: 'amber',
    },
    {
      id: 'certification' as DocumentType,
      title: 'Certification',
      subtitle: 'DSWD Social Pension Certification',
      description: 'Certificate that the senior citizen is a bona fide pensioner of the DSWD Social Pension Program.',
      icon: Award,
      color: 'purple',
    },
    {
      id: 'masterlist' as DocumentType,
      title: 'Masterlist (Octogenarian/Nonagenarian/Centenarian)',
      subtitle: 'NCSC Validated Seniors List',
      description: 'Masterlist of validated Octogenarian, Nonagenarian, and Centenarian seniors with their attachment checklist.',
      icon: ClipboardList,
      color: 'green',
    },
    {
      id: 'philhealth-transmittal' as DocumentType,
      title: 'PhilHealth Transmittal',
      subtitle: 'PMRF Submission',
      description: 'Transmittal letter for PhilHealth Office — PMRF submission for senior citizens per barangay.',
      icon: FileText,
      color: 'blue',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
    teal: { bg: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800', icon: 'text-teal-600', hover: 'hover:border-teal-400 hover:shadow-teal-100' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600', hover: 'hover:border-blue-400 hover:shadow-blue-100' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-600', hover: 'hover:border-amber-400 hover:shadow-amber-100' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', icon: 'text-purple-600', hover: 'hover:border-purple-400 hover:shadow-purple-100' },
    green: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600', hover: 'hover:border-green-400 hover:shadow-green-100' },
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Page Title */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">Reports & Certificates Generator</h4>
        <p className="text-[11px] text-slate-400">Select a document type to generate the report or certificate.</p>
      </div>

      {/* Document Type Cards */}
      {!activeDoc && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {documentCards.map((card) => {
            const colors = colorMap[card.color];
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveDoc(card.id)}
                className={`group relative text-left p-6 rounded-2xl border-2 ${colors.border} ${colors.hover} bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]`}
              >
                <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={colors.icon} />
                </div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">{card.title}</h5>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">{card.subtitle}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">{card.description}</p>
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FileText size={14} className="text-slate-500" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Document Form */}
      {activeDoc && (
        <div className="space-y-4">
          {/* Header */}
          <div className="px-5 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
              <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                {documentCards.find(c => c.id === activeDoc)?.title}
              </h5>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveSignatories}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save size={13} />
                <span>Save Changes</span>
              </button>
              {activeDoc === 'osca-transmittal' ? (
                <>
                  <button
                    type="button"
                    onClick={handleGenerateTransmittal}
                    disabled={docxLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <FileText size={13} />
                    <span>{docxLoading ? 'Generating...' : 'Regenerate'}</span>
                  </button>
                  {docxBlob && (
                    <button
                      type="button"
                      onClick={handleDownloadDocx}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download DOCX</span>
                    </button>
                  )}
                </>
              ) : activeDoc === 'certificate-transfer' ? (
                <>
                  <button
                    type="button"
                    onClick={handleGenerateCertTransfer}
                    disabled={certTransferLoading || !formData.transferSeniorId}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <FileText size={13} />
                    <span>{certTransferLoading ? 'Generating...' : 'Regenerate'}</span>
                  </button>
                  {certTransferBlob && (
                    <button
                      type="button"
                      onClick={handleDownloadCertTransfer}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download DOCX</span>
                    </button>
                  )}
                </>
              ) : activeDoc === 'masterlist' ? (
                <>
                  <button
                    type="button"
                    onClick={handleGenerateMasterlist}
                    disabled={masterlistLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <FileText size={13} />
                    <span>{masterlistLoading ? 'Generating...' : 'Regenerate'}</span>
                  </button>
                  {masterlistBlob && (
                    <button
                      type="button"
                      onClick={handleDownloadMasterlist}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download DOCX</span>
                    </button>
                  )}
                </>
              ) : activeDoc === 'philhealth-transmittal' ? (
                <>
                  <button
                    type="button"
                    onClick={handleGeneratePhilHealth}
                    disabled={phLoading || phSelectedIds.size === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <FileText size={13} />
                    <span>{phLoading ? 'Generating...' : 'Regenerate'}</span>
                  </button>
                  {phBlob && (
                    <button
                      type="button"
                      onClick={handleDownloadPhilHealth}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Download size={13} />
                      <span>Download DOCX</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
              )}
            </div>
          </div>

          {/* 2-Column Layout: LEFT = Preview, RIGHT = Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start" style={{ maxHeight: '85vh' }}>
            {/* LEFT: Document Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 overflow-auto" style={{ maxHeight: '85vh' }}>
              <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                Document Preview
              </h6>

              {/* DOCX-based preview for OSCA Transmittal */}
              {activeDoc === 'osca-transmittal' && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm min-h-[500px] bg-gray-100 dark:bg-slate-800 overflow-hidden">
                  {docxLoading && (
                    <div className="flex items-center justify-center py-24">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading document...
                      </div>
                    </div>
                  )}
                  <div ref={docxPreviewRef} className="docx-preview-container" />
                </div>
              )}

              {/* DOCX-based preview for Certificate of Transfer */}
              {activeDoc === 'certificate-transfer' && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm min-h-[500px] bg-gray-100 dark:bg-slate-800 overflow-hidden">
                  {!certTransferBlob && !certTransferLoading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                      <FileText size={40} className="text-slate-300 dark:text-slate-600" />
                      <p className="text-xs text-slate-400 font-medium">Select a senior citizen to preview the certificate</p>
                    </div>
                  )}
                  {certTransferLoading && (
                    <div className="flex items-center justify-center py-24">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading document...
                      </div>
                    </div>
                  )}
                  <div ref={certTransferPreviewRef} className="docx-preview-container" />
                </div>
              )}

              {/* DOCX-based preview for Masterlist */}
              {activeDoc === 'masterlist' && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm min-h-[500px] bg-gray-100 dark:bg-slate-800 overflow-hidden">
                  {masterlistLoading && (
                    <div className="flex items-center justify-center py-24">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading masterlist...
                      </div>
                    </div>
                  )}
                  <div ref={masterlistPreviewRef} className="docx-preview-container" />
                </div>
              )}

              {/* DOCX-based preview for PhilHealth Transmittal */}
              {activeDoc === 'philhealth-transmittal' && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm min-h-[500px] bg-gray-100 dark:bg-slate-800 overflow-hidden">
                  {phSelectedIds.size === 0 && !phLoading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                      <FileText size={40} className="text-slate-300 dark:text-slate-600" />
                      <p className="text-xs text-slate-400 font-medium">Select seniors to generate the transmittal</p>
                    </div>
                  )}
                  {phLoading && (
                    <div className="flex items-center justify-center py-24">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading document...
                      </div>
                    </div>
                  )}
                  <div ref={phPreviewRef} className="docx-preview-container" />
                </div>
              )}

              {/* HTML-based preview for other document types */}
              <div ref={previewRef} className={`doc-preview border border-slate-200 rounded-xl shadow-sm ${activeDoc === 'masterlist' ? 'landscape' : ''}`} id="document-preview" style={{ display: (activeDoc === 'osca-transmittal' || activeDoc === 'certificate-transfer' || activeDoc === 'masterlist' || activeDoc === 'philhealth-transmittal') ? 'none' : undefined }}>

              {/* LETTERHEAD */}
              <div className="doc-letterhead">
                <img src="/juban-logo.png" alt="Juban Logo" />
                <div className="doc-letterhead-center">
                  <div>Republic of the Philippines</div>
                  <div>Province of Sorsogon</div>
                  <div>Municipality of Juban</div>
                </div>
                <img src="/Bagong_Pilipinas_Logo.svg.webp" alt="Bagong Pilipinas" />
              </div>

              {/* OSCA TRANSMITTAL */}
              {activeDoc === 'osca-transmittal' && (
                <>
                  <div className="doc-title-osca">Office of the Senior Citizen Affairs</div>
                  <div className="doc-title-bold">TRANSMITTAL</div>
                  <p style={{ marginTop: '30px' }}>{new Date(formData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <div style={{ marginTop: '30px' }}>
                    <p><strong>{sigs.recipient.name}</strong></p>
                    <p>{sigs.recipient.position}</p>
                    <p>{sigs.recipientAddress}</p>
                  </div>
                  <p style={{ marginTop: '20px' }}>Dear {sigs.receiverName}</p>
                  <p className="doc-body" style={{ textIndent: '40px' }}>{formData.purpose}</p>
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>BARANGAY</th>
                        <th>NO. OF SIGNATURES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barangayRows.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.name}</td>
                          <td style={{ textAlign: 'center' }}>{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ marginTop: '40px' }}>Very truly yours,</p>
                  <div className="doc-signatory" style={{ marginTop: '40px' }}>
                    <p className="doc-signatory-name">{sigs.oscaHead.name}</p>
                    <p className="doc-signatory-title">OSCA Head</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '60px' }}>
                    {/* Noted By */}
                    <div style={{ textAlign: 'center', marginLeft: 'auto' }}>
                      <p style={{ marginBottom: '30px' }}>NOTED:</p>
                      <p className="doc-signatory-name" style={{ fontSize: '10pt' }}>JANELA J. HAINTO, RSW</p>
                      <p style={{ fontSize: '9pt' }}>Acting MSWDO</p>
                    </div>
                  </div>
                </>
              )}

              {/* MSWDO TRANSMITTAL */}
              {activeDoc === 'mswdo-transmittal' && (
                <>
                  <div className="doc-header-gothic">Municipal Social Welfare and Development Office</div>
                  <div className="doc-title-bold">TRANSMITTAL</div>
                  <p style={{ marginTop: '20px' }}>{new Date(formData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <div style={{ marginTop: '30px' }}>
                    <p><strong>{sigs.recipient.name}</strong></p>
                    <p>{sigs.recipient.position}</p>
                    <p>{sigs.recipientAddress}</p>
                  </div>
                  <p style={{ marginTop: '20px' }}>Dear Atty. Bombase-Pacamarra,</p>
                  <p className="doc-body">{formData.mswdoBody}</p>
                  <p style={{ marginTop: '50px' }}>Very truly yours,</p>
                  <div className="doc-signatory">
                    <p className="doc-signatory-name">{sigs.mswdoHead.name}</p>
                    <p className="doc-signatory-title">{sigs.mswdoHead.position}</p>
                  </div>
                  <div style={{ marginTop: '60px', textAlign: 'center', marginLeft: 'auto' }}>
                    <p>NOTED:</p>
                    <div style={{ marginTop: '30px' }}>
                      <p className="doc-signatory-name">{sigs.notedBy.name}</p>
                      <p className="doc-signatory-title" style={{ marginRight: '20px' }}>{sigs.notedBy.position}</p>
                    </div>
                  </div>
                </>
              )}

              {/* CERTIFICATE OF TRANSFER */}
              {activeDoc === 'certificate-transfer' && (() => {
                const senior = getSelectedSenior(formData.transferSeniorId);
                const age = senior ? Math.abs(new Date(Date.now() - new Date(senior.birthdate).getTime()).getUTCFullYear() - 1970) : 0;
                return (
                  <>
                    <div className="doc-header-gothic">Municipal Social Welfare and Development Office</div>
                    <div className="doc-title-bold">CERTIFICATE OF TRANSFER</div>
                    <div className="doc-body" style={{ marginTop: '30px' }}>
                      <p>This is to certify that <strong>{senior ? `${senior.firstName} ${senior.middleName || ''} ${senior.lastName}`.toUpperCase() : '_______________'}</strong>, {age || '___'} years old, a senior citizen, is a former resident of Barangay {senior?.barangay || '___________'}, Juban, Sorsogon.</p>
                      <p style={{ marginTop: '15px' }}>This is to further certify that the above-named individual has transferred his place of residence to {formData.transferTo || '___________________'} since {formData.transferSince || '____'}.</p>
                      <p style={{ marginTop: '15px' }}>This certification is likewise issued to confirm the transfer of her senior citizen records to the <strong>Office for Senior Citizens Affairs (OSCA)</strong> of {formData.transferTo?.split(',')[1]?.trim() || '___________'}, Sorsogon for purposes of updating her residency and senior citizen registration.</p>
                      <p style={{ marginTop: '15px' }}>For reference, her senior citizen record/details are as follows:</p>
                      <p style={{ marginLeft: '40px' }}><strong>OSCA ID No.: {senior?.id || '____'}</strong></p>
                      <p style={{ marginLeft: '40px' }}><strong>Date of Issue: {senior?.birthdate ? 'January 22, 2019' : '____________'}</strong></p>
                      <p style={{ marginTop: '15px' }}>This certificate is issued upon the request of the above-named individual for whatever legal and official purpose it may serve.</p>
                      <p style={{ marginTop: '15px' }}>Issued this {new Date(formData.date).getDate()}<sup>{['st','nd','rd'][((new Date(formData.date).getDate()+90)%100-10)%10-1]||'th'}</sup> day of {new Date(formData.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} at Juban, Sorsogon.</p>
                    </div>
                    <p style={{ marginTop: '50px', textAlign: 'center' }}>Certified by:</p>
                    <div className="doc-signatory" style={{ textAlign: 'center', marginTop: '40px' }}>
                      <p className="doc-signatory-name">{sigs.oscaHead.name}</p>
                      <p style={{ fontSize: '10pt' }}>OSCA Head</p>
                    </div>
                    <div className="doc-signatory" style={{ textAlign: 'center', marginTop: '30px' }}>
                      <p className="doc-signatory-name">{sigs.mswdoHead.name}, RSW</p>
                      <p style={{ fontSize: '10pt' }}>Lic. No. 0032243</p>
                      <p style={{ fontSize: '10pt' }}>{sigs.mswdoHead.position}</p>
                    </div>
                  </>
                );
              })()}

              {/* CERTIFICATION (DSWD PENSION) */}
              {activeDoc === 'certification' && (() => {
                const senior = getSelectedSenior(formData.certSeniorId);
                const age = senior ? Math.abs(new Date(Date.now() - new Date(senior.birthdate).getTime()).getUTCFullYear() - 1970) : 0;
                return (
                  <>
                    <div className="doc-header-gothic">Municipal Social Welfare and Development Office</div>
                    <div className="doc-title-bold">CERTIFICATION</div>
                    <p style={{ marginTop: '30px' }}>TO WHOM IT MAY CONCERN:</p>
                    <div className="doc-body" style={{ marginTop: '20px' }}>
                      <p>This is to certify that <strong>{senior ? `${senior.firstName} ${senior.middleName || ''} ${senior.lastName}`.toUpperCase() : '_______________'}</strong>, {age || '___'} years old, bona fide resident of {senior?.barangay || '___________'}, Juban, Sorsogon, is a Pensioner of the {formData.certProgram} in the Municipality of Juban.</p>
                      <p style={{ marginTop: '15px' }}>This certification is being issued upon the request of the concerned individual for whatever legal purposes it may serve.</p>
                      <p style={{ marginTop: '15px' }}>Issued this {new Date(formData.date).getDate()}<sup>{['st','nd','rd'][((new Date(formData.date).getDate()+90)%100-10)%10-1]||'th'}</sup> day of {new Date(formData.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}, at the Municipal Social Welfare and Development Office, Juban, Sorsogon.</p>
                    </div>
                    <p style={{ marginTop: '50px', textAlign: 'center' }}>Certified by:</p>
                    <div className="doc-signatory" style={{ textAlign: 'center', marginTop: '40px' }}>
                      <p className="doc-signatory-name">{sigs.oscaHead.name}</p>
                      <p style={{ fontSize: '10pt' }}>OSCA Head</p>
                    </div>
                    <div className="doc-signatory" style={{ textAlign: 'center', marginTop: '30px' }}>
                      <p className="doc-signatory-name">{sigs.mswdoHead.name}, RSW</p>
                      <p style={{ fontSize: '10pt' }}>Lic. No. 0032243</p>
                      <p style={{ fontSize: '10pt' }}>{sigs.mswdoHead.position}</p>
                    </div>
                  </>
                );
              })()}

              {/* MASTERLIST (Octogenarian/Nonagenarian/Centenarian) */}
              {activeDoc === 'masterlist' && (() => {
                const qualified = seniors
                  .filter(s => {
                    const age = Math.abs(new Date(Date.now() - new Date(s.birthdate).getTime()).getUTCFullYear() - 1970);
                    return age >= 80 && (s.status === 'Qualified for Honoring' || s.status === 'Approved');
                  })
                  .sort((a, b) => a.lastName.localeCompare(b.lastName));
                return (
                  <>
                    <div style={{ textAlign: 'center', fontSize: '9pt', marginBottom: '5px' }}>
                      <em>Republic of the Philippines</em><br />
                      <em>Province of Sorsogon</em><br />
                      <em>City / Municipality of Juban</em>
                    </div>
                    <div className="doc-title-bold" style={{ fontSize: '13pt', lineHeight: '1.4' }}>
                      MASTERLIST OF VALIDATED OCTOGENARIAN, NONAGENARIAN AND CENTENARIAN AND ITS ATTACHMENT
                    </div>
                    <table className="doc-table" style={{ fontSize: '8pt', marginTop: '20px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f8f8' }}>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>NO.</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>LAST NAME</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>FIRST NAME</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>MIDDLE NAME</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>BIRTHDATE<br/>(MM/DD/YY)</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>AGE</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>SEX</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>BARANGAY</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>MUNICI-<br/>PALITY</th>
                          <th style={{ fontSize: '7pt', padding: '4px 6px' }}>PROVINCE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qualified.map((s, idx) => {
                          const bdate = new Date(s.birthdate);
                          const age = Math.abs(new Date(Date.now() - bdate.getTime()).getUTCFullYear() - 1970);
                          const mm = String(bdate.getMonth() + 1).padStart(2, '0');
                          const dd = String(bdate.getDate()).padStart(2, '0');
                          const yy = String(bdate.getFullYear()).slice(-2);
                          return (
                            <tr key={s.id}>
                              <td style={{ textAlign: 'center', padding: '3px 5px' }}>{idx + 1}</td>
                              <td style={{ padding: '3px 5px', textTransform: 'uppercase' }}>{s.lastName}</td>
                              <td style={{ padding: '3px 5px', textTransform: 'uppercase' }}>{s.firstName}</td>
                              <td style={{ padding: '3px 5px', textTransform: 'uppercase' }}>{s.middleName || ''}</td>
                              <td style={{ textAlign: 'center', padding: '3px 5px', fontFamily: 'monospace' }}>{mm}/{dd}/{yy}</td>
                              <td style={{ textAlign: 'center', padding: '3px 5px' }}>{age}</td>
                              <td style={{ textAlign: 'center', padding: '3px 5px' }}>{s.sex === 'Male' ? 'M' : 'F'}</td>
                              <td style={{ padding: '3px 5px' }}>{s.barangay}</td>
                              <td style={{ padding: '3px 5px' }}>Juban</td>
                              <td style={{ padding: '3px 5px' }}>Sorsogon</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p className="doc-signatory-name">{sigs.oscaHead.name}</p>
                        <p style={{ fontSize: '9pt', marginLeft: '10px' }}>OSCA Head / S. Focal</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p className="doc-signatory-name">{sigs.mswdoHead.name}</p>
                        <p style={{ fontSize: '9pt' }}>OIC MSWDO</p>
                      </div>
                    </div>
                    <div style={{ marginTop: '40px', textAlign: 'center', marginLeft: 'auto' }}>
                      <p>NOTED:</p>
                      <p className="doc-signatory-name">{sigs.notedBy.name}</p>
                      <p style={{ fontSize: '9pt' }}>Municipal Mayor</p>
                    </div>
                  </>
                );
              })()}

              </div>
            </div>

            {/* RIGHT: Input Forms */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5 overflow-auto" style={{ maxHeight: '85vh' }}>
            {activeDoc === 'osca-transmittal' && (
              <div className="space-y-0">
                {/* Sub-tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                  <button
                    type="button"
                    onClick={() => setOscaFormTab('signatories')}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      oscaFormTab === 'signatories'
                        ? 'text-teal-700 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    Signatories
                  </button>
                  <button
                    type="button"
                    onClick={() => setOscaFormTab('barangays')}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      oscaFormTab === 'barangays'
                        ? 'text-teal-700 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    Barangays ({transmittalBarangayRows.filter(r => r.name.trim()).length})
                  </button>
                </div>

                {/* ---- Signatories Tab ---- */}
                {oscaFormTab === 'signatories' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date</label>
                      <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Layunin / Purpose</label>
                      <textarea value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} rows={2} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none" />
                    </div>
                    {/* Receiver */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Receiver (Tatanggap)</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Name</label>
                          <input type="text" value={sigs.recipient.name} onChange={(e) => setSigs({...sigs, recipient: {...sigs.recipient, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                          <input type="text" value={sigs.recipient.position} onChange={(e) => setSigs({...sigs, recipient: {...sigs.recipient, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Address</label>
                        <input type="text" value={sigs.recipientAddress} onChange={(e) => setSigs({...sigs, recipientAddress: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Dear (Salutation Name)</label>
                        <input type="text" value={sigs.receiverName} onChange={(e) => setSigs({...sigs, receiverName: e.target.value})} placeholder="e.g. Atty. Bombase Pacamarra" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                    {/* OSCA Head (Sender) */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sender (Nagpadala)</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Name</label>
                          <input type="text" value={sigs.oscaHead.name} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                          <input type="text" value={sigs.oscaHead.position} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                    {/* Noted By */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Noted By</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Name</label>
                          <input type="text" value={sigs.notedBy.name} onChange={(e) => setSigs({...sigs, notedBy: {...sigs.notedBy, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                          <input type="text" value={sigs.notedBy.position} onChange={(e) => setSigs({...sigs, notedBy: {...sigs.notedBy, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- Barangays Tab ---- */}
                {oscaFormTab === 'barangays' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        {transmittalBarangayRows.filter(r => r.name.trim()).length} barangay &middot; {transmittalBarangayRows.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0)} total signatures
                      </p>
                    </div>
                    <div className="space-y-2">
                      {transmittalBarangayRows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <select
                            value={row.name}
                            onChange={(e) => {
                              const updated = [...transmittalBarangayRows];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setTransmittalBarangayRows(updated);
                            }}
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                          >
                            <option value="">â€” Select Barangay â€”</option>
                            {barangaysData
                              .filter(b => {
                                const selectedNames = transmittalBarangayRows.map(r => r.name);
                                return b.name === row.name || !selectedNames.includes(b.name);
                              })
                              .map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                              ))}
                          </select>
                          <input
                            type="number"
                            value={row.count}
                            onChange={(e) => {
                              const updated = [...transmittalBarangayRows];
                              updated[idx] = { ...updated[idx], count: e.target.value };
                              setTransmittalBarangayRows(updated);
                            }}
                            placeholder="No."
                            className="w-20 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-center focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = transmittalBarangayRows.filter((_, i) => i !== idx);
                              setTransmittalBarangayRows(updated.length ? updated : [{ name: '', count: '' }]);
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setTransmittalBarangayRows([...transmittalBarangayRows, { name: '', count: '' }])}
                        className="flex items-center gap-1.5 px-3 py-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-dashed border-teal-300 dark:border-teal-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer w-full justify-center"
                      >
                        <Plus size={12} />
                        <span>Add Barangay</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* ===== MSWDO TRANSMITTAL FORM ===== */}
            {activeDoc === 'mswdo-transmittal' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Transmittal Content (Body)</label>
                  <textarea value={formData.mswdoBody} onChange={(e) => setFormData({...formData, mswdoBody: e.target.value})} rows={5} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none" />
                </div>
                {/* Signatories */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                  <h6 className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Signatories</h6>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Receiver (Tatanggap)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Name</label>
                        <input type="text" value={sigs.recipient.name} onChange={(e) => setSigs({...sigs, recipient: {...sigs.recipient, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                        <input type="text" value={sigs.recipient.position} onChange={(e) => setSigs({...sigs, recipient: {...sigs.recipient, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Address</label>
                      <input type="text" value={sigs.recipientAddress} onChange={(e) => setSigs({...sigs, recipientAddress: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sender (Nagpadala / MSWDO Head)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Name</label>
                        <input type="text" value={sigs.mswdoHead.name} onChange={(e) => setSigs({...sigs, mswdoHead: {...sigs.mswdoHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                        <input type="text" value={sigs.mswdoHead.position} onChange={(e) => setSigs({...sigs, mswdoHead: {...sigs.mswdoHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Noted By</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Name</label>
                        <input type="text" value={sigs.notedBy.name} onChange={(e) => setSigs({...sigs, notedBy: {...sigs.notedBy, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                        <input type="text" value={sigs.notedBy.position} onChange={(e) => setSigs({...sigs, notedBy: {...sigs.notedBy, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== CERTIFICATE OF TRANSFER ===== */}
            {/* ===== CERTIFICATE OF TRANSFER ===== */}
            {activeDoc === 'certificate-transfer' && (
              <div className="space-y-4">
                {/* Senior Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Select Senior Citizen</label>
                  <select value={formData.transferSeniorId} onChange={(e) => {
                    const sid = e.target.value;
                    const s = seniors.find(x => x.id === sid);
                    setFormData({...formData, transferSeniorId: sid, oscaIdNo: s?.oscaNumber || s?.id || ''});
                  }} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none">
                    <option value="">-- Select a Senior --</option>
                    {seniors.filter(s => s.status === 'Approved').map((s) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.middleName} {s.lastName} \u2014 Brgy. {s.barangay}</option>
                    ))}
                  </select>
                </div>

                {/* Senior Record Details */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Senior Citizen Record</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">OSCA ID No.</label>
                      <input type="text" value={formData.oscaIdNo} onChange={(e) => setFormData({...formData, oscaIdNo: e.target.value})} placeholder="OSCA ID Number" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Date of Issue (OSCA ID)</label>
                      <input type="text" value={formData.oscaIdDateIssued} onChange={(e) => setFormData({...formData, oscaIdDateIssued: e.target.value})} placeholder="e.g. January 22, 2019" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Transfer Details */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transfer Details</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Lilipatan (Transfer To)</label>
                      <input type="text" value={formData.transferTo} onChange={(e) => setFormData({...formData, transferTo: e.target.value})} placeholder="e.g. Barangay Nato, Gubat, Sorsogon" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Transfer OSCA Address</label>
                      <input type="text" value={formData.transferAddress} onChange={(e) => setFormData({...formData, transferAddress: e.target.value})} placeholder="e.g. Gubat, Sorsogon" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Municipal Address</label>
                      <input type="text" value={formData.municipalAddress} onChange={(e) => setFormData({...formData, municipalAddress: e.target.value})} placeholder="e.g. Juban, Sorsogon" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Certificate Date</label>
                      <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Signatories */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                  <h6 className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Signatories</h6>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">OSCA Head</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Name</label>
                        <input type="text" value={sigs.oscaHead.name} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                        <input type="text" value={sigs.oscaHead.position} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MSWDO Head</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Name</label>
                        <input type="text" value={sigs.mswdoHead.name} onChange={(e) => setSigs({...sigs, mswdoHead: {...sigs.mswdoHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                        <input type="text" value={sigs.mswdoHead.position} onChange={(e) => setSigs({...sigs, mswdoHead: {...sigs.mswdoHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">License No.</label>
                        <input type="text" value={sigs.mswdoLicense} onChange={(e) => setSigs({...sigs, mswdoLicense: e.target.value})} placeholder="e.g. Lic. No. 0032243" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Designation</label>
                        <input type="text" value={sigs.mswdoDesignation} onChange={(e) => setSigs({...sigs, mswdoDesignation: e.target.value})} placeholder="e.g. RSW" className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== CERTIFICATION (DSWD Pension) ===== */}
            {activeDoc === 'certification' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Select Senior Citizen</label>
                  <select value={formData.certSeniorId} onChange={(e) => setFormData({...formData, certSeniorId: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none">
                    <option value="">-- Select a Senior --</option>
                    {seniors.filter(s => s.status === 'Approved').map((s) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.middleName} {s.lastName} â€” Brgy. {s.barangay}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Program / Certification For</label>
                    <input type="text" value={formData.certProgram} onChange={(e) => setFormData({...formData, certProgram: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date of Issue</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                  </div>
                </div>
                {/* Signatories */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                  <h6 className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Signatories</h6>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">OSCA Head</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Name</label>
                        <input type="text" value={sigs.oscaHead.name} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                        <input type="text" value={sigs.oscaHead.position} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MSWDO Head</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Name</label>
                        <input type="text" value={sigs.mswdoHead.name} onChange={(e) => setSigs({...sigs, mswdoHead: {...sigs.mswdoHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                        <input type="text" value={sigs.mswdoHead.position} onChange={(e) => setSigs({...sigs, mswdoHead: {...sigs.mswdoHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          

            {/* ===== MASTERLIST (Octogenarian/Nonagenarian/Centenarian) ===== */}
            {activeDoc === 'masterlist' && (() => {
              const qualifiedPool = seniors
                .filter(s => {
                  const age = Math.abs(new Date(Date.now() - new Date(s.birthdate).getTime()).getUTCFullYear() - 1970);
                  return age >= 80 && (s.status === 'Qualified for Honoring' || s.status === 'Approved');
                })
                .sort((a, b) => a.lastName.localeCompare(b.lastName));
              const selectedList = qualifiedPool.filter(s => selectedMasterlistIds.has(s.id));
              return (
              <div className="space-y-0">
                {/* Sub-tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                  <button type="button" onClick={() => setMasterlistFormTab('seniors')}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      masterlistFormTab === 'seniors'
                        ? 'text-teal-700 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}>
                    Seniors List ({selectedMasterlistIds.size}/{qualifiedPool.length})
                  </button>
                  <button type="button" onClick={() => setMasterlistFormTab('signatories')}
                    className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      masterlistFormTab === 'signatories'
                        ? 'text-teal-700 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}>
                    Signatories
                  </button>
                </div>

                {/* ---- Seniors List Tab ---- */}
                {masterlistFormTab === 'seniors' && (
                  <div className="space-y-4">
                    {/* Selected for Document */}
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-green-200 dark:border-green-800 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                          Selected for Document ({selectedList.length})
                        </span>
                        {selectedList.length > 0 && (
                          <button type="button" onClick={() => setSelectedMasterlistIds(new Set())} className="text-[9px] text-red-500 hover:text-red-700 font-bold cursor-pointer">
                            Clear All
                          </button>
                        )}
                      </div>
                      {selectedList.length === 0 ? (
                        <div className="px-4 py-6 text-center text-[10px] text-slate-400">
                          Select seniors from the pool below to add to the document
                        </div>
                      ) : (
                        <div className="max-h-[180px] overflow-y-auto">
                          <table className="w-full text-[10px]">
                            <thead className="bg-green-100/50 dark:bg-green-900/30 sticky top-0">
                              <tr>
                                <th className="px-3 py-1.5 text-left font-bold text-green-700 dark:text-green-400">#</th>
                                <th className="px-3 py-1.5 text-left font-bold text-green-700 dark:text-green-400">Name</th>
                                <th className="px-3 py-1.5 text-left font-bold text-green-700 dark:text-green-400">Barangay</th>
                                <th className="px-3 py-1.5 text-right font-bold text-green-700 dark:text-green-400"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedList.map((s, idx) => (
                                <tr key={s.id} className="border-t border-green-100 dark:border-green-900">
                                  <td className="px-3 py-1.5 text-slate-500">{idx + 1}</td>
                                  <td className="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 uppercase">{s.lastName}, {s.firstName} {s.middleName || ''}</td>
                                  <td className="px-3 py-1.5 text-slate-500">{s.barangay}</td>
                                  <td className="px-3 py-1.5 text-right">
                                    <button type="button" onClick={() => { const next = new Set(selectedMasterlistIds); next.delete(s.id); setSelectedMasterlistIds(next); }}
                                      className="text-red-400 hover:text-red-600 cursor-pointer p-0.5" title="Remove">
                                      <Trash2 size={11} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Qualified Pool */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Qualified Seniors 80+ ({qualifiedPool.length})
                        </span>
                        <button type="button" onClick={() => setSelectedMasterlistIds(new Set(qualifiedPool.map(s => s.id)))} className="text-[9px] text-teal-600 hover:text-teal-800 font-bold cursor-pointer">
                          Select All
                        </button>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto">
                        <table className="w-full text-[10px]">
                          <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                            <tr>
                              <th className="px-3 py-1.5 text-center font-bold text-slate-500 w-8"></th>
                              <th className="px-3 py-1.5 text-left font-bold text-slate-500">Name</th>
                              <th className="px-3 py-1.5 text-center font-bold text-slate-500">Age</th>
                              <th className="px-3 py-1.5 text-center font-bold text-slate-500">Sex</th>
                              <th className="px-3 py-1.5 text-left font-bold text-slate-500">Barangay</th>
                            </tr>
                          </thead>
                          <tbody>
                            {qualifiedPool.map((s) => {
                              const age = Math.abs(new Date(Date.now() - new Date(s.birthdate).getTime()).getUTCFullYear() - 1970);
                              const isSelected = selectedMasterlistIds.has(s.id);
                              return (
                                <tr key={s.id} className={`border-t border-slate-100 dark:border-slate-700 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50 dark:bg-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                                  onClick={() => {
                                    const next = new Set(selectedMasterlistIds);
                                    if (isSelected) next.delete(s.id); else next.add(s.id);
                                    setSelectedMasterlistIds(next);
                                  }}>
                                  <td className="px-3 py-1.5 text-center">
                                    <input type="checkbox" checked={isSelected} readOnly className="w-3 h-3 rounded border-slate-300 text-teal-600 cursor-pointer" />
                                  </td>
                                  <td className="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 uppercase">{s.lastName}, {s.firstName}</td>
                                  <td className="px-3 py-1.5 text-center text-slate-500">{age}</td>
                                  <td className="px-3 py-1.5 text-center text-slate-500">{s.sex === 'Male' ? 'M' : 'F'}</td>
                                  <td className="px-3 py-1.5 text-slate-500">{s.barangay}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- Signatories Tab ---- */}
                {masterlistFormTab === 'signatories' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Municipality</label>
                        <input type="text" value="Juban" readOnly className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Province</label>
                        <input type="text" value="Sorsogon" readOnly className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Selected / Qualified</label>
                        <div className="px-4 py-2 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-700 rounded-xl text-xs font-bold text-green-700 dark:text-green-300">
                          {selectedMasterlistIds.size} / {qualifiedPool.length} seniors
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                      <h6 className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Signatories</h6>
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Prepared by (OSCA Head)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Name</label>
                            <input type="text" value={sigs.oscaHead.name} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                            <input type="text" value={sigs.oscaHead.position} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Noted by (MSWDO)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Name</label>
                            <input type="text" value={sigs.mswdoHead.name} onChange={(e) => setSigs({...sigs, mswdoHead: {...sigs.mswdoHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                            <input type="text" value={sigs.mswdoHead.position} onChange={(e) => setSigs({...sigs, mswdoHead: {...sigs.mswdoHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })()}

            {/* ===== PHILHEALTH TRANSMITTAL ===== */}
            {activeDoc === 'philhealth-transmittal' && (() => {
              const approvedSeniors = seniors
                .filter(s => s.status === 'Approved')
                .sort((a, b) => a.lastName.localeCompare(b.lastName));
              const filteredPool = phBarangay ? approvedSeniors.filter(s => s.barangay === phBarangay) : approvedSeniors;
              const selectedList = approvedSeniors.filter(s => phSelectedIds.has(s.id));
              return (
              <div className="space-y-4">
                {/* Letter Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">PhilHealth Office Address</label>
                    <input type="text" value={phAddress} onChange={(e) => setPhAddress(e.target.value)} placeholder="e.g. Legazpi City, Albay" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Barangay</label>
                    <select value={phBarangay} onChange={(e) => setPhBarangay(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer">
                      <option value="">— All Barangays —</option>
                      {barangaysData.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* OSCA Head */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">OSCA Head</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Name</label>
                      <input type="text" value={sigs.oscaHead.name} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, name: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500">Posisyon</label>
                      <input type="text" value={sigs.oscaHead.position} onChange={(e) => setSigs({...sigs, oscaHead: {...sigs.oscaHead, position: e.target.value}})} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
                {/* Selected for Document */}
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-green-200 dark:border-green-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                      Selected for Transmittal ({selectedList.length})
                    </span>
                    {selectedList.length > 0 && (
                      <button type="button" onClick={() => setPhSelectedIds(new Set())} className="text-[9px] text-red-500 hover:text-red-700 font-bold cursor-pointer">Clear All</button>
                    )}
                  </div>
                  {selectedList.length === 0 ? (
                    <div className="px-4 py-4 text-center text-[10px] text-slate-400">Select seniors from the pool below</div>
                  ) : (
                    <div className="max-h-[140px] overflow-y-auto">
                      <table className="w-full text-[10px]">
                        <tbody>
                          {selectedList.map((s, idx) => (
                            <tr key={s.id} className="border-t border-green-100 dark:border-green-900">
                              <td className="px-3 py-1 text-slate-400">{idx + 1}</td>
                              <td className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-200 uppercase">{s.lastName}, {s.firstName}</td>
                              <td className="px-3 py-1 text-slate-500">{s.barangay}</td>
                              <td className="px-3 py-1 text-right">
                                <button type="button" onClick={() => { const n = new Set(phSelectedIds); n.delete(s.id); setPhSelectedIds(n); }} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 size={11} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {/* Pool */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Approved Seniors {phBarangay ? `\u2014 ${phBarangay}` : ''} ({filteredPool.length})
                    </span>
                    <button type="button" onClick={() => setPhSelectedIds(new Set(filteredPool.map(s => s.id)))} className="text-[9px] text-teal-600 hover:text-teal-800 font-bold cursor-pointer">Select All</button>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto">
                    <table className="w-full text-[10px]">
                      <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                        <tr>
                          <th className="px-3 py-1.5 text-center w-8"></th>
                          <th className="px-3 py-1.5 text-left font-bold text-slate-500">Name</th>
                          <th className="px-3 py-1.5 text-center font-bold text-slate-500">Sex</th>
                          <th className="px-3 py-1.5 text-left font-bold text-slate-500">Barangay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPool.map((s) => {
                          const isSel = phSelectedIds.has(s.id);
                          return (
                            <tr key={s.id} className={`border-t border-slate-100 dark:border-slate-700 cursor-pointer transition-colors ${isSel ? 'bg-teal-50 dark:bg-teal-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                              onClick={() => { const n = new Set(phSelectedIds); if (isSel) n.delete(s.id); else n.add(s.id); setPhSelectedIds(n); }}>
                              <td className="px-3 py-1.5 text-center"><input type="checkbox" checked={isSel} readOnly className="w-3 h-3 rounded border-slate-300 text-teal-600 cursor-pointer" /></td>
                              <td className="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 uppercase">{s.lastName}, {s.firstName}</td>
                              <td className="px-3 py-1.5 text-center text-slate-500">{s.sex === 'Male' ? 'M' : 'F'}</td>
                              <td className="px-3 py-1.5 text-slate-500">{s.barangay}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              );
            })()}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

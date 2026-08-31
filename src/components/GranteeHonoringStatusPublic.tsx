import React, { useState } from "react";
import { supabase } from "../../utils/supabase";
import {
  Search,
  ArrowLeft,
  Lock,
  Clock,
  CheckCircle,
  ExternalLink,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Hash,
  Loader2,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Image,
  Paperclip,
  MapPin,
  Phone,
  Heart,
  CreditCard,
  Users,
  Globe,
  FileDown,
} from "lucide-react";
import CentenarianFormPDF from './Centenarian_form_PDF';

interface HonoringRecord {
  id: string;
  osca_number: string;
  status: string;
  created_at: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  birthdate: string | null;
  age: number | null;
  contact_number: string | null;
  sex: string | null;
  civil_status: string | null;
  citizenship: string | null;
  dual_citizen_details: string | null;
  physical_disability: boolean | null;
  physical_disability_text: string | null;
  ethnic_origin: string | null;
  address: string | null;
  barangay: string | null;
  city_town: string | null;
  province: string | null;
  region: string | null;
  zip_code: string | null;
  abroad_house_no: string | null;
  abroad_street: string | null;
  abroad_city: string | null;
  abroad_state: string | null;
  abroad_country: string | null;
  abroad_zip_code: string | null;
  ncsc_reference_code: string | null;
  place_of_submission: string | null;
  data_privacy_consent: boolean | null;
  spouse_last_name: string | null;
  spouse_first_name: string | null;
  spouse_middle_name: string | null;
  spouse_extension: string | null;
  spouse_contact_number: string | null;
  children: any[] | null;
  preferred_payment_mode: string | null;
  account_number: string | null;
  bank_name: string | null;
  branch_name: string | null;
  bank_address: string | null;
  is_joint_account: boolean | null;
  bic_swift_code: string | null;
  iban: string | null;
  is_deceased: boolean | null;
  date_of_death: string | null;
  claimant_first_name: string | null;
  claimant_middle_name: string | null;
  claimant_last_name: string | null;
  claimant_extension: string | null;
  claimant_contact_number: string | null;
  claimant_email: string | null;
  claimant_relationship: string | null;
  claimant_house_no: string | null;
  claimant_street: string | null;
  claimant_barangay: string | null;
  claimant_city: string | null;
  claimant_province: string | null;
  claimant_zip_code: string | null;
  claimant_payment_mode: string | null;
  claimant_account_number: string | null;
  claimant_bank_name: string | null;
  claimant_branch_name: string | null;
  claimant_bank_address: string | null;
  claimant_is_joint_account: boolean | null;
  claimant_bic_swift_code: string | null;
  claimant_iban: string | null;
  grantee_signed: string | null;
  date_signed: string | null;
  doc1: string[] | null;
  doc2: string[] | null;
  doc3: string[] | null;
  doc4: string[] | null;
  doc5: string[] | null;
  doc6: string[] | null;
  doc7: string[] | null;
  doc8: string[] | null;
  doc9: string[] | null;
  doc10: string[] | null;
  doc11: string[] | null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string; description: string }> = {
  'Pending': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <Clock size={18} className="text-amber-600" />,
    label: 'Pending',
    description: 'Your application has been received and is awaiting initial review by OSCA staff.',
  },
  'Under Review': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <FileText size={18} className="text-blue-600" />,
    label: 'Under Review',
    description: 'Your documents and information are currently being reviewed and verified.',
  },
  'Verified': {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    icon: <ShieldCheck size={18} className="text-teal-600" />,
    label: 'Verified',
    description: 'Your application has been verified. It is now being processed for final approval.',
  },
  'Approved': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <CheckCircle size={18} className="text-emerald-600" />,
    label: 'Approved',
    description: 'Congratulations! Your claim has been approved. Please wait for further instructions on claiming your benefit.',
  },
  'Rejected': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: <XCircle size={18} className="text-red-600" />,
    label: 'Rejected',
    description: 'Your application was not approved. Please visit the OSCA office for more information.',
  },
  'Claimed': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: <Award size={18} className="text-purple-600" />,
    label: 'Claimed',
    description: 'The honoring benefit has been successfully claimed. Thank you!',
  },
  'Unclaimed': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: <AlertCircle size={18} className="text-orange-600" />,
    label: 'Unclaimed',
    description: 'Your claim is approved but has not yet been collected. Please visit OSCA to claim your benefit.',
  },
};

const DOC_LABELS: Record<string, string> = {
  doc1: "Accomplished Annex A Grantee/Claimant Form",
  doc2: "Primary ID (PSA/LCR Birth Cert, PhilSys/National ID, or Passport)",
  doc3: "Primary ID for Abroad (Valid PH Passport or Identification Certificate)",
  doc4: "Secondary IDs (Two valid secondary IDs)",
  doc5: "Whole-body/half-upper body photo",
  doc6: "Bank deposit slip / GCash Profile Info",
  doc7: "PSA/LCR Death Certificate",
  doc8: "Proof of Relationship (PSA/LCR certificates)",
  doc9: "Claimant's Bank deposit slip / GCash Profile",
  doc10: "Original Warranty and Release From Liability Form",
  doc11: "Original LGU/RCF Certification of No Relative",
};

const DOC_KEYS = ['doc1', 'doc2', 'doc3', 'doc4', 'doc5', 'doc6', 'doc7', 'doc8', 'doc9', 'doc10', 'doc11'] as const;

interface Props {
  onBack: () => void;
}

// Helper component for displaying a field — responsive padding & text sizes
function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="py-2 px-2.5 sm:px-3 bg-slate-50/80 rounded-lg border border-slate-100">
      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 leading-tight">{label}</p>
      <p className="text-xs sm:text-sm font-medium text-slate-700 break-words leading-snug">{value}</p>
    </div>
  );
}

// Section wrapper — responsive padding
function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200/80 rounded-lg sm:rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-1 sm:p-1.5 bg-white rounded-md sm:rounded-lg border border-slate-200 shadow-sm">
            {icon}
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
}

export default function GranteeHonoringStatusPublic({ onBack }: Props) {
  const [oscaId, setOscaId] = useState("");
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<HonoringRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [showCentenarianDrawer, setShowCentenarianDrawer] = useState(false);
  const [selectedRecordForPdf, setSelectedRecordForPdf] = useState<HonoringRecord | null>(null);

  const handleSearch = async () => {
    const trimmed = oscaId.trim();
    if (!trimmed) {
      setError("Please enter your OSCA LGU ID Number.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setIsLoading(true);
    setSearched(true);
    setExpandedRecord(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("seniors")
        .select("password")
        .eq("osca_number", trimmed)
        .maybeSingle();

      if (fetchError) {
        setError("Something went wrong. Please try again later.");
        setRecords([]);
        setIsLoading(false);
        return;
      }

      if (!data || data.password !== password.trim()) {
        setError("Invalid OSCA ID or password. Please try again.");
        setRecords([]);
        setIsLoading(false);
        return;
      }

      // Password verified — fetch honoring records
      const { data: honoringData, error: honoringError } = await supabase
        .from("centenarian_honoring")
        .select("*")
        .eq("osca_number", trimmed)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (honoringError) {
        setError("Something went wrong. Please try again later.");
        setRecords([]);
      } else {
        setRecords(honoringData || []);
        if (honoringData && honoringData.length > 0) {
          setExpandedRecord(honoringData[0].id);
        }
      }
    } catch {
      setError("Connection error. Please check your internet and try again.");
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getFullName = (record: HonoringRecord) => {
    const parts = [record.first_name, record.middle_name, record.last_name].filter(Boolean);
    if (record.suffix) parts.push(record.suffix);
    return parts.join(" ");
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <AlertCircle size={18} className="text-slate-500" />,
      label: status,
      description: 'Status information is not available.',
    };
  };

  const getAbroadAddress = (record: HonoringRecord) => {
    const parts = [record.abroad_house_no, record.abroad_street, record.abroad_city, record.abroad_state, record.abroad_country].filter(Boolean);
    if (record.abroad_zip_code) parts.push(record.abroad_zip_code);
    return parts.join(", ");
  };

  const getClaimantFullName = (record: HonoringRecord) => {
    const parts = [record.claimant_first_name, record.claimant_middle_name, record.claimant_last_name].filter(Boolean);
    if (record.claimant_extension) parts.push(record.claimant_extension);
    return parts.join(" ");
  };

  const getClaimantAddress = (record: HonoringRecord) => {
    const parts = [record.claimant_house_no, record.claimant_street, record.claimant_barangay, record.claimant_city, record.claimant_province].filter(Boolean);
    if (record.claimant_zip_code) parts.push(record.claimant_zip_code);
    return parts.join(", ");
  };

  const getSpouseFullName = (record: HonoringRecord) => {
    const parts = [record.spouse_first_name, record.spouse_middle_name, record.spouse_last_name].filter(Boolean);
    if (record.spouse_extension) parts.push(record.spouse_extension);
    return parts.join(" ");
  };

  const maskAccountNumber = (num: string) => {
    if (num.length <= 4) return num;
    return "••••" + num.slice(-4);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-0 animate-fadeIn">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-teal-700 transition-colors cursor-pointer group"
      >
        <ArrowLeft size={14} className="sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Landing Page
      </button>

      {/* Main Card */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
        {/* Header stripe */}
        <div
          className="h-1 sm:h-1.5 w-full"
          style={{
            background: "linear-gradient(to right, #0d9488 0%, #059669 50%, #10b981 100%)",
          }}
        ></div>

        <div className="p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Title Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
              <Search size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7 text-teal-600" />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
              Check Honoring Status
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-1.5 max-w-md mx-auto leading-relaxed">
              Enter your OSCA LGU ID to view your Centenarian Honoring application details (R.A. 11982)
            </p>
          </div>

          {/* Search Input — stacked on mobile, inline on sm+ */}
          <div className="max-w-lg mx-auto mb-6 sm:mb-8">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  OSCA LGU ID Number
                </label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    value={oscaId}
                    onChange={(e) => { setOscaId(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. OSCA-2024-00123"
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full px-5 py-2.5 sm:py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                Search
              </button>
            </div>

            {error && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Results Section */}
          {searched && !isLoading && (
            <div className="space-y-3 sm:space-y-4">
              {records.length === 0 ? (
                /* No records found */
                <div className="text-center py-8 sm:py-10 px-4">
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                    <FileText size={22} className="text-slate-400" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-1">No Records Found</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                    No Centenarian Honoring application was found for this OSCA LGU ID. Please double-check your ID number or visit the OSCA office for assistance.
                  </p>
                </div>
              ) : (
                <>
                  {/* Results header */}
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {records.length} Record{records.length > 1 ? "s" : ""} Found
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-400">
                      Latest first
                    </p>
                  </div>

                  {/* Record Cards */}
                  {records.map((record, index) => {
                    const statusConfig = getStatusConfig(record.status);
                    const isExpanded = expandedRecord === record.id;

                    return (
                      <div
                        key={record.id}
                        className={`border rounded-xl sm:rounded-2xl overflow-hidden transition-all ${statusConfig.border}`}
                      >
                        {/* Status Banner — clickable */}
                        <button
                          onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                          className={`w-full ${statusConfig.bg} px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between cursor-pointer hover:brightness-95 transition-all gap-2`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/70 border ${statusConfig.border} shadow-sm shrink-0`}>
                              {statusConfig.icon}
                            </div>
                            <div className="text-left min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-wider ${statusConfig.text}`}>
                                  {statusConfig.label}
                                </span>
                                {index === 0 && records.length > 1 && (
                                  <span className="text-[9px] sm:text-[10px] font-bold bg-white/80 text-slate-500 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200">
                                    LATEST
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                                {formatDateTime(record.created_at)} • {getFullName(record)}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {isExpanded ? (
                              <ChevronUp size={16} className={`${statusConfig.text} opacity-60`} />
                            ) : (
                              <ChevronDown size={16} className={`${statusConfig.text} opacity-60`} />
                            )}
                          </div>
                        </button>

                        {/* Expanded Record Details */}
                        {isExpanded && (
                          <div className="bg-white px-3 sm:px-5 md:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
                            {/* Status Description */}
                            <div className={`${statusConfig.bg} border ${statusConfig.border} rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3`}>
                              <p className={`text-xs sm:text-sm ${statusConfig.text} leading-relaxed font-medium`}>
                                {statusConfig.description}
                              </p>
                            </div>

                            {/* Download Centenarian Form — only when Approved */}
                            {record.status === "Approved" && (
                              <button
                                onClick={() => {
                                  setSelectedRecordForPdf(record);
                                  setShowCentenarianDrawer(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-[0.97]"
                              >
                                <FileDown size={16} />
                                Download Centenarian Form
                              </button>
                            )}

                            {/* A. Personal Information */}
                            <Section title="Personal Information" icon={<User size={14} className="text-teal-600" />}>
                              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                                <InfoField label="First Name" value={record.first_name} />
                                <InfoField label="Middle Name" value={record.middle_name} />
                                <InfoField label="Last Name" value={record.last_name} />
                                <InfoField label="Suffix" value={record.suffix} />
                                <InfoField label="Birthdate" value={record.birthdate ? formatDate(record.birthdate) : null} />
                                <InfoField label="Age" value={record.age ? `${record.age} years old` : null} />
                                <InfoField label="Sex" value={record.sex} />
                                <InfoField label="Civil Status" value={record.civil_status} />
                                <InfoField label="Citizenship" value={record.citizenship} />
                                <InfoField label="Dual Citizen Details" value={record.dual_citizen_details} />
                                <InfoField label="Physical Disability" value={record.physical_disability ? (record.physical_disability_text || 'Yes') : record.physical_disability === false ? 'None' : null} />
                                <InfoField label="Ethnic Origin" value={record.ethnic_origin} />
                                <InfoField label="Contact Number" value={record.contact_number} />
                                <InfoField label="OSCA Number" value={record.osca_number} />
                                <InfoField label="NCSC Reference Code" value={record.ncsc_reference_code} />
                              </div>
                            </Section>

                            {/* B. Address */}
                            <Section title="Address" icon={<MapPin size={14} className="text-blue-600" />} defaultOpen={false}>
                              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                                <InfoField label="Address / House No. & Street" value={record.address} />
                                <InfoField label="Barangay" value={record.barangay} />
                                <InfoField label="City / Town" value={record.city_town} />
                                <InfoField label="Province" value={record.province} />
                                <InfoField label="Region" value={record.region} />
                                <InfoField label="Zip Code" value={record.zip_code} />
                              </div>
                              {getAbroadAddress(record) && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Abroad Address</p>
                                  <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                                    <InfoField label="House No." value={record.abroad_house_no} />
                                    <InfoField label="Street" value={record.abroad_street} />
                                    <InfoField label="City" value={record.abroad_city} />
                                    <InfoField label="State" value={record.abroad_state} />
                                    <InfoField label="Country" value={record.abroad_country} />
                                    <InfoField label="Zip Code" value={record.abroad_zip_code} />
                                  </div>
                                </div>
                              )}
                            </Section>

                            {/* C. Spouse Information */}
                            {getSpouseFullName(record) && (
                              <Section title="Spouse Information" icon={<Heart size={14} className="text-rose-500" />} defaultOpen={false}>
                                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                                  <InfoField label="First Name" value={record.spouse_first_name} />
                                  <InfoField label="Middle Name" value={record.spouse_middle_name} />
                                  <InfoField label="Last Name" value={record.spouse_last_name} />
                                  <InfoField label="Extension" value={record.spouse_extension} />
                                  <InfoField label="Contact Number" value={record.spouse_contact_number} />
                                </div>
                              </Section>
                            )}

                            {/* D. Children */}
                            {record.children && record.children.length > 0 && (
                              <Section title={`Children (${record.children.length})`} icon={<Users size={14} className="text-indigo-600" />} defaultOpen={false}>
                                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                                  {record.children.map((child: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2 py-1.5 px-2.5 sm:px-3 bg-slate-50/80 rounded-lg border border-slate-100">
                                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {idx + 1}
                                      </span>
                                      <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">{child.name || child}</span>
                                    </div>
                                  ))}
                                </div>
                              </Section>
                            )}

                            {/* E. Transaction / Payment */}
                            {record.preferred_payment_mode && (
                              <Section title="Transaction Account" icon={<CreditCard size={14} className="text-emerald-600" />} defaultOpen={false}>
                                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
                                  <InfoField label="Payment Mode" value={record.preferred_payment_mode} />
                                  <InfoField label="Account Number" value={record.account_number ? maskAccountNumber(record.account_number) : null} />
                                  <InfoField label="Bank Name" value={record.bank_name} />
                                  <InfoField label="Branch Name" value={record.branch_name} />
                                  <InfoField label="Bank Address" value={record.bank_address} />
                                  <InfoField label="Joint Account" value={record.is_joint_account ? 'Yes' : record.is_joint_account === false ? 'No' : null} />
                                  <InfoField label="BIC/SWIFT Code" value={record.bic_swift_code} />
                                  <InfoField label="IBAN" value={record.iban} />
                                </div>
                              </Section>
                            )}

                            {/* F. Deceased Grantee / Claimant Info */}
                            {record.is_deceased && (
                              <Section title="Deceased Grantee / Claimant" icon={<FileText size={14} className="text-slate-600" />} defaultOpen={false}>
                                <div className="mb-3 bg-slate-100 border border-slate-200 rounded-lg px-2.5 sm:px-3 py-2">
                                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                                    The grantee is marked as <strong>deceased</strong>.
                                    {record.date_of_death && <> Date of Death: <strong>{formatDate(record.date_of_death)}</strong></>}
                                  </p>
                                </div>
                                {getClaimantFullName(record) && (
                                  <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                                    <InfoField label="Claimant Name" value={getClaimantFullName(record)} />
                                    <InfoField label="Relationship" value={record.claimant_relationship} />
                                    <InfoField label="Contact Number" value={record.claimant_contact_number} />
                                    <InfoField label="Email" value={record.claimant_email} />
                                    <InfoField label="Address" value={getClaimantAddress(record)} />
                                    <InfoField label="Payment Mode" value={record.claimant_payment_mode} />
                                    <InfoField label="Account Number" value={record.claimant_account_number ? maskAccountNumber(record.claimant_account_number) : null} />
                                    <InfoField label="Bank Name" value={record.claimant_bank_name} />
                                    <InfoField label="Branch Name" value={record.claimant_branch_name} />
                                    <InfoField label="Bank Address" value={record.claimant_bank_address} />
                                    <InfoField label="Joint Account" value={record.claimant_is_joint_account ? 'Yes' : record.claimant_is_joint_account === false ? 'No' : null} />
                                  </div>
                                )}
                              </Section>
                            )}

                            {/* G. Uploaded Documents */}
                            {(() => {
                              const uploadedDocs = DOC_KEYS.filter(key => {
                                const val = (record as any)[key];
                                return val && Array.isArray(val) && val.length > 0;
                              });
                              if (uploadedDocs.length === 0) return null;
                              return (
                                <Section title={`Uploaded Documents (${uploadedDocs.length})`} icon={<Paperclip size={14} className="text-amber-600" />} defaultOpen={false}>
                                  <div className="space-y-3">
                                    {uploadedDocs.map((key) => {
                                      const urls = (record as any)[key] as string[];
                                      return (
                                        <div key={key} className="bg-slate-50/80 rounded-lg sm:rounded-xl border border-slate-100 p-2.5 sm:p-3">
                                          <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 sm:mb-2 leading-tight">
                                            {DOC_LABELS[key] || key}
                                          </p>
                                          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2">
                                            {urls.map((url, idx) => {
                                              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                              const fileName = url.split('/').pop()?.split('?')[0] || `File ${idx + 1}`;
                                              const displayName = fileName.replace(/^\d+-/, '');
                                              return (
                                                <a
                                                  key={idx}
                                                  href={url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-lg hover:border-teal-300 hover:bg-teal-50/50 transition-all group active:scale-[0.98]"
                                                >
                                                  {isImage ? (
                                                    <Image size={13} className="text-teal-500 shrink-0 sm:w-3.5 sm:h-3.5" />
                                                  ) : (
                                                    <FileText size={13} className="text-slate-400 group-hover:text-teal-500 shrink-0 sm:w-3.5 sm:h-3.5" />
                                                  )}
                                                  <span className="text-[11px] sm:text-xs text-slate-600 group-hover:text-teal-700 font-medium truncate flex-1">{displayName}</span>
                                                  <ExternalLink size={11} className="text-slate-300 group-hover:text-teal-500 shrink-0" />
                                                </a>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </Section>
                              );
                            })()}

                            {/* H. Submission Details */}
                            <Section title="Submission Details" icon={<Calendar size={14} className="text-slate-600" />} defaultOpen={false}>
                              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                                <InfoField label="Date Submitted" value={formatDateTime(record.created_at)} />
                                <InfoField label="Place of Submission" value={record.place_of_submission} />
                                <InfoField label="Data Privacy Consent" value={record.data_privacy_consent ? 'Yes' : record.data_privacy_consent === false ? 'No' : null} />
                                <InfoField label="Date Signed" value={record.date_signed ? formatDate(record.date_signed) : null} />
                                <InfoField label="Grantee Signed" value={record.grantee_signed ? 'Yes' : null} />
                              </div>
                            </Section>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Help Note */}
                  <div className="mt-3 sm:mt-4 bg-slate-50 border border-slate-200/80 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-start gap-2">
                    <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                      <strong className="text-slate-600">Need help?</strong> If you have questions about your application status, please visit the OSCA office at the Municipal Hall of Juban, Sorsogon or contact the OSCA hotline.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      {/* Centenarian Form PDF Drawer */}
      <CentenarianFormPDF
        showCentenarianDrawer={showCentenarianDrawer}
        setShowCentenarianDrawer={(val) => {
          setShowCentenarianDrawer(val);
          if (!val) setSelectedRecordForPdf(null);
        }}
        centenarianPdfUrl={null}
        setCentenarianPdfUrl={() => {}}
        centenarianPdfLoading={false}
        senior={selectedRecordForPdf}
      />

      </div>
    </div>
  );
}
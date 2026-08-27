import React, { useState, useEffect } from "react";

import { useSeniorsStore } from "../store/seniorsStore";

import { useAuthStore } from "../store/authStore";

import { useUIStore } from "../store/uiStore";

import { useBarangays } from "../hooks/useBarangays";

import {
  Search,
  MapPin,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Pencil,
  Archive,
  Contact,
  Eye,
  X,
  AlertTriangle,
  Camera,
  RefreshCw,
  ClipboardList,
  Trophy,
  FileDown,
  FileText,
  FileBadge,
  Info,
} from "lucide-react";

import NCSCFormPDF from "../components/NCSC_form_PDF";

import { fillNcscForm } from "../utils/ncscFormFiller";

import CentenarianFormPDF from "../components/Centenarian_form_PDF";

import { fillCentenarianForm } from "../utils/centenarianFormFiller";

import { centenarianService } from "../services/supabaseService";

export default function SeniorsListPage() {
  const { barangays: barangaysData } = useBarangays();

  const {
    seniors,
    sendSMS,
    selectedStatus,
    setSelectedStatus,
    selectedPension,
    setSelectedPension,
    updateSenior,
    deleteSenior,
  } = useSeniorsStore();

  const { currentUser, hasPermission } = useAuthStore();

  const { setCurrentPage } = useUIStore();

  const showToast = useUIStore((state) => state.showToast);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterBarangay, setFilterBarangay] = useState("All");

  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const [showPdfDrawer, setShowPdfDrawer] = useState(false);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const [pdfLoading, setPdfLoading] = useState(false);

  const [pdfSeniorId, setPdfSeniorId] = useState<string>("");

  const [showCentenarianDrawer, setShowCentenarianDrawer] = useState(false);

  const [centenarianPdfUrl, setCentenarianPdfUrl] = useState<string | null>(
    null,
  );

  const [centenarianPdfLoading, setCentenarianPdfLoading] = useState(false);

  const [centenarianSeniorId, setCentenarianSeniorId] = useState<string>("");

  // Pagination states

  const [currentRecordsPage, setCurrentRecordsPage] = useState(1);

  const itemsPerPage = 10;

  // Reset pagination to first page when any filters change

  useEffect(() => {
    setCurrentRecordsPage(1);
  }, [searchTerm, filterBarangay, selectedStatus, selectedPension]);

  // Close action menu on click outside

  useEffect(() => {
    if (!openActionMenu) return;

    const handleClick = () => setOpenActionMenu(null);

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, [openActionMenu]);

  // RBAC permissions checks

  const canRegister = hasPermission("canCreateSenior");

  const isEncoder = currentUser?.role === "Barangay Encoder";

  const defaultBarangay = isEncoder ? currentUser.barangayAssigned : "All";

  // Enforce barangay encoder restriction at search level

  const activeBarangayFilter = isEncoder ? defaultBarangay : filterBarangay;

  const handleOpenNcscPdf = async (e: React.MouseEvent, seniorId: string) => {
    e.stopPropagation();

    const senior = seniors.find((s) => s.id === seniorId);

    if (!senior) return;

    setPdfSeniorId(seniorId);

    setShowPdfDrawer(true);

    setPdfLoading(true);

    try {
      const blob = await fillNcscForm({
        senior,

        interviewerName: currentUser?.fullName,

        interviewDate: new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        interviewPlace: "OSCA Office, Juban, Sorsogon",

        flatten: true,
      });

      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);

      setPdfPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("[PDF Preview]", err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPdf = async (flatten: boolean) => {
    const senior = seniors.find((s) => s.id === pdfSeniorId);

    if (!senior) return;

    try {
      const blob = await fillNcscForm({
        senior,

        interviewerName: currentUser?.fullName,

        interviewDate: new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        interviewPlace: "OSCA Office, Juban, Sorsogon",

        flatten,
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `NCSC_${senior.lastName}_${senior.firstName}_${senior.oscaNumber}.pdf`;

      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[PDF Download]", err);
    }
  };

  // â”€â”€ Centenarian Honoring PDF Preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleOpenCentenarianPdf = async (
    e: React.MouseEvent,
    seniorId: string,
  ) => {
    e.stopPropagation();

    const senior = seniors.find((s) => s.id === seniorId);

    if (!senior) return;

    setCentenarianSeniorId(seniorId);

    setShowCentenarianDrawer(true);

    setCentenarianPdfLoading(true);

    try {
      const centenarianData = await centenarianService.getBySeniorId(seniorId);

      const blob = await fillCentenarianForm({
        senior,

        centenarianApp: centenarianData?.[0] || undefined,

        flatten: true,
      });

      if (centenarianPdfUrl) URL.revokeObjectURL(centenarianPdfUrl);

      setCentenarianPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("[Centenarian PDF Preview]", err);

      showToast(
        "Failed to generate Centenarian Honoring PDF preview.",
        "error",
      );
    } finally {
      setCentenarianPdfLoading(false);
    }
  };

  const handleDownloadCentenarianPdf = async (flatten: boolean) => {
    const senior = seniors.find((s) => s.id === centenarianSeniorId);

    if (!senior) return;

    try {
      const centenarianData =
        await centenarianService.getBySeniorId(centenarianSeniorId);

      const blob = await fillCentenarianForm({
        senior,
        centenarianApp: centenarianData?.[0] || undefined,
        flatten,
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `Centenarian_Honoring_${senior.lastName}_${senior.firstName}_${senior.oscaNumber}.pdf`;

      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[Centenarian PDF Download]", err);

      showToast("Failed to download Centenarian Honoring PDF.", "error");
    }
  };

  // --- FILTERING LOGIC ---

  const filteredSeniors = seniors.filter((senior) => {
    // 1. Search term check (names, OSCA number)

    const matchesSearch =
      `${senior.firstName} ${senior.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      senior.oscaNumber.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Barangay check

    const matchesBarangay =
      activeBarangayFilter === "All" ||
      senior.barangay === activeBarangayFilter;

    // 3. Status check

    const matchesStatus =
      selectedStatus === "All" || senior.status === selectedStatus;

    // 4. Pension check

    const matchesPension =
      selectedPension === "All" ||
      (selectedPension === "Pensioner" && senior.pensionBeneficiary) ||
      (selectedPension === "Non-Pensioner" && !senior.pensionBeneficiary);

    return matchesSearch && matchesBarangay && matchesStatus && matchesPension;
  });

  // Pagination calculations

  const totalPages = Math.ceil(filteredSeniors.length / itemsPerPage);

  const startIndex = (currentRecordsPage - 1) * itemsPerPage;

  const paginatedSeniors = filteredSeniors.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleRowClick = (id: string) => {
    setCurrentPage("SeniorProfile", id);
  };

  // Edit handler - opens wizard steps (Registration page in edit mode)

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    setCurrentPage("Register", id);
  };

  // Archive modal state

  const [archiveModal, setArchiveModal] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });

  // Change Photo modal

  const [photoModal, setPhotoModal] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({ open: false, id: "", name: "" });

  const [newPhoto, setNewPhoto] = useState<string>("");

  // Update Status modal

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    id: string;
    name: string;
    currentStatus: string;
  }>({ open: false, id: "", name: "", currentStatus: "" });

  const [newStatus, setNewStatus] = useState<string>("");

  // Status Timeline Help Modal
  const [showStatusHelp, setShowStatusHelp] = useState(false);

  const handleArchiveClick = (
    e: React.MouseEvent,
    id: string,
    name: string,
  ) => {
    e.stopPropagation();

    setArchiveModal({ open: true, id, name });
  };

  const handleArchiveConfirm = async () => {
    try {
      await updateSenior(archiveModal.id, { status: "Deactivated" });

      showToast(`Successfully archived si ${archiveModal.name}.`, "success");
    } catch {
      showToast("Failed to archive record. Please try again.", "error");
    }

    setArchiveModal({ open: false, id: "", name: "" });
  };

  // ID Card handler - navigate to FindUser page for ID card view

  const handleViewID = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    setCurrentPage("SeniorProfile", id);
  };

  // Change Photo handler

  const handleChangePhoto = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();

    setPhotoModal({ open: true, id, name });

    setNewPhoto("");
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setNewPhoto(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handlePhotoConfirm = async () => {
    if (!newPhoto || !photoModal.id) return;

    try {
      await updateSenior(photoModal.id, { profilePhoto: newPhoto });

      showToast(
        `Successfully updated photo for ${photoModal.name}!`,
        "success",
      );
    } catch {
      showToast("Failed to update photo. Please try again.", "error");
    }

    setPhotoModal({ open: false, id: "", name: "" });

    setNewPhoto("");
  };

  // Update Status handler

  const handleUpdateStatus = (
    e: React.MouseEvent,
    id: string,
    name: string,
    currentStatus: string,
  ) => {
    e.stopPropagation();

    setStatusModal({ open: true, id, name, currentStatus });

    setNewStatus(currentStatus);
  };

  const handleStatusConfirm = async () => {
    if (!statusModal.id || !newStatus) return;

    try {
      await updateSenior(statusModal.id, { status: newStatus });

      // Send SMS notification to the senior
      const senior = seniors.find((s) => s.id === statusModal.id);
      if (senior && senior.contactNumber) {
        const smsMessage = `Hello ${senior.firstName} ${senior.lastName}, this is from OSCA Office. Your status has been updated to "${newStatus}".`;
        await sendSMS(
          `${senior.firstName} ${senior.lastName}`,
          senior.contactNumber,
          senior.barangay,
          smsMessage,
          currentUser?.fullName || 'OSCA System'
        );
      }

      showToast(
        `${statusModal.name}'s status updated to "${newStatus}"!`,
        "success",
      );
    } catch {
      showToast("Failed to update status. Please try again.", "error");
    }

    setStatusModal({ open: false, id: "", name: "", currentStatus: "" });
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans h-fit">
      {/* Controls / Filter Panel Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">
            Senior Citizens Registry
          </h4>

          <p className="text-[11px] text-slate-400">
            Manage, review, filter and search Master List records
          </p>
        </div>

        {canRegister && (
          <button
            onClick={() => setCurrentPage("Register")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white rounded-xl shadow-md shadow-teal-600/10 transition-all duration-150 active:scale-95 cursor-pointer w-full sm:w-auto text-center justify-center"
          >
            <Plus size={14} />

            <span>New Registration</span>
          </button>
        )}
      </div>

      {/* Filter Row Panel */}

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Search Input */}

        <div className="space-y-1.5">
          <label
            htmlFor="search"
            className="text-[10px] font-bold text-slate-500 uppercase tracking-wide"
          >
            Search
          </label>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={14} />
            </span>

            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name or OSCA ID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Barangay Filter Dropdown */}

        <div className="space-y-1.5">
          <label
            htmlFor="barangay"
            className="text-[10px] font-bold text-slate-500 uppercase tracking-wide"
          >
            Barangay
          </label>

          <select
            id="barangay"
            disabled={isEncoder}
            value={isEncoder ? currentUser.barangayAssigned : filterBarangay}
            onChange={(e) => setFilterBarangay(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">All Barangays</option>

            {barangaysData.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status Dropdown */}

        <div className="space-y-1.5">
          <label
            htmlFor="status"
            className="text-[10px] font-bold text-slate-500 uppercase tracking-wide"
          >
            Verification Status
          </label>

          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">All Status</option>

            <option value="Approved">Approved (Active)</option>

            <option value="Pending">Pending Application</option>

            <option value="For Verification">For Verification</option>

            <option value="Rejected">Rejected</option>

            <option value="Deactivated">Deactivated</option>

            <option value="Deceased">Deceased</option>
          </select>
        </div>

        {/* Pension Status Filter */}

        <div className="space-y-1.5">
          <label
            htmlFor="pension"
            className="text-[10px] font-bold text-slate-500 uppercase tracking-wide"
          >
            Pension Program
          </label>

          <select
            id="pension"
            value={selectedPension}
            onChange={(e) => setSelectedPension(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="All">All (Pensioner/Non)</option>

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

            <p className="text-xs font-semibold">
              No Senior Citizen records found.
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Please check the spelling or adjust the filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-4 px-5">Senior Citizen Info</th>

                  <th className="py-4 px-5 hidden sm:table-cell">
                    OSCA Number
                  </th>

                  <th className="py-4 px-5 hidden md:table-cell">
                    Barangay Hall
                  </th>

                  <th className="py-4 px-5 text-center">Age (Age)</th>

                  <th className="py-4 px-5 text-center hidden sm:table-cell">
                    Pension Enrollee
                  </th>

                  <th className="py-4 px-5 text-center">Status</th>

                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedSeniors.map((senior) => (
                  <tr
                    key={senior.id}
                    className="hover:bg-slate-50/50 group transition-all duration-150"
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
                            {senior.firstName.charAt(0)}
                            {senior.lastName.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-800 leading-tight group-hover:text-teal-600 transition-colors">
                            {senior.firstName} {senior.lastName}
                          </h5>

                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {senior.sex} â€¢ Born: {senior.birthdate}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* OSCA Num */}

                    <td className="py-3.5 px-5 font-mono font-bold text-slate-600 hidden sm:table-cell">
                      {senior.oscaNumber}
                    </td>

                    {/* Barangay */}

                    <td className="py-3.5 px-5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={12} className="text-teal-500 shrink-0" />

                        <span className="font-semibold text-[11.5px]">
                          {senior.barangay}
                        </span>
                      </div>
                    </td>

                    {/* Age */}

                    <td className="py-3.5 px-5 text-center font-bold text-slate-700">
                      {senior.age} y/o
                    </td>

                    {/* Pension */}

                    <td className="py-3.5 px-5 text-center hidden sm:table-cell">
                      <span
                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase

                        ${
                          senior.pensionBeneficiary
                            ? "bg-teal-50 text-teal-700 border border-teal-100"
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                        }`}
                      >
                        {senior.pensionBeneficiary
                          ? "Pensioner"
                          : "Non-Pensioner"}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase
                        ${senior.status === "Pending" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse" : ""}
                        ${senior.status === "For Verification" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : ""}
                        ${senior.status === "Approved ID" || senior.status === "Approved Data Form" || senior.status === "Approved Honoring" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : ""}
                        ${senior.status === "Qualified for NSCS" || senior.status === "Qualified for Honoring" ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" : ""}
                        ${senior.status === "NSCS Form Submitted" ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20" : ""}
                        ${senior.status === "Disapproved Honoring" || senior.status === "Disapproved Data Form" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : ""}
                        ${senior.status === "Rejected" || senior.status === "Deceased" || senior.status === "Deactivated" ? "bg-red-500/10 text-red-600 border border-red-500/20" : ""}

                      `}
                      >
                        {senior.status}
                      </span>
                    </td>

                    {/* Actions link indicator */}

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Dossier */}

                        {/* <button

                          type="button"

                          onClick={() => handleRowClick(senior.id)}

                          title="View Dossier (Profile)"

                          className="p-2 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"

                        >

                          <Eye size={18} />

                        </button> */}

                        {/* Edit with Hover Popup */}

                        {hasPermission("canEditSenior") && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenu(
                                  openActionMenu === senior.id
                                    ? null
                                    : senior.id,
                                );
                              }}
                              title="Edit record"
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              <Pencil size={18} />
                            </button>

                            {/* NCSC PDF - visible when Approved ID or later */}

                            {[
                              "Qualified for NSCS",
                              "NSCS Form Submitted",
                              "Approved Data Form",
                              "Qualified for Honoring",
                              "Annex A Form Submitted",
                              "Approved Honoring",
                            ].includes(senior.status) &&
                              senior.status !== "Disapproved Data Form" && (
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleOpenNcscPdf(e, senior.id)
                                  }
                                  title="View NCSC Data Form (PDF)"
                                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <FileText size={18} />
                                </button>
                              )}

                            {/* Honoring Certificate - visible when Approved Honoring */}

                            {[
                              "Qualified for Honoring",
                              "Annex A Form Submitted",
                              "Approved Honoring",
                              "Disapproved Data Form"
                            ].includes(senior.status) &&  senior.status !== "Disapproved Honoring" && (
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleOpenCentenarianPdf(e, senior.id)
                                  }
                                  title="View Honoring Certificate"
                                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <FileBadge size={18} />
                                </button>
                              )}

                            {/* Click popup menu */}

                            {openActionMenu === senior.id && (
                              <div className="absolute right-0 top-full mt-1 transition-all duration-150 z-50">
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-1.5 min-w-[160px] space-y-0.5">
                                  

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      handleUpdateStatus(
                                        e,
                                        senior.id,
                                        `${senior.firstName} ${senior.lastName}`,
                                        senior.status,
                                      );
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer"
                                  >
                                    <RefreshCw size={13} />

                                    <span>Update Status</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      handleEdit(e, senior.id);
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                                  >
                                    <Pencil size={13} />

                                    <span>Edit Record</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      handleChangePhoto(
                                        e,
                                        senior.id,
                                        `${senior.firstName} ${senior.lastName}`,
                                      );
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer"
                                  >
                                    <Camera size={13} />

                                    <span>Change Photo</span>
                                  </button>

                                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ID Card */}

                        {(senior.status != "Pending" ||
                          senior.status != "Rejected" ||
                          senior.status != "Deactivated") && (
                          <button
                            type="button"
                            onClick={(e) => handleViewID(e, senior.id)}
                            title="View Profile/Generate ID Card"
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Contact size={18} />
                          </button>
                        )}

                        {/* Archive */}

                        {(hasPermission("canDeleteSenior") ||
                          hasPermission("canEditSenior")) && (
                          <button
                            type="button"
                            onClick={(e) =>
                              handleArchiveClick(
                                e,
                                senior.id,
                                `${senior.firstName} ${senior.lastName}`,
                              )
                            }
                            title="Archive (deactivate)"
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Archive size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}

        {filteredSeniors.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-slate-100 bg-slate-50/40"
            id="pagination-controls-container"
          >
            <span
              className="text-[11px] font-semibold text-slate-500"
              id="pagination-info"
            >
              Showing{" "}
              <strong className="text-slate-800">{startIndex + 1}</strong> to{" "}
              <strong className="text-slate-800">
                {Math.min(startIndex + itemsPerPage, filteredSeniors.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-800">
                {filteredSeniors.length}
              </strong>{" "}
              records
            </span>

            {totalPages > 1 && (
              <div
                className="flex items-center gap-1.5"
                id="pagination-buttons"
              >
                <button
                  type="button"
                  disabled={currentRecordsPage === 1}
                  onClick={() =>
                    setCurrentRecordsPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors cursor-pointer"
                  id="prev-page-btn"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    if (
                      totalPages > 5 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      Math.abs(pageNum - currentRecordsPage) > 1
                    ) {
                      if (pageNum === 2 && currentRecordsPage > 3) {
                        return (
                          <span
                            key="dots-1"
                            className="px-1 text-slate-400 text-xs"
                          >
                            ...
                          </span>
                        );
                      }

                      if (
                        pageNum === totalPages - 1 &&
                        currentRecordsPage < totalPages - 2
                      ) {
                        return (
                          <span
                            key="dots-2"
                            className="px-1 text-slate-400 text-xs"
                          >
                            ...
                          </span>
                        );
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
                            ? "bg-teal-600 text-white shadow-sm shadow-teal-600/10"
                            : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                        id={`page-btn-${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}

                <button
                  type="button"
                  disabled={currentRecordsPage === totalPages}
                  onClick={() =>
                    setCurrentRecordsPage((prev) =>
                      Math.min(prev + 1, totalPages),
                    )
                  }
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

      {/* ====== Archive Confirmation Modal (Animated) ====== */}

      {archiveModal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={() => setArchiveModal({ open: false, id: "", name: "" })}
          ></div>

          {/* Modal Card */}

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-[scaleIn_250ms_ease-out]">
            {/* Close button */}

            <button
              onClick={() => setArchiveModal({ open: false, id: "", name: "" })}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Icon */}

            <div className="w-14 h-14 mx-auto bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-amber-500" />
            </div>

            {/* Content */}

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-lg text-slate-800">
                Archive this Record?
              </h3>

              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">
                  {archiveModal.name}
                </span>{" "}
                will be deactivated and will no longer appear in the active
                records list.
              </p>
            </div>

            {/* Actions */}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setArchiveModal({ open: false, id: "", name: "" })
                }
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleArchiveConfirm}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Change Photo Modal ====== */}

      {photoModal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={() => setPhotoModal({ open: false, id: "", name: "" })}
          ></div>

          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-[scaleIn_250ms_ease-out]">
            <button
              onClick={() => setPhotoModal({ open: false, id: "", name: "" })}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 mx-auto bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-center justify-center">
              <Camera size={24} className="text-teal-500" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Change Photo
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose a new profile photo for{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {photoModal.name}
                </span>
              </p>
            </div>

            {newPhoto && (
              <div className="flex justify-center">
                <img
                  src={newPhoto}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-teal-200"
                />
              </div>
            )}

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-teal-50 file:text-teal-700 file:font-bold file:cursor-pointer hover:file:bg-teal-100 cursor-pointer"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPhotoModal({ open: false, id: "", name: "" })}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handlePhotoConfirm}
                disabled={!newPhoto}
                className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Update Status Modal ====== */}

      {statusModal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={() =>
              setStatusModal({
                open: false,
                id: "",
                name: "",
                currentStatus: "",
              })
            }
          ></div>

          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-[scaleIn_250ms_ease-out]">
            <button
              onClick={() =>
                setStatusModal({
                  open: false,
                  id: "",
                  name: "",
                  currentStatus: "",
                })
              }
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 mx-auto bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-center">
              <RefreshCw size={24} className="text-amber-500" />
            </div>

            <div className="text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  Update Status
                </h3>
                <button
                  onClick={() => setShowStatusHelp(true)}
                  className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all cursor-pointer"
                  title="View status process timeline"
                >
                  <Info size={16} />
                </button>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select a new status for{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {statusModal.name}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              {/* Main Flow Options */}
              {[
                { label: "Approved ID", enabled: statusModal.currentStatus === "For Verification", color: "emerald" },
                { label: "Qualified for NSCS", enabled: statusModal.currentStatus === "Approved ID", color: "purple" },
                { label: "NSCS Form Submitted", enabled: statusModal.currentStatus === "Qualified for NSCS", color: "indigo" },
                { label: "Approved Data Form", enabled: statusModal.currentStatus === "NSCS Form Submitted", color: "emerald" },
                { label: "Disapproved Data Form", enabled: statusModal.currentStatus === "NSCS Form Submitted", color: "amber" },
                { label: "Qualified for Honoring", enabled: statusModal.currentStatus === "Approved Data Form", color: "purple" },
                { label: "Approved Honoring", enabled: statusModal.currentStatus === "Qualified for Honoring", color: "emerald" },
                { label: "Disapproved Honoring", enabled: statusModal.currentStatus === "Qualified for Honoring", color: "amber" },
              ]
                .filter((opt) => opt.enabled)
                .map((opt) => {
                  const baseColors: Record<string, string> = {
                    emerald: "bg-emerald-500 hover:bg-emerald-600 text-white",
                    purple: "bg-purple-500 hover:bg-purple-600 text-white",
                    indigo: "bg-indigo-500 hover:bg-indigo-600 text-white",
                    amber: "bg-amber-500 hover:bg-amber-600 text-white",
                  };
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setNewStatus(opt.label)}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${baseColors[opt.color]} ${
                        newStatus === opt.label
                          ? "ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-[1.02] cursor-pointer"
                          : "cursor-pointer"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}

              {/* Divider - For Verification */}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-blue-200 dark:bg-blue-800"></div>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Verification</span>
                <div className="flex-1 h-px bg-blue-200 dark:bg-blue-800"></div>
              </div>
              <button
                onClick={() => setNewStatus("For Verification")}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all bg-blue-500 hover:bg-blue-600 text-white ${
                  newStatus === "For Verification"
                    ? "ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-[1.02] cursor-pointer"
                    : "cursor-pointer"
                }`}
              >
                For Verification
              </button>

              {/* Divider - Rejected */}
              {(statusModal.currentStatus === "Pending" || statusModal.currentStatus === "For Verification") && (
                <>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 h-px bg-red-200 dark:bg-red-800"></div>
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Rejection</span>
                    <div className="flex-1 h-px bg-red-200 dark:bg-red-800"></div>
                  </div>
                  <button
                    onClick={() => setNewStatus("Rejected")}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border-2 border-red-500 ${
                      newStatus === "Rejected"
                        ? "bg-red-500 text-white scale-[1.02] cursor-pointer"
                        : "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                    }`}
                  >
                    Rejected
                  </button>
                </>
              )}

              {/* Divider - Deactivated & Deceased */}
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600"></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Others</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600"></div>
              </div>
              <button
                onClick={() => setNewStatus("Deactivated")}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border-2 border-red-500 ${
                  newStatus === "Deactivated"
                    ? "bg-red-500 text-white scale-[1.02] cursor-pointer"
                    : "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                }`}
              >
                Deactivated
              </button>
              <button
                onClick={() => setNewStatus("Deceased")}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border-2 border-red-500 ${
                  newStatus === "Deceased"
                    ? "bg-red-500 text-white scale-[1.02] cursor-pointer"
                    : "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                }`}
              >
                Deceased
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setStatusModal({
                    open: false,
                    id: "",
                    name: "",
                    currentStatus: "",
                  })
                }
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleStatusConfirm}
                disabled={newStatus === statusModal.currentStatus}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== Status Timeline Help Modal ====== */}
      {showStatusHelp && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
            onClick={() => setShowStatusHelp(false)}
          ></div>

          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-[scaleIn_250ms_ease-out] max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowStatusHelp(false)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                Status Process Timeline
              </h3>
              <p className="text-xs text-slate-400">
                The status flow for each senior citizen record
              </p>
            </div>

            <div className="relative pl-6 space-y-0">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-400 via-teal-400 to-amber-400 rounded-full"></div>

              {[
                {
                  status: "Pending",
                  desc: "New registration, awaiting review",
                  color: "bg-amber-400",
                },
                {
                  status: "For Verification",
                  desc: "Submitted documents are being verified",
                  color: "bg-blue-400",
                },
                {
                  status: "Approved ID",
                  desc: "ID has been approved, ready to generate",
                  color: "bg-teal-400",
                },
                {
                  status: "Qualified for NSCS",
                  desc: "Qualified for NSCS application",
                  color: "bg-teal-500",
                },
                {
                  status: "NSCS Form Submitted",
                  desc: "NSCS form has been submitted to DSWD",
                  color: "bg-emerald-400",
                },
                {
                  status: "Approved Data Form",
                  desc: "Data form approved by DSWD",
                  color: "bg-emerald-500",
                  branch: true,
                },
                {
                  status: "Disapproved Data Form",
                  desc: "Data form disapproved by DSWD",
                  color: "bg-red-400",
                  isBranch: true,
                },
                {
                  status: "Qualified for Honoring",
                  desc: "Qualified for centenarian honoring ceremony",
                  color: "bg-purple-400",
                  branch: true,
                },
                {
                  status: "Approved Honoring",
                  desc: "Honoring application approved",
                  color: "bg-purple-500",
                  isBranch: true,
                },
                {
                  status: "Disapproved Honoring",
                  desc: "Honoring application disapproved",
                  color: "bg-red-400",
                  isBranch: true,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`relative flex items-start gap-3 pb-4 ${item.isBranch ? "ml-4" : ""}`}
                >
                  <div
                    className={`absolute left-[-13px] ${item.isBranch ? "left-[-25px]" : ""} top-1 w-3 h-3 rounded-full ${item.color} border-2 border-white shadow-sm`}
                  ></div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {item.status}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}

              {/* Separator */}
              <div className="border-t border-dashed border-slate-200 dark:border-slate-600 my-3"></div>

              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2 pl-1">
                At Any Time
              </p>
              {[
                {
                  status: "Rejected",
                  desc: "Rejected from Pending or For Verification stage",
                  color: "bg-red-500",
                },
                {
                  status: "Deactivated",
                  desc: "Record has been archived / deactivated",
                  color: "bg-slate-400",
                },
                {
                  status: "Deceased",
                  desc: "Marked as deceased",
                  color: "bg-gray-600",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-3 pb-4">
                  <div
                    className={`absolute left-[-13px] top-1 w-3 h-3 rounded-full ${item.color} border-2 border-white shadow-sm`}
                  ></div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {item.status}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowStatusHelp(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <NCSCFormPDF
        showPdfDrawer={showPdfDrawer}
        setShowPdfDrawer={setShowPdfDrawer}
        pdfPreviewUrl={pdfPreviewUrl}
        setPdfPreviewUrl={setPdfPreviewUrl}
        pdfLoading={pdfLoading}
        handleDownloadPdf={handleDownloadPdf}
        senior={seniors.find((s) => s.id === pdfSeniorId) || null}
      />

      <CentenarianFormPDF
        showCentenarianDrawer={showCentenarianDrawer}
        setShowCentenarianDrawer={setShowCentenarianDrawer}
        centenarianPdfUrl={centenarianPdfUrl}
        setCentenarianPdfUrl={setCentenarianPdfUrl}
        centenarianPdfLoading={centenarianPdfLoading}
        handleDownloadCentenarianPdf={handleDownloadCentenarianPdf}
        senior={seniors.find((s) => s.id === centenarianSeniorId) || null}
      />
    </div>
  );
}

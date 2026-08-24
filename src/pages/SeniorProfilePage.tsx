import React, { useState, useEffect } from "react";

import { useSeniorsStore } from "../store/seniorsStore";

import { useUIStore } from "../store/uiStore";

import { useAuthStore } from "../store/authStore";

import {
  ncscDataFormService,
  centenarianService,
} from "../services/supabaseService";

import IDCardPreview from "../components/id-generation/IDCardPreview";

import IDCardFlipInline from "../components/id-generation/IDCardFlipInline";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import L from "leaflet";

import {
  ChevronLeft,
  MapPin,
  CreditCard,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  Check,
  X,
  Skull,
  Calendar,
  FileText,
  Award,
  FileDown,
  Loader2,
} from "lucide-react";

import { fillNcscForm } from "../utils/ncscFormFiller";

import { fillCentenarianForm } from "../utils/centenarianFormFiller";

import { AnimatePresence, motion } from "motion/react";

import NCSCFormPDF from "../components/NCSC_form_PDF";

import CentenarianFormPDF from "../components/Centenarian_form_PDF";

// Custom Map pin icon matching our AddressMapPicker style

// Custom Map pin icon matching our AddressMapPicker style, colored by risk severity if at risk

const getProfileMarkerIcon = (inRiskArea?: string, riskSeverity?: string) => {
  let color = "bg-teal-600";

  let badgeColor = "bg-teal-600";

  if (inRiskArea === "yes") {
    if (riskSeverity === "critical") {
      color = "bg-red-600";

      badgeColor = "bg-red-600";
    } else if (riskSeverity === "high") {
      color = "bg-orange-500";

      badgeColor = "bg-orange-500";
    } else if (riskSeverity === "medium") {
      color = "bg-amber-500";

      badgeColor = "bg-amber-500";
    } else if (riskSeverity === "low") {
      color = "bg-blue-500";

      badgeColor = "bg-blue-500";
    }
  }

  return L.divIcon({
    className: "custom-div-icon",

    html: `



      <div class="flex flex-col items-center select-none transform -translate-y-8 -translate-x-1/2">



        <div class="w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center shadow-lg relative animate-bounce">



          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>



          <span class="absolute -bottom-1 w-2 h-2 ${badgeColor} rotate-45"></span>



        </div>



        <div class="w-2.5 h-1 bg-slate-900/30 blur-[1px] rounded-full mt-0.5"></div>



      </div>



    `,

    iconSize: [32, 42],

    iconAnchor: [0, 0],
  });
};

export default function SeniorProfilePage() {
  const { seniors, approveSenior, rejectSenior, updateSenior } =
    useSeniorsStore();

  const { selectedSeniorId, setCurrentPage, showToast } = useUIStore();

  const { currentUser, hasPermission } = useAuthStore();

  const [selectedVariant, setSelectedVariant] = useState<
    "variant1" | "variant2"
  >("variant1");

  const [showDeceasedForm, setShowDeceasedForm] = useState(false);

  const [deceasedDate, setDeceasedDate] = useState("");

  const [deceasedCause, setDeceasedCause] = useState("");

  const [ncscData, setNcscData] = useState<any>(null);

  const [centenarianData, setCentenarianData] = useState<any[]>([]);

  const [showPdfDrawer, setShowPdfDrawer] = useState(false);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const [pdfLoading, setPdfLoading] = useState(false);

  const [showCentenarianDrawer, setShowCentenarianDrawer] = useState(false);

  const [centenarianPdfUrl, setCentenarianPdfUrl] = useState<string | null>(
    null,
  );

  const [centenarianPdfLoading, setCentenarianPdfLoading] = useState(false);

  const senior = seniors.find((s) => s.id === selectedSeniorId);

  const canApprove = hasPermission("canApproveReject");

  // Fetch NCSC Data and Centenarian Honoring records for this senior

  useEffect(() => {
    if (!selectedSeniorId) return;

    ncscDataFormService

      .getBySeniorId(selectedSeniorId)

      .then((data) => {
        setNcscData(data);
      })

      .catch(() => setNcscData(null));

    centenarianService

      .getBySeniorId(selectedSeniorId)

      .then((data) => {
        setCentenarianData(data || []);
      })

      .catch(() => setCentenarianData([]));
  }, [selectedSeniorId]);

  // Auto-generate PDF preview when status qualifies
  useEffect(() => {
    if (!senior) return;
    if (
      [
        "Approved ID",
        "Approved Data Form",
        "Approved Honoring",
        "Disapproved Honoring",
        "Annex A Form Submitted",
        "NSCS Form Submitted",
        'Qualified for NSCS',
        'Qualified for Honoring'
      ].includes(senior.status) &&
      !pdfPreviewUrl &&
      !pdfLoading
    ) {
      generateInlinePdfPreview();
    }
  }, [senior?.status]);

  // Auto-generate Centenarian Honoring PDF preview when status qualifies
  useEffect(() => {
    if (!senior) return;
    if (
      [
        "Approved ID",
        "NSCS Form Submitted",
        "Annex A Form Submitted",
        "Approved Data Form",
        "Approved Honoring",
        "Disapproved Honoring",
      ].includes(senior.status) &&
      !centenarianPdfUrl &&
      !centenarianPdfLoading
    ) {
      generateCentenarianPdfPreview();
    }
  }, [senior?.status, centenarianData]);

  if (!senior) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-white border border-slate-200 rounded-3xl">
        <ShieldAlert size={48} className="text-slate-300 stroke-[1.5] mb-3" />

        <p className="text-xs font-semibold">
          Error: Senior Citizen record not found.
        </p>

        <button
          onClick={() => setCurrentPage("SeniorsList")}
          className="mt-4 px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl"
        >
          Back to List
        </button>
      </div>
    );
  }

  const handleApprove = async () => {
    if (!currentUser) return;

    await approveSenior(senior.id, currentUser.fullName);

    showToast(`Successfully approved si ${senior.firstName}!`, "success");
  };

  const handleReject = () => {
    if (!currentUser) return;

    const reason = prompt(
      `Notice: Enter the reason for rejecting ${senior.firstName}:`,

      "Insufficient proof or documentation",
    );

    if (reason === null) return; // cancelled

    rejectSenior(
      senior.id,

      reason || "Insufficient documentation",

      currentUser.fullName,
    );

    showToast(`Application rejected for ${senior.firstName}.`, "warning");
  };

  // Generate PDF blob and set preview URL (no drawer)
  const generateInlinePdfPreview = async () => {
    if (!senior) return;
    if (pdfPreviewUrl || pdfLoading) return; // already generated or in progress

    setPdfLoading(true);

    try {
      // Build formData from senior's stored fields (Steps III-VI)

      const builtFormData = {
        ...ncscData,

        existingIllnesses: senior.medicalConcerns || [],

        medications: (senior.medicines || []).map((m: any) =>
          typeof m === "string" ? m : m.name || "",
        ),

        livingArrangement: senior.livingWith?.join(", ") || "",

        estimatedMonthlyIncome: senior.monthlyIncomeRange || "",

        receivingPension:
          !!senior.monthlyPension && senior.monthlyPension !== "None",

        ownsProperty: (senior.realProperties?.length || 0) > 0,

        primaryNeeds: senior.problemsNeeds || [],

        lastCheckupDate: senior.scheduledCheckup === "yes" ? "Yes" : "",

        hasPhilHealth: !!senior.philHealth,
      };

      const blob = await fillNcscForm({
        senior,

        formData: builtFormData,

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

      const url = URL.createObjectURL(blob);

      setPdfPreviewUrl(url);
    } catch (e) {
      console.error("[PDF Preview] Error:", e);

      showToast("Failed to generate NCSC PDF preview.", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  // Open drawer + generate PDF
  const handleOpenPdfPreview = async () => {
    setShowPdfDrawer(true);
    await generateInlinePdfPreview();
  };

  const handleDownloadPdf = async (flatten: boolean) => {
    if (!senior) return;

    try {
      // Build formData from senior's stored fields (Steps III-VI)

      const builtFormData = {
        ...ncscData,

        existingIllnesses: senior.medicalConcerns || [],

        medications: (senior.medicines || []).map((m: any) =>
          typeof m === "string" ? m : m.name || "",
        ),

        livingArrangement: senior.livingWith?.join(", ") || "",

        estimatedMonthlyIncome: senior.monthlyIncomeRange || "",

        receivingPension:
          !!senior.monthlyPension && senior.monthlyPension !== "None",

        ownsProperty: (senior.realProperties?.length || 0) > 0,

        primaryNeeds: senior.problemsNeeds || [],

        lastCheckupDate: senior.scheduledCheckup === "yes" ? "Yes" : "",

        hasPhilHealth: !!senior.philHealth,
      };

      const blob = await fillNcscForm({
        senior,

        formData: builtFormData,

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

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      showToast("PDF downloaded successfully!", "success");
    } catch (e) {
      console.error("[PDF Download] Error:", e);

      showToast("Failed to generate PDF.", "error");
    }
  };

  // ── Centenarian Honoring PDF Preview & Download ──────────────
  const generateCentenarianPdfPreview = async () => {
    if (!senior) return;
    if (centenarianPdfUrl || centenarianPdfLoading) return;

    setCentenarianPdfLoading(true);

    try {
      const blob = await fillCentenarianForm({
        senior,
        centenarianApp: centenarianData?.[0] || undefined,
        flatten: true,
      });

      if (centenarianPdfUrl) URL.revokeObjectURL(centenarianPdfUrl);

      const url = URL.createObjectURL(blob);
      setCentenarianPdfUrl(url);
    } catch (e) {
      console.error("[Centenarian PDF Preview] Error:", e);
      showToast(
        "Failed to generate Centenarian Honoring PDF preview.",
        "error",
      );
    } finally {
      setCentenarianPdfLoading(false);
    }
  };

  // Open centenarian drawer + generate PDF
  const handleOpenCentenarianPreview = async () => {
    setShowCentenarianDrawer(true);
    await generateCentenarianPdfPreview();
  };

  const handleDownloadCentenarianPdf = async (flatten: boolean) => {
    if (!senior) return;

    try {
      const blob = await fillCentenarianForm({
        senior,
        centenarianApp: centenarianData?.[0] || undefined,
        flatten,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Centenarian_Honoring_${senior.lastName}_${senior.firstName}_${senior.oscaNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Centenarian Honoring PDF downloaded successfully!", "success");
    } catch (e) {
      console.error("[Centenarian PDF Download] Error:", e);
      showToast("Failed to generate Centenarian PDF.", "error");
    }
  };

  const isPending =
    senior.status === "Pending";

  return (
    <div className="space-y-6 animate-fadeIn font-sans w-full max-w-full overflow-hidden">
      {/* Back controls row */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setCurrentPage("SeniorsList")}
            className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-150 active:scale-95 flex-1 sm:flex-none"
          >
            <ChevronLeft size={14} />

            <span>Back to List</span>
          </button>
        </div>

        {/* Verification quick bar for Officers */}

        {isPending && canApprove && (
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-mono mr-2 hidden min-[400px]:inline">
              MSWDO Action Desk:
            </span>

            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <X size={13} className="stroke-[3]" />

              <span>Reject</span>
            </button>

            <button
              onClick={handleApprove}
              className="flex-1 sm:flex-none px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/10 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check size={13} className="stroke-[3]" />

              <span>Approve for verification</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Info Sheets */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-full overflow-hidden">
        {/* LEFT COLUMN: Personal Card & Geotag Map */}

        <div className="lg:col-span-1 space-y-6">
          {/* Visual card summary */}

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center text-center relative overflow-hidden w-full max-w-full">
            {/* Status Floating Badge */}

            <span
              className={`absolute top-4 right-4 text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border



              ${senior.status === "Approved" ? "bg-teal-50 border-teal-200 text-teal-600" : ""}



              ${senior.status === "Pending" ? "bg-amber-50 border-amber-200 text-amber-600 animate-pulse" : ""}



              ${senior.status === "For Verification" ? "bg-blue-50 border-blue-200 text-blue-600" : ""}



              ${senior.status === "Rejected" ? "bg-red-50 border-red-200 text-red-600" : ""}



              ${senior.status === "Deactivated" ? "bg-slate-50 border-slate-200 text-slate-500" : ""}

              ${senior.status === "Deceased" ? "bg-gray-100 border-gray-300 text-gray-700" : ""}



            `}
            >
              {senior.status}
            </span>

            {senior.profilePhoto ? (
              <img
                referrerPolicy="no-referrer"
                src={senior.profilePhoto}
                alt={senior.firstName}
                className="w-24 h-24 rounded-full object-cover border-2 border-teal-500 shadow-md mb-4 shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl border border-teal-100 shadow-inner mb-4 shrink-0">
                {senior.firstName.charAt(0)}

                {senior.lastName.charAt(0)}
              </div>
            )}

            <h3 className="font-extrabold text-slate-800 text-base leading-tight uppercase">
              {senior.firstName} {senior.lastName}
            </h3>

            <p className="text-[10px] text-slate-400 font-mono font-bold mt-1 tracking-wider uppercase">
              {senior.oscaNumber}
            </p>

            <div className="w-full h-px bg-slate-100 my-4"></div>

            <div className="w-full text-left space-y-2.5 text-[11px] font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Sex:</span>

                <span className="text-slate-800 font-bold uppercase">
                  {senior.sex}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Age:</span>

                <span className="text-slate-800 font-bold">
                  {senior.age} y/o
                </span>
              </div>

              <div className="flex justify-between">
                <span>Birthday:</span>

                <span className="text-slate-800 font-bold">
                  {senior.birthdate}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Program Status:</span>

                <span
                  className={`font-bold ${senior.pensionBeneficiary ? "text-teal-600 font-mono" : "text-slate-700"}`}
                >
                  {senior.pensionBeneficiary ? "SocPen Pensioner" : "No Grant"}
                </span>
              </div>
            </div>

            {/* Disaster Risk Warning Banner */}

            {senior.inRiskArea === "yes" && (
              <div
                className={`mt-4 w-full p-3 rounded-2xl border flex items-start gap-2.5 text-left text-[10px] leading-relaxed animate-fadeIn



                ${senior.riskSeverity === "critical" ? "bg-red-50 border-red-200 text-red-800" : ""}



                ${senior.riskSeverity === "high" ? "bg-orange-50 border-orange-200 text-orange-800" : ""}



                ${senior.riskSeverity === "medium" ? "bg-amber-50 border-amber-200 text-amber-800" : ""}



                ${senior.riskSeverity === "low" ? "bg-blue-50 border-blue-200 text-blue-800" : ""}



              `}
              >
                <ShieldAlert
                  className={`mt-0.5 shrink-0



                  ${senior.riskSeverity === "critical" ? "text-red-500" : ""}



                  ${senior.riskSeverity === "high" ? "text-orange-500" : ""}



                  ${senior.riskSeverity === "medium" ? "text-amber-500" : ""}



                  ${senior.riskSeverity === "low" ? "text-blue-500" : ""}



                `}
                  size={15}
                />

                <div>
                  <p className="font-extrabold uppercase tracking-wide">
                    Disaster Risk Area
                  </p>

                  <p className="mt-0.5 font-semibold">
                    This resident lives in a{" "}
                    <span className="font-bold uppercase tracking-wider">
                      {senior.riskSeverity} risk area
                    </span>{" "}
                    frequently affected by{" "}
                    <span className="font-bold uppercase">
                      {senior.riskType === "Others"
                        ? senior.riskDetails || "Others"
                        : senior.riskType}
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Deceased / Vital Status Section */}

            {senior.isDeceased ? (
              <div className="mt-4 w-full p-3 rounded-2xl border bg-slate-100 border-slate-300 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Skull size={14} className="text-slate-600" />

                  <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">
                    Deceased
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 space-y-0.5 pl-5">
                  {senior.dateOfDeath && (
                    <p>
                      Date of Death:{" "}
                      <strong className="text-slate-700">
                        {senior.dateOfDeath}
                      </strong>
                    </p>
                  )}

                  {senior.causeOfDeath && (
                    <p>
                      Cause:{" "}
                      <strong className="text-slate-700">
                        {senior.causeOfDeath}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 w-full">
                {!showDeceasedForm ? (
                  <button
                    onClick={() => setShowDeceasedForm(true)}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Skull size={11} />
                    Mark as Deceased
                  </button>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Skull size={13} className="text-slate-600" />

                      <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">
                        Record Death
                      </span>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">
                        Date of Death
                      </label>

                      <input
                        type="date"
                        value={deceasedDate}
                        onChange={(e) => setDeceasedDate(e.target.value)}
                        className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">
                        Cause of Death
                      </label>

                      <input
                        type="text"
                        value={deceasedCause}
                        onChange={(e) => setDeceasedCause(e.target.value)}
                        placeholder="e.g. Natural causes, Heart attack, etc."
                        className="w-full mt-0.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeceasedForm(false)}
                        className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold text-[10px] rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={() => {
                          if (!deceasedDate) {
                            showToast("Date of death is required.", "warning");

                            return;
                          }

                          updateSenior(senior.id, {
                            isDeceased: true,

                            dateOfDeath: deceasedDate,

                            causeOfDeath: deceasedCause || undefined,
                          } as any);

                          showToast(
                            `Si ${senior.firstName} ${senior.lastName} has been recorded as deceased.`,

                            "info",
                          );

                          setShowDeceasedForm(false);
                        }}
                        className="flex-1 py-1.5 bg-slate-700 text-white font-bold text-[10px] rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Residence geotag summary */}

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-72 w-full max-w-full overflow-hidden">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-150 mb-3 text-slate-700 font-sans">
              <MapPin size={15} className="text-teal-600" />

              <span className="font-bold text-xs uppercase tracking-wide">
                Residence Geotag Point
              </span>
            </div>

            {/* Embedded Leaflet map container */}

            <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <MapContainer
                center={[senior.coordinates.lat, senior.coordinates.lng]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[senior.coordinates.lat, senior.coordinates.lng]}
                  icon={getProfileMarkerIcon(
                    senior.inRiskArea,

                    senior.riskSeverity,
                  )}
                >
                  <Popup>
                    <div className="text-[10px] font-sans text-slate-800">
                      <p className="font-bold uppercase leading-none">
                        {senior.firstName} {senior.lastName}
                      </p>

                      <p className="text-slate-500 mt-1">{senior.barangay}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* ID Card Flip Preview */}

          <IDCardFlipInline senior={senior} selectedVariant={selectedVariant} />
        </div>

        {/* RIGHT COLUMN: Interactive Double Sided Smart ID Card and full census details */}

        <div className="lg:col-span-2 space-y-6">
          {/* OSCA ID Card Preview widget */}

          <IDCardPreview
            senior={senior}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />

          {/* Extended demographic details block */}

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm w-full max-w-full overflow-hidden">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wide">
                Census Sheet Review
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] font-medium text-slate-600 leading-normal">
              <div className="space-y-3.5">
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                    Street Address
                  </span>

                  <p className="text-slate-800 font-bold uppercase text-[11.5px]">
                    {senior.address}, Brgy. {senior.barangay}, Juban, Sorsogon
                  </p>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                    Civil Status
                  </span>

                  <p className="text-slate-800 font-bold uppercase">
                    {senior.civilStatus}
                  </p>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                    Place of Birth
                  </span>

                  <p className="text-slate-800 font-bold uppercase">
                    {senior.remarks || "Juban, Sorsogon"}
                  </p>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                    In Risk Area?
                  </span>

                  <p
                    className={`font-bold uppercase ${senior.inRiskArea === "yes" ? "text-red-600 font-mono" : "text-slate-800"}`}
                  >
                    {senior.inRiskArea === "yes" ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                    Mobile Number (Contact)
                  </span>

                  <p className="text-slate-800 font-bold font-mono text-[11.5px]">
                    {senior.contactNumber || "NO CONTACT ON FILE"}
                  </p>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                    Date of Registration
                  </span>

                  <p className="text-slate-800 font-bold font-mono">
                    {senior.registeredDate}
                  </p>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                    Biometrics Enrolled Template ID
                  </span>

                  <p className="text-slate-800 font-bold font-mono text-[10px] truncate max-w-full">
                    {senior.thumbprintData || "NO BIOMETRICS ON FILE"}
                  </p>
                </div>

                {senior.inRiskArea === "yes" && (
                  <div>
                    <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                      Risk Type & Severity
                    </span>

                    <p className="text-slate-800 font-bold uppercase">
                      {senior.riskType === "Others"
                        ? senior.riskDetails || "Others"
                        : senior.riskType}{" "}
                      ({senior.riskSeverity})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: NCSC Data + Centenarian Honoring */}
        <div
          className="w-full grid grid-cols-2 col-span-3 md:grid-cols-2 gap-4"
          style={{ height: "90vh" }}
        >
          {/* NCSC Data Section */}

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm w-full overflow-y-auto flex flex-col">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />

              <h4 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wide">
                NCSC Data
              </h4>
            </div>

            {(senior?.status === "Approved ID" ||
            senior?.status === "NSCS Form Submitted" ||
            senior?.status === "Annex A Form Submitted" ||
            senior?.status === "Approved Data Form" ||
            senior?.status === "Approved Honoring" ||
            senior?.status === "Qualified for NSCS" ||
            senior?.status === "Qualified for Honoring" ||
            senior?.status === "Disapproved Honoring") ? (
              <div className="space-y-3 h-full">
                {pdfPreviewUrl ? (
                  <iframe
                    src={`${pdfPreviewUrl}${senior?.status === "Approved ID" ||
                        senior?.status === "For Verification"
                        ? "#toolbar=0&navpanes=0"
                        : ""
                    }`}
                    className="w-full flex-1 h-full rounded-xl border border-slate-200"
                    title="NCSC Data Form Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2
                      size={28}
                      className="text-indigo-500 animate-spin"
                    />
                    <p className="text-xs font-bold text-slate-500">
                      Generating NCSC PDF Preview...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                No NCSC Data record for this senior.
              </p>
            )}
          </div>

          {/* Centenarian Honoring Section */}

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm w-full overflow-y-auto flex flex-col">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-amber-600" />

                <h4 className="font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wide">
                  Centenarian Honoring
                </h4>
              </div>

              {centenarianData.length > 0 && (
                <button
                  onClick={handleOpenCentenarianPreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  <FileText size={12} />
                  Preview PDF
                </button>
              )}
            </div>

            {(senior?.status === "Qualified for Honoring" ||
            senior?.status === "Annex A Form Submitted" ||
            senior?.status === "Approved Honoring") ? (
              <div className="space-y-3 h-full">
                {centenarianPdfUrl ? (
                  <iframe
                    src={`${centenarianPdfUrl}${senior?.status === "Approved ID" ||
                        senior?.status === "For Verification" ||
                        senior?.status === "NSCS Form Submitted"
                        ? "#toolbar=0&navpanes=0"
                        : ""
                    }`}
                    className="w-full flex-1 h-full rounded-xl border border-slate-200"
                    title="Centenarian Honoring PDF Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2
                      size={28}
                      className="text-amber-500 animate-spin"
                    />
                    <p className="text-xs font-bold text-slate-500">
                      Generating Centenarian Honoring PDF Preview...
                    </p>
                  </div>
                )}
              </div>
            ) : centenarianData.length > 0 ? (
              <div className="space-y-4 h-full">
                {centenarianData.map((app, idx) => (
                  <div
                    key={app.id || idx}
                    className="border border-slate-100 rounded-xl p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] font-medium text-slate-600 leading-normal">
                      <div className="space-y-3.5">
                        <div>
                          <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                            Milestone Type
                          </span>

                          <p className="text-slate-800 font-bold uppercase">
                            {app.milestoneType}
                          </p>
                        </div>

                        <div>
                          <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                            Milestone Age
                          </span>

                          <p className="text-slate-800 font-bold">
                            {app.milestoneAge} years old
                          </p>
                        </div>

                        <div>
                          <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                            Cash Gift Amount
                          </span>

                          <p className="text-slate-800 font-bold font-mono">
                            ₱{app.cashGiftAmount?.toLocaleString() || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                            Application Date
                          </span>

                          <p className="text-slate-800 font-bold">
                            {app.applicationDate || "—"}
                          </p>
                        </div>

                        <div>
                          <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                            Applicant Type
                          </span>

                          <p className="text-slate-800 font-bold uppercase">
                            {app.applicantType}
                          </p>
                        </div>

                        <div>
                          <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block">
                            Status
                          </span>

                          <p
                            className={`font-bold font-mono uppercase text-[10px] ${
                              app.status === "Claimed"
                                ? "text-teal-600"
                                : app.status === "Approved"
                                  ? "text-blue-600"
                                  : app.status === "Pending"
                                    ? "text-amber-600"
                                    : app.status === "Expired"
                                      ? "text-red-600"
                                      : "text-slate-600"
                            }`}
                          >
                            {app.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                No Centenarian Honoring record for this senior.
              </p>
            )}
          </div>
        </div>
        {/* end 2-column grid */}
      </div>

      <NCSCFormPDF
        showPdfDrawer={showPdfDrawer}
        setShowPdfDrawer={setShowPdfDrawer}
        pdfPreviewUrl={pdfPreviewUrl}
        setPdfPreviewUrl={setPdfPreviewUrl}
        pdfLoading={pdfLoading}
        handleDownloadPdf={handleDownloadPdf}
        senior={senior}
      />

      <CentenarianFormPDF
        showCentenarianDrawer={showCentenarianDrawer}
        setShowCentenarianDrawer={setShowCentenarianDrawer}
        centenarianPdfUrl={centenarianPdfUrl}
        setCentenarianPdfUrl={setCentenarianPdfUrl}
        centenarianPdfLoading={centenarianPdfLoading}
        handleDownloadCentenarianPdf={handleDownloadCentenarianPdf}
        senior={senior}
      />
    </div>
  );
}

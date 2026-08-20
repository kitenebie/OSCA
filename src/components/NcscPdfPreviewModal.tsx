import React, { useEffect, useState } from "react";

import { X, Download, Loader2, Eye, FileText, AlertCircle } from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

import { fillNcscForm } from "../utils/ncscFormFiller";

import type { SeniorCitizen, NCSCDataForm } from "../types";

interface NcscPdfPreviewModalProps {
  isOpen: boolean;

  onClose: () => void;

  senior: SeniorCitizen;

  formData: Partial<NCSCDataForm>;

  interviewerName?: string;

  interviewPlace?: string;
}

export default function NcscPdfPreviewModal({
  isOpen,

  onClose,

  senior,

  formData,

  interviewerName,

  interviewPlace,
}: NcscPdfPreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Generate preview when modal opens

  useEffect(() => {
    if (isOpen && senior) {
      generatePreview();
    }

    return () => {
      // Cleanup blob URL on unmount

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen]);

  const generatePreview = async () => {
    setIsLoading(true);

    setError(null);

    try {
      const blob = await fillNcscForm({
        senior,

        formData,

        interviewerName,

        interviewDate: new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        interviewPlace: interviewPlace || "OSCA Office",

        flatten: false, // Keep editable for preview
      });

      const url = URL.createObjectURL(blob);

      // Revoke old preview if any

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      setPreviewUrl(url);
    } catch (e) {
      console.error("[NcscPdfPreview] Error:", e);

      setError(
        e instanceof Error ? e.message : "Failed to generate PDF preview",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (flatten: boolean) => {
    setIsDownloading(true);

    try {
      const blob = await fillNcscForm({
        senior,

        formData,

        interviewerName,

        interviewDate: new Date().toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

        interviewPlace: interviewPlace || "OSCA Office",

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
    } catch (e) {
      console.error("[NcscPdfPreview] Download error:", e);

      setError(e instanceof Error ? e.message : "Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText size={16} className="text-indigo-600" />
                </div>

                <div>
                  <h2 className="font-extrabold text-sm text-slate-800">
                    NCSC Data Form Preview
                  </h2>

                  <p className="text-[10px] text-slate-400 font-medium">
                    {senior.firstName} {senior.lastName} • {senior.oscaNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Download Editable */}

                <button
                  onClick={() => handleDownload(false)}
                  disabled={isDownloading || isLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={12} />
                  Editable
                </button>

                {/* Download Flattened (Final) */}

                <button
                  onClick={() => handleDownload(true)}
                  disabled={isDownloading || isLoading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} />
                  )}
                  Download Final PDF
                </button>

                {/* Close */}

                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* PDF Preview Body */}

            <div className="flex-1 bg-slate-100 relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80">
                  <Loader2
                    size={32}
                    className="text-indigo-500 animate-spin mb-3"
                  />

                  <p className="text-xs font-bold text-slate-500">
                    Generating NCSC Form...
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    Filling in {senior.firstName}'s data
                  </p>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/90">
                  <AlertCircle size={32} className="text-red-400 mb-3" />

                  <p className="text-xs font-bold text-red-600">
                    Failed to generate PDF
                  </p>

                  <p className="text-[10px] text-slate-500 mt-1 max-w-sm text-center">
                    {error}
                  </p>

                  <button
                    onClick={generatePreview}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {previewUrl && !isLoading && !error && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="NCSC PDF Preview"
                />
              )}

              {!previewUrl && !isLoading && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Eye size={32} className="text-slate-300 mb-3" />

                  <p className="text-xs text-slate-400">
                    Preview will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Footer info */}

            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <p className="text-[9px] text-slate-400">
                <strong>Editable</strong> = fillable fields remain editable •{" "}
                <strong>Final PDF</strong> = flattened (non-editable,
                print-ready)
              </p>

              <p className="text-[9px] text-slate-400 font-mono">
                NCSC-SCDF v4.0b3 • pdf-lib
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

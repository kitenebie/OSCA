import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileText, FileDown, X, Loader2 } from 'lucide-react';

interface NCSCFormPDFProps {
  showPdfDrawer: boolean;
  setShowPdfDrawer: (val: boolean) => void;
  pdfPreviewUrl: string | null;
  setPdfPreviewUrl: (val: string | null) => void;
  pdfLoading: boolean;
  handleDownloadPdf: (flatten: boolean) => void;
  senior: any;
}

export default function NCSCFormPDF({
  showPdfDrawer,
  setShowPdfDrawer,
  pdfPreviewUrl,
  setPdfPreviewUrl,
  pdfLoading,
  handleDownloadPdf,
  senior,
}: NCSCFormPDFProps) {
  return (
    <AnimatePresence>
        {showPdfDrawer && (
          <>
            {/* Backdrop */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1400] bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowPdfDrawer(false);
                if (pdfPreviewUrl) {
                  URL.revokeObjectURL(pdfPreviewUrl);
                  setPdfPreviewUrl(null);
                }
              }}
            />

            {/* Drawer Panel */}

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 z-[1500] h-full w-full max-w-7xl bg-white shadow-2xl flex flex-col border-l border-slate-200"
            >
              {/* Drawer Header */}

              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText size={16} className="text-indigo-600" />
                  </div>

                  <div>
                    <h2 className="font-extrabold text-sm text-slate-800">
                      NCSC Data Form
                    </h2>

                    <p className="text-[10px] text-slate-400 font-medium">
                      {senior.firstName} {senior.lastName} • {senior.oscaNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowPdfDrawer(false);
                      if (pdfPreviewUrl) {
                        URL.revokeObjectURL(pdfPreviewUrl);
                        setPdfPreviewUrl(null);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* PDF Content */}

              <div className="flex-1 bg-slate-100 relative overflow-hidden">
                {pdfLoading && (
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

                {pdfPreviewUrl && !pdfLoading && (
                  <iframe
                    src={pdfPreviewUrl}
                    className="w-full h-full border-0"
                    title="NCSC PDF Preview"
                  />
                )}
              </div>

              {/* Footer */}

              <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
                <p className="text-[9px] text-slate-400">
                  <strong>Editable</strong> = fillable •{" "}
                  <strong>Final PDF</strong> = flattened, print-ready
                </p>

                <p className="text-[9px] text-slate-400 font-mono">
                  NCSC-SCDF v4.0b3
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
}

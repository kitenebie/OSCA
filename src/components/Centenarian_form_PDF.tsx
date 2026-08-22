import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, FileDown, X, Loader2 } from 'lucide-react';

interface CentenarianFormPDFProps {
  showCentenarianDrawer: boolean;
  setShowCentenarianDrawer: (val: boolean) => void;
  centenarianPdfUrl: string | null;
  setCentenarianPdfUrl: (val: string | null) => void;
  centenarianPdfLoading: boolean;
  handleDownloadCentenarianPdf?: (flatten: boolean) => void;
  senior: any;
}

export default function CentenarianFormPDF({
  showCentenarianDrawer,
  setShowCentenarianDrawer,
  centenarianPdfUrl,
  setCentenarianPdfUrl,
  centenarianPdfLoading,
  handleDownloadCentenarianPdf,
  senior,
}: CentenarianFormPDFProps) {
  return (
    <AnimatePresence>
        {showCentenarianDrawer && (
          <>
            {/* Backdrop */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1400] bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setShowCentenarianDrawer(false);
                if (centenarianPdfUrl) {
                  URL.revokeObjectURL(centenarianPdfUrl);
                  setCentenarianPdfUrl(null);
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

              {['Qualified for Honoring','Approved Honoring', 'Disapproved Honoring'].includes(senior?.status) && (
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Award size={16} className="text-amber-600" />
                  </div>

                  <div>
                    <h2 className="font-extrabold text-sm text-slate-800">
                      Centenarian Honoring Claim Form
                    </h2>

                    <p className="text-[10px] text-slate-400 font-medium">
                      {senior.firstName} {senior.lastName} • {senior.oscaNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowCentenarianDrawer(false);
                      if (centenarianPdfUrl) {
                        URL.revokeObjectURL(centenarianPdfUrl);
                        setCentenarianPdfUrl(null);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              )}

              {/* Minimal close button when header is hidden */}
              {!['Qualified for Honoring','Approved Honoring', 'Disapproved Honoring'].includes(senior?.status) && (
              <div className="flex items-center justify-end px-3 py-2 shrink-0">
                <button
                  onClick={() => {
                    setShowCentenarianDrawer(false);
                    if (centenarianPdfUrl) { URL.revokeObjectURL(centenarianPdfUrl); setCentenarianPdfUrl(null); }
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              )}

              {/* PDF Content */}

              <div className="flex-1 bg-slate-100 relative overflow-hidden">
                {centenarianPdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80">
                    <Loader2
                      size={32}
                      className="text-amber-500 animate-spin mb-3"
                    />

                    <p className="text-xs font-bold text-slate-500">
                      Generating Centenarian Honoring Form...
                    </p>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Filling in {senior.firstName}'s data
                    </p>
                  </div>
                )}

                {centenarianPdfUrl && !centenarianPdfLoading && (
                  <iframe
                    src={`${centenarianPdfUrl}${!['Qualified for Honoring','Annex A Form Submitted', 'Approved Honoring'].includes(senior?.status) ? '#toolbar=0&navpanes=0' : ''}`}
                    className="w-full h-full border-0"
                    title="Centenarian Honoring PDF Preview"
                  />
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
}

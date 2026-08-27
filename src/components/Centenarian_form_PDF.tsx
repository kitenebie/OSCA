import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, FileDown, X, Loader2 } from 'lucide-react';
import { fillCentenarianForm } from '../utils/centenarianFormFiller';
import { supabase } from '../../utils/supabase';

interface CentenarianFormPDFProps {
  showCentenarianDrawer: boolean;
  setShowCentenarianDrawer: (val: boolean) => void;
  centenarianPdfUrl: string | null;
  setCentenarianPdfUrl: (val: string | null) => void;
  centenarianPdfLoading: boolean;
  handleDownloadCentenarianPdf?: (flatten: boolean) => void;
  senior: any;
}

// Map centenarian_honoring snake_case record to camelCase for fillCentenarianForm
function mapHonoringToSenior(r: any): any {
  return {
    dataPrivacyConsent: r.data_privacy_consent,
    placeOfSubmission: r.place_of_submission,
    ncscReferenceCode: r.ncsc_reference_code,
    oscaNumber: r.osca_number,
    firstName: r.first_name,
    middleName: r.middle_name,
    lastName: r.last_name,
    suffix: r.suffix,
    birthdate: r.birthdate,
    age: r.age,
    contactNumber: r.contact_number,
    address: r.address,
    barangay: r.barangay,
    cityTown: r.city_town,
    province: r.province,
    region: r.region,
    zipCode: r.zip_code,
    abroadHouseNo: r.abroad_house_no,
    abroadStreet: r.abroad_street,
    abroadCity: r.abroad_city,
    abroadState: r.abroad_state,
    abroadCountry: r.abroad_country,
    abroadZipCode: r.abroad_zip_code,
    sex: r.sex,
    civilStatus: r.civil_status,
    citizenship: r.citizenship,
    dualCitizenDetails: r.dual_citizen_details,
    physicalDisability: r.physical_disability,
    physicalDisabilityText: r.physical_disability_text,
    ethnicOrigin: r.ethnic_origin,
    spouseLastName: r.spouse_last_name,
    spouseFirstName: r.spouse_first_name,
    spouseMiddleName: r.spouse_middle_name,
    spouseExtension: r.spouse_extension,
    spouseContactNumber: r.spouse_contact_number,
    children: r.children,
    preferredPaymentMode: r.preferred_payment_mode,
    accountNumber: r.account_number,
    bankName: r.bank_name,
    branchName: r.branch_name,
    bankAddress: r.bank_address,
    isJointAccount: r.is_joint_account,
    bicSwiftCode: r.bic_swift_code,
    iban: r.iban,
    isDeceased: r.is_deceased,
    dateOfDeath: r.date_of_death,
    claimantContactNumber: r.claimant_contact_number,
    claimantEmail: r.claimant_email,
    claimantLastName: r.claimant_last_name,
    claimantFirstName: r.claimant_first_name,
    claimantMiddleName: r.claimant_middle_name,
    claimantExtension: r.claimant_extension,
    claimantHouseNo: r.claimant_house_no,
    claimantStreet: r.claimant_street,
    claimantBarangay: r.claimant_barangay,
    claimantCity: r.claimant_city,
    claimantProvince: r.claimant_province,
    claimantZipCode: r.claimant_zip_code,
    claimantRelationship: r.claimant_relationship,
    claimantPaymentMode: r.claimant_payment_mode,
    claimantAccountNumber: r.claimant_account_number,
    claimantBankName: r.claimant_bank_name,
    claimantBranchName: r.claimant_branch_name,
    claimantBankAddress: r.claimant_bank_address,
    claimantIsJointAccount: r.claimant_is_joint_account,
    claimantBicSwiftCode: r.claimant_bic_swift_code,
    claimantIban: r.claimant_iban,
    GranteeSigned: r.grantee_signed,
    GranteeSignature: r.grantee_signature,
    dateSigned: r.date_signed,
    RemarksNoteLackingDocs: r.remarks_note_lacking_docs,
    VerifierSignatureName: r.verifier_signature_name,
    verificationDate: r.verification_date,
    NCSCRegNo: r.ncsc_reg_no,
    verifierContactInfo: r.verifier_contact_info,
  };
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

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [honoringRecord, setHonoringRecord] = useState<any>(null);

  useEffect(() => {
    if (showCentenarianDrawer && senior) {
      fetchHonoringRecord();
    }
    return () => {};
  }, [showCentenarianDrawer, senior]);

  // Fetch the centenarian_honoring record by matching OSCA Number
  const fetchHonoringRecord = async () => {
    const oscaNum = senior?.oscaNumber || senior?.osca_number;
    if (!oscaNum) return;

    setPdfLoading(true);
    const { data, error } = await supabase
      .from('centenarian_honoring')
      .select('*')
      .eq('osca_number', oscaNum)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.error("[Centenarian PDF] No honoring record found:", error);
      setPdfLoading(false);
      return;
    }

    setHonoringRecord(data);
    generatePreview(data);
  };

  const generatePreview = async (record: any) => {
    setPdfLoading(true);
    try {
      const mapped = mapHonoringToSenior(record);
      const blob = await fillCentenarianForm({
        senior: mapped as any,
        flatten: true,
      });
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (e) {
      console.error("[Centenarian PDF] Error:", e);
    } finally {
      setPdfLoading(false);
    }
  };

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
                if (pdfUrl) {
                  URL.revokeObjectURL(pdfUrl);
                  setPdfUrl(null);
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
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Award size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-slate-800">
                      Centenarian Honoring Claim Form
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {honoringRecord?.first_name || senior?.firstName || ''} {honoringRecord?.last_name || senior?.lastName || ''} • {honoringRecord?.osca_number || senior?.oscaNumber || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Regenerate Button */}
                  <button
                    onClick={() => {
                      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                      setPdfUrl(null);
                      if (honoringRecord) generatePreview(honoringRecord);
                      else fetchHonoringRecord();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all cursor-pointer"
                  >
                    🔄 Regenerate
                  </button>
                  <button
                    onClick={() => {
                      setShowCentenarianDrawer(false);
                      if (pdfUrl) {
                        URL.revokeObjectURL(pdfUrl);
                        setPdfUrl(null);
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
                      className="text-amber-500 animate-spin mb-3"
                    />
                    <p className="text-xs font-bold text-slate-500">
                      Generating Centenarian Honoring Form...
                    </p>
                  </div>
                )}

                {pdfUrl && !pdfLoading && (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title="Centenarian Honoring PDF Preview"
                  />
                )}

                {!pdfUrl && !pdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-sm font-medium">No honoring record found for this OSCA Number.</p>
                  </div>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
}

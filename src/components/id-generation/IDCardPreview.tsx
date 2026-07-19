import React, { useState } from 'react';
import { SeniorCitizen } from '../../types';
import { exportSeniorIDCardPDF } from '../../utils/pdfExport';
import { useUIStore } from '../../store/uiStore';
import { FileDown, Radio, Check, CreditCard, ShieldCheck } from 'lucide-react';
import NFCWriteModal from './NFCWriteModal';

interface IDCardPreviewProps {
  senior: SeniorCitizen;
}

export default function IDCardPreview({ senior }: IDCardPreviewProps) {
  const showToast = useUIStore((state) => state.showToast);
  const [isExporting, setIsExporting] = useState(false);
  const [isNFCOpen, setIsNFCOpen] = useState(false);
  const [nfcWritten, setNfcWritten] = useState(false);

  // Secure QR code API using direct CDN generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f766e&data=${encodeURIComponent(
    JSON.stringify({
      osca: senior.oscaNumber,
      name: `${senior.firstName} ${senior.lastName}`,
      barangay: senior.barangay,
      pensioner: senior.pensionBeneficiary
    })
  )}`;

  const handleExportPDF = async () => {
    setIsExporting(true);
    showToast('Inihahanda ang PDF layout para sa ID Card...', 'info');
    
    // Tiny delay to allow state changes to paint
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const success = await exportSeniorIDCardPDF(
      `id-card-front-${senior.id}`,
      `id-card-back-${senior.id}`,
      `${senior.firstName}_${senior.lastName}`
    );

    setIsExporting(false);
    if (success) {
      showToast('Nai-download na ang inyong Senior Citizen ID (PDF)!', 'success');
    } else {
      showToast('Kakulangan sa pag-render ng ID card PDF.', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-6">
      
      {/* Action Buttons Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">NFC OSCA ID Card</h4>
          <p className="text-[11px] text-slate-400">Generate, print, and write biometric identity cards</p>
        </div>
        
        <div className="flex gap-2.5">
          {/* Write to NFC button */}
          <button
            type="button"
            onClick={() => setIsNFCOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm border transition-all duration-150 active:scale-95
              ${nfcWritten 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'}`}
          >
            <Radio size={14} className={nfcWritten ? 'text-emerald-500' : 'text-teal-600 animate-pulse'} />
            <span>{nfcWritten ? 'ID NFC Written' : 'Magsulat sa NFC (Write)'}</span>
          </button>

          {/* Download PDF button */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 shadow-sm transition-all duration-150 active:scale-95"
          >
            <FileDown size={14} />
            <span>{isExporting ? 'Renedering...' : 'I-download (CR80 PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Double Sided ID Display Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center py-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
        
        {/* FRONT OF THE ID CARD (Standard CR80 Ratio 3.375" x 2.125" -> scaled to 340px x 214px for crisp view) */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Front Preview (Harap)</span>
          <div 
            id={`id-card-front-${senior.id}`}
            className="w-[340px] h-[214px] bg-gradient-to-br from-teal-800 via-teal-750 to-teal-900 text-white rounded-xl shadow-lg border border-teal-950/20 p-3.5 flex flex-col justify-between relative overflow-hidden select-none shrink-0"
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-teal-500/10 rounded-full blur-lg pointer-events-none"></div>
            
            {/* Front Header */}
            <div className="flex items-center gap-2.5 border-b border-teal-500/30 pb-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-900 text-xs font-extrabold shadow-sm">
                🇵🇭
              </div>
              <div className="flex-1">
                <h5 className="text-[9px] font-extrabold tracking-wide uppercase leading-none text-teal-200">BAYAN NG JUBAN</h5>
                <h6 className="text-[7px] font-bold tracking-tight text-white/85 mt-0.5 uppercase leading-none">Office of the Senior Citizens Affairs (OSCA)</h6>
              </div>
              <div className="w-6 h-6 bg-amber-500/15 border border-amber-500/20 rounded-full flex items-center justify-center text-[7px] font-extrabold text-amber-300 shadow-inner">
                OSCA
              </div>
            </div>

            {/* Front Body */}
            <div className="flex-1 flex gap-3 mt-2.5 relative z-10">
              
              {/* Photo Area */}
              <div className="w-[74px] h-[86px] rounded-lg bg-teal-950/50 border border-teal-600/50 overflow-hidden flex items-center justify-center shrink-0 relative">
                {senior.profilePhoto ? (
                  <img 
                    referrerPolicy="no-referrer"
                    src={senior.profilePhoto} 
                    alt={senior.firstName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-[9px] text-teal-300 font-bold uppercase text-center p-1 leading-tight">NO PHOTO</div>
                )}
                
                {/* Embedded gold chip mock to symbolize smart NFC capability */}
                <div className="absolute top-1 right-1 w-3.5 h-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-sm shadow-sm flex flex-col justify-between p-0.5">
                  <span className="w-full h-px bg-amber-800/20"></span>
                  <span className="w-full h-px bg-amber-800/20"></span>
                </div>
              </div>

              {/* Personal Details Area */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-1">
                  <p className="text-[8px] text-teal-300 uppercase font-semibold leading-none">Senior Citizen Name</p>
                  <h4 className="text-[11px] font-black text-white leading-tight uppercase tracking-tight truncate">
                    {senior.firstName} {senior.lastName}
                  </h4>
                  <p className="text-[7px] text-teal-200/90 leading-none truncate">
                    Barangay: <span className="font-bold text-white">{senior.barangay}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <p className="text-[6px] text-teal-300 uppercase font-semibold leading-none">Date of Birth</p>
                    <span className="text-[7px] font-bold text-white leading-tight">{senior.birthdate}</span>
                  </div>
                  <div>
                    <p className="text-[6px] text-teal-300 uppercase font-semibold leading-none">Gender</p>
                    <span className="text-[7px] font-bold text-white leading-tight">{senior.sex}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[6px] text-teal-300 uppercase font-semibold leading-none">OSCA Number</p>
                  <span className="text-[8.5px] font-mono font-black text-amber-300 tracking-wider leading-none">{senior.oscaNumber}</span>
                </div>
              </div>

            </div>

            {/* Front Footer */}
            <div className="border-t border-teal-500/20 pt-1.5 flex items-end justify-between relative z-10 text-[6px]">
              <div>
                <p className="text-teal-400 font-medium leading-none">Issued Date: <span className="text-white font-bold">{senior.registeredDate}</span></p>
              </div>
              
              {/* Captured Signature container */}
              <div className="flex flex-col items-center">
                <div className="h-4 w-16 relative flex items-center justify-center">
                  {senior.signatureData ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={senior.signatureData} 
                      alt="Signature" 
                      className="max-h-full max-w-full object-contain invert brightness-200" 
                    />
                  ) : (
                    <div className="w-full border-b border-teal-400/50 h-px"></div>
                  )}
                </div>
                <p className="text-[5.5px] text-teal-300 font-semibold uppercase tracking-wider leading-none mt-0.5">Signature of Holder</p>
              </div>
            </div>

          </div>
        </div>

        {/* BACK OF THE ID CARD */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Back Preview (Likod)</span>
          <div 
            id={`id-card-back-${senior.id}`}
            className="w-[340px] h-[214px] bg-white text-slate-800 rounded-xl shadow-lg border border-slate-200 p-3.5 flex flex-col justify-between relative overflow-hidden select-none shrink-0"
          >
            {/* Back Header panel */}
            <div className="bg-teal-900 -mx-3.5 -mt-3.5 px-3.5 py-2 flex items-center justify-between text-white mb-2 shrink-0 border-b border-teal-950">
              <span className="text-[7px] font-extrabold tracking-wider uppercase">Privileges & Benefits Summary</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
                <span className="text-[6px] font-mono font-bold tracking-widest">NFC SMART TAG EMULATED</span>
              </div>
            </div>

            {/* Back Body content */}
            <div className="flex-1 grid grid-cols-5 gap-3.5 mt-1">
              
              {/* Privileges terms */}
              <div className="col-span-3 text-[6px] text-slate-500 space-y-1 leading-normal pr-1 border-r border-slate-100">
                <p className="font-extrabold text-slate-800 mb-0.5 uppercase">TERMS AND PRIVILEGES:</p>
                <p>1. 20% Discount on Medicines, transport, hospitals, medical supplies as per RA 9994.</p>
                <p>2. Non-transferable. Misuse of this card is punishable under LGU Municipal Penal Codes.</p>
                <p>3. In case of loss, report immediately to OSCA Office, Juban Municipal Hall.</p>
                
                <div className="pt-1.5 space-y-0.5">
                  <p className="font-bold text-slate-700 uppercase">EMERGENCY CONTACT PERSON:</p>
                  <p className="font-semibold text-slate-900 text-[6.5px]">Landline: (056) 211-1234 (MSWDO Office)</p>
                  <p className="font-semibold text-slate-900 text-[6.5px]">Mobile: {senior.contactNumber || '+63 LGU Emergency'}</p>
                </div>
              </div>

              {/* QR and Barcode scan details */}
              <div className="col-span-2 flex flex-col justify-between items-center">
                
                {/* QR Code Container */}
                <div className="w-[66px] h-[66px] p-1 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                  <img 
                    referrerPolicy="no-referrer"
                    src={qrCodeUrl} 
                    alt="OSCA QR Verification" 
                    className="w-full h-full object-contain" 
                  />
                </div>

                {/* Simulated Barcode */}
                <div className="w-full flex flex-col items-center">
                  <div className="w-full h-5 flex gap-px bg-slate-950/10 p-0.5 rounded border border-slate-100 items-stretch">
                    {/* Generates a stylized barcodes lines series */}
                    {[1,3,1,2,1,4,1,1,2,1,3,1,2,1,1,2,1,4,1,1,2,1,1,2,1].map((w, i) => (
                      <span 
                        key={i} 
                        className={`h-full bg-slate-900`} 
                        style={{ flexGrow: w, opacity: i % 2 === 0 ? 1 : 0 }}
                      ></span>
                    ))}
                  </div>
                  <span className="text-[6px] font-mono text-slate-400 mt-0.5 font-bold">{senior.oscaNumber}</span>
                </div>

              </div>

            </div>

            {/* Back Footer Signatures */}
            <div className="border-t border-slate-100 pt-1.5 flex items-end justify-between shrink-0 text-[6.5px] mt-1.5">
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 uppercase leading-none">Hon. Antonio Alindogan</span>
                <span className="text-[5px] text-slate-400 uppercase font-medium mt-0.5">Municipal Mayor</span>
              </div>
              
              <div className="flex flex-col items-center">
                {/* Mocked OSCA Head signature line */}
                <div className="h-3.5 relative flex items-center justify-center">
                  <div className="text-[8px] font-serif italic text-teal-800 relative z-10 leading-none -mb-1 transform rotate-[-3deg] select-none">M. Santos</div>
                </div>
                <span className="text-[5px] text-slate-400 uppercase font-medium border-t border-slate-200 pt-0.5 leading-none mt-0.5">OSCA Head / MSWDO</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Security Advisory footer */}
      <div className="flex items-start gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/50">
        <ShieldCheck className="text-teal-600 mt-0.5 shrink-0" size={16} />
        <div>
          <h5 className="font-bold text-xs text-slate-800">Smart LGU Identity Credentials</h5>
          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
            This card contains an embedded simulated NDEF smart segment (Sector 0/1) for seamless touch-ins at municipal transport nodes, pension distribution terminals, and free clinic registration desks.
          </p>
        </div>
      </div>

      {/* NFC Write Overlay modal */}
      {isNFCOpen && (
        <NFCWriteModal 
          senior={senior}
          onClose={() => setIsNFCOpen(false)}
          onSuccess={() => {
            setNfcWritten(true);
            setIsNFCOpen(false);
          }}
        />
      )}

    </div>
  );
}

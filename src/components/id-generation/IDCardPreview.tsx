import { useState } from 'react';
import { SeniorCitizen } from '../../types';
import { exportSeniorIDCardPDF } from '../../utils/pdfExport';
import { useUIStore } from '../../store/uiStore';
import { FileDown, Radio, ShieldCheck, Printer } from 'lucide-react';
import NFCWriteModal from './NFCWriteModal';
import { renderBarcodeBits } from '../../utils/idGenerator';
const phLogo = 'https://kitenebie.github.io/OSCA/ph_logo.png';
const fingerprintImg = 'https://kitenebie.github.io/OSCA/fingerprint.png';

interface IDCardPreviewProps {
  senior: SeniorCitizen;
}

export default function IDCardPreview({ senior }: IDCardPreviewProps) {
  const { showToast, nfcEnabled } = useUIStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isNFCOpen, setIsNFCOpen] = useState(false);
  const [nfcWritten, setNfcWritten] = useState(false);

  // Secure QR code API using direct CDN generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=02A952&data=${encodeURIComponent(
    JSON.stringify({
      osca: senior.oscaNumber,
      name: `${senior.firstName} ${senior.lastName}`,
      barangay: senior.barangay,
      pensioner: senior.pensionBeneficiary
    })
  )}`;

  const handleExportPDF = async () => {
    if (senior.status !== 'Approved') {
      showToast('Hindi maaaring i-download ang ID ng hindi pa aprubadong senior citizen.', 'error');
      return;
    }

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

  const handlePrint = () => {
    const frontEl = document.getElementById(`id-card-front-${senior.id}`);
    const backEl = document.getElementById(`id-card-back-${senior.id}`);
    if (!frontEl || !backEl) {
      showToast('Hindi mahanap ang ID Card layout para i-print.', 'error');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      showToast('Naka-block ang pop-up window ng inyong browser.', 'warning');
      return;
    }

    let stylesHtml = '';
    const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleElements.forEach((el) => {
      stylesHtml += el.outerHTML;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Senior ID - ${senior.firstName} ${senior.lastName}</title>
          ${stylesHtml}
          <style>
            @media print {
              body {
                background: white !important;
                margin: 0;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 30px;
              }
              .no-print {
                display: none !important;
              }
            }
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 30px;
              padding: 40px;
              background-color: #f8fafc;
            }
            .card-wrapper {
              display: inline-block;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              border-radius: 12px;
              background: white;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 10px; text-align: center;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #02a952; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px;">
              Print ID Card
            </button>
            <p style="font-size: 11px; color: #666; margin-top: 8px;">Tip: Select "Landscape" orientation and set margins to "None" for best results.</p>
          </div>
          <div class="card-wrapper">
            ${frontEl.outerHTML}
          </div>
          <div class="card-wrapper">
            ${backEl.outerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // ─── PALETTE CONSTANTS (strict 5-color) ───
  const C = {
    green:   '#02A952',
    yellow:  '#FDFE00',
    white:   '#FEFEFE',
    blue:    '#0000FD',
    red:     '#FD0000',
    darkText:'#1a1a1a',
  } as const;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-6">
      
      {/* Action Buttons Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-slate-800 text-sm md:text-base">{nfcEnabled ? 'NFC OSCA ID Card' : 'OSCA ID Card'}</h4>
          <p className="text-[11px] text-slate-400">Generate, print, and write biometric identity cards</p>
        </div>
        
        <div className="flex gap-2.5">
          {/* Write to NFC button */}
          {nfcEnabled && (
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
          )}

          {/* Download PDF button */}
          <button
            type="button"
            disabled={isExporting || senior.status !== 'Approved'}
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm transition-all duration-150 active:scale-95"
            title={senior.status !== 'Approved' ? 'Maaari lamang i-download ang ID kung ang status ng Senior ay Approved.' : ''}
          >
            <FileDown size={14} />
            <span>
              {isExporting 
                ? 'Rendering...' 
                : senior.status !== 'Approved' 
                  ? 'Hindi Aprubado (Bawal I-download)' 
                  : 'I-download (CR80 PDF)'}
            </span>
          </button>
        </div>
      </div>

      {/* Double Sided ID Display Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center justify-center py-4 bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-100 w-full max-w-full overflow-hidden">
        
        {/* ═══════════════════════════════════════════════════════════════
            FRONT OF THE ID CARD — CR80 ratio 3.375" x 2.125" → 340 x 214px
           ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center gap-2 overflow-hidden w-full">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Front Preview (Harap)</span>
          <div className="scale-[0.8] min-[370px]:scale-[0.9] min-[420px]:scale-100 origin-center transition-transform shrink-0 my-[-15px] min-[420px]:my-0 w-[272px] min-[370px]:w-[306px] min-[420px]:w-[340px] h-[171.2px] min-[370px]:h-[192.6px] min-[420px]:h-[214px] flex items-center justify-center">
            <div 
              id={`id-card-front-${senior.id}`}
            style={{
              width: 340,
              height: 214,
              borderRadius: 12,
              padding: 2,
              background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              background: C.white,
              borderRadius: 10,
              overflow: 'hidden',
              position: 'relative',
              fontFamily: "'Segoe UI', 'Inter', 'Poppins', system-ui, sans-serif",
              WebkitTextSizeAdjust: 'none',
              textSizeAdjust: 'none',
            }}>
            {/* ── TOP-LEFT CONCENTRIC CURVED ACCENT BLOCK ── */}
            {/* Blue accent (outermost) */}
            <div style={{
              position: 'absolute',
              top: -60,
              left: -60,
              width: 272,
              height: 182,
              background: C.blue,
              borderBottomRightRadius: '100%',
              zIndex: 1,
            }} />
            {/* Red accent (thin stripe) */}
            <div style={{
              position: 'absolute',
              top: -60,
              left: -60,
              width: 264,
              height: 174,
              background: C.red,
              borderBottomRightRadius: '100%',
              zIndex: 2,
            }} />
            {/* Yellow accent (middle) */}
            <div style={{
              position: 'absolute',
              top: -60,
              left: -60,
              width: 258,
              height: 168,
              background: C.yellow,
              borderBottomRightRadius: '100%',
              zIndex: 3,
            }} />
            {/* Green base (innermost) */}
            <div style={{
              position: 'absolute',
              top: -60,
              left: -60,
              width: 250,
              height: 160,
              background: C.green,
              borderBottomRightRadius: '100%',
              zIndex: 4,
            }} />

            {/* Blended PH Logo background watermark (centered, large and visible) */}
            <img 
              crossOrigin="anonymous"
              src={phLogo} 
              alt="PH Logo Seal"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 190,
                height: 190,
                opacity: 0.35,
                mixBlendMode: 'multiply',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />


            {/* ── BOTTOM-RIGHT CONCENTRIC CURVED ACCENT ── */}
            {/* Blue accent (outermost) */}
            <div style={{
              position: 'absolute',
              bottom: -50,
              right: -50,
              width: 204,
              height: 134,
              background: C.blue,
              borderTopLeftRadius: '100%',
              zIndex: 1,
            }} />
            {/* Red accent (thin stripe) */}
            <div style={{
              position: 'absolute',
              bottom: -50,
              right: -50,
              width: 198,
              height: 128,
              background: C.red,
              borderTopLeftRadius: '100%',
              zIndex: 2,
            }} />
            {/* Yellow accent (middle) */}
            <div style={{
              position: 'absolute',
              bottom: -50,
              right: -50,
              width: 192,
              height: 122,
              background: C.yellow,
              borderTopLeftRadius: '100%',
              zIndex: 3,
            }} />
            {/* Green base (innermost) */}
            <div style={{
              position: 'absolute',
              bottom: -50,
              right: -50,
              width: 184,
              height: 114,
              background: C.green,
              borderTopLeftRadius: '100%',
              zIndex: 4,
            }} />

            {/* Half Philippine Sun Crown emerging from bottom-right curves */}
            <svg style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 100,
              height: 100,
              zIndex: 3.5,
              pointerEvents: 'none',
            }} viewBox="0 0 100 100">
              <defs>
                <g id="phil-ray-front">
                  <polygon points="0,-45 -4,-18 4,-18" fill={C.yellow} />
                  <polygon points="-8,-38 -1,-17 -7,-17" fill={C.yellow} />
                  <polygon points="8,-38 7,-17 1,-17" fill={C.yellow} />
                </g>
              </defs>
              <circle cx={100} cy={100} r={18} fill={C.yellow} />
              <use href="#phil-ray-front" transform="translate(100, 100) rotate(-90)" />
              <use href="#phil-ray-front" transform="translate(100, 100) rotate(-67.5)" />
              <use href="#phil-ray-front" transform="translate(100, 100) rotate(-45)" />
              <use href="#phil-ray-front" transform="translate(100, 100) rotate(-22.5)" />
              <use href="#phil-ray-front" transform="translate(100, 100) rotate(0)" />
            </svg>

            {/* Biometric Fingerprint Security Seal (bottom-right on green curve) */}
            <img 
              crossOrigin="anonymous"
              src={fingerprintImg} 
              alt="Biometric Fingerprint"
              style={{
                position: 'absolute',
                bottom: 12,
                right: 14,
                width: 32,
                height: 40,
                opacity: 0.85,
                zIndex: 10,
                pointerEvents: 'none',
              }}
            />

            {/* White bold OSCA text on the left top side */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: 14,
              zIndex: 10,
              fontSize: 10,
              fontWeight: 900,
              color: C.white,
              letterSpacing: '1px',
              fontFamily: "'Segoe UI', 'Inter', 'Poppins', sans-serif",
            }}>
              OSCA
            </div>

            {/* ── LOGO BADGE (top-left, white text on green, over diagonal) ── */}
            <div style={{
              position: 'absolute',
              top: 8,
              left: 54,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}>
                <img 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  src="https://kitenebie.github.io/OSCA/juban-logo.png" 
                  alt="Juban Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{
                  fontSize: 7,
                  fontWeight: 800,
                  color: C.white,
                  letterSpacing: '0.5px',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}>BAYAN NG JUBAN</div>
                <div style={{
                  fontSize: 5.5,
                  fontWeight: 600,
                  color: 'rgba(254,254,254,0.85)',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                }}>Office of Senior Citizens Affairs</div>
              </div>
            </div>

            {/* ── OSCA BADGE (top-right, green badge on white bg) ── */}
            <div style={{
              position: 'absolute',
              top: 8,
              right: 12,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                background: C.green,
                color: C.white,
                fontSize: 6,
                fontWeight: 900,
                padding: '3px 6px',
                borderRadius: 3,
                letterSpacing: '1px',
                lineHeight: 1,
              }}>OSCA</div>
              <div style={{
                fontSize: 5,
                color: C.green,
                fontWeight: 700,
                marginTop: 1,
                letterSpacing: '0.3px',
              }}>SENIOR CITIZEN</div>
            </div>

            {/* ── PHOTO PLACEHOLDER (upper-left-center area) ── */}
            <div style={{
              position: 'absolute',
              top: 38,
              left: 100,
              width: 68,
              height: 78,
              borderRadius: 8,
              border: `2.5px solid ${C.green}`,
              background: '#f0f4f3',
              overflow: 'hidden',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2,169,82,0.15)',
            }}>
              {senior.profilePhoto ? (
                <img 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  src={senior.profilePhoto} 
                  alt={senior.firstName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  fontSize: 8,
                  color: C.green,
                  fontWeight: 700,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  padding: 4,
                  lineHeight: 1.3,
                }}>2x2{'\n'}PHOTO</div>
              )}
              {/* NFC chip mock */}
              {nfcEnabled && (
                <div style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 14,
                  height: 10,
                  background: 'linear-gradient(135deg, #f59e0b, #eab308)',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 2,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                }}>
                  <span style={{ width: '100%', height: 1, background: 'rgba(120,80,0,0.2)' }} />
                  <span style={{ width: '100%', height: 1, background: 'rgba(120,80,0,0.2)' }} />
                </div>
              )}
            </div>

            {/* ── NAME & TITLE BLOCK (right of photo) ── */}
            <div style={{
              position: 'absolute',
              top: 40,
              left: 178,
              right: 14,
              zIndex: 10,
            }}>
              <div style={{
                fontSize: 5.5,
                fontWeight: 600,
                color: C.green,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                lineHeight: 1,
                marginBottom: 2,
              }}>Senior Citizen Name</div>
              <div style={{
                fontSize: 12,
                fontWeight: 900,
                color: C.darkText,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {senior.firstName} {senior.lastName}
              </div>
              <div style={{
                fontSize: 7.5,
                fontWeight: 600,
                color: C.green,
                lineHeight: 1.2,
                marginTop: 2,
              }}>
                Brgy. {senior.barangay}
              </div>
            </div>

            {/* ── OSCA NUMBER (below name, accent display) ── */}
            <div style={{
              position: 'absolute',
              top: 82,
              left: 178,
              right: 14,
              zIndex: 10,
            }}>
              <div style={{
                fontSize: 5,
                fontWeight: 700,
                color: '#666',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                lineHeight: 1,
                marginBottom: 1,
              }}>OSCA Number</div>
              <div style={{
                fontSize: 9,
                fontWeight: 900,
                color: C.green,
                fontFamily: "'Consolas', 'SF Mono', monospace",
                letterSpacing: '0.8px',
                lineHeight: 1,
              }}>{senior.oscaNumber}</div>
            </div>

            {/* ── CONTACT INFO BLOCK (bottom-left, icon+text rows) ── */}
            <div style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}>
              {/* Date of Birth */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="8" height="8" viewBox="0 0 16 16" fill={C.blue} style={{ flexShrink: 0 }}>
                  <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke={C.blue} strokeWidth="1.5"/>
                  <line x1="5" y1="1" x2="5" y2="5" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="11" y1="1" x2="11" y2="5" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="2" y1="7" x2="14" y2="7" stroke={C.blue} strokeWidth="1"/>
                </svg>
                <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}>
                  <span style={{ color: '#888', fontWeight: 600 }}>DOB: </span>{senior.birthdate}
                </span>
              </div>
              {/* Gender */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="8" height="8" viewBox="0 0 16 16" fill={C.green} style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="5.5" fill="none" stroke={C.green} strokeWidth="1.5"/>
                  <circle cx="8" cy="8" r="2" fill={C.green}/>
                </svg>
                <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}>
                  <span style={{ color: '#888', fontWeight: 600 }}>Sex: </span>{senior.sex}
                </span>
              </div>
              {/* Contact Number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="8" height="8" viewBox="0 0 16 16" fill={C.blue} style={{ flexShrink: 0 }}>
                  <rect x="4" y="1" width="8" height="14" rx="2" fill="none" stroke={C.blue} strokeWidth="1.3"/>
                  <line x1="6" y1="12" x2="10" y2="12" stroke={C.blue} strokeWidth="1" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}>
                  {senior.contactNumber || '(No Phone)'}
                </span>
              </div>
            </div>

            {/* ── ISSUED DATE + SIGNATURE (bottom-center/right area) ── */}
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: 130,
              right: 60,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              {/* Signature area */}
              <div style={{
                height: 16,
                width: 70,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {senior.signatureData ? (
                  <img 
                    referrerPolicy="no-referrer"
                    src={senior.signatureData} 
                    alt="Signature" 
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'brightness(0)' }}
                  />
                ) : (
                  <div style={{ width: '100%', borderBottom: `1px solid ${C.green}`, height: 1 }} />
                )}
              </div>
              <div style={{
                fontSize: 5,
                color: '#888',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: 1,
              }}>Signature of Holder</div>
              <div style={{
                fontSize: 5,
                color: '#888',
                fontWeight: 500,
                marginTop: 2,
              }}>
                Issued: <span style={{ fontWeight: 700, color: C.darkText }}>{senior.registeredDate}</span>
              </div>
            </div>

            </div>
          </div>
        </div>
      </div>

        {/* ═══════════════════════════════════════════════════════════════
            BACK OF THE ID CARD — Dominant green background
           ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center gap-2 overflow-hidden w-full">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Back Preview (Likod)</span>
          <div className="scale-[0.8] min-[370px]:scale-[0.9] min-[420px]:scale-100 origin-center transition-transform shrink-0 my-[-15px] min-[420px]:my-0 w-[272px] min-[370px]:w-[306px] min-[420px]:w-[340px] h-[171.2px] min-[370px]:h-[192.6px] min-[420px]:h-[214px] flex items-center justify-center">
            <div 
              id={`id-card-back-${senior.id}`}
            style={{
              width: 340,
              height: 214,
              borderRadius: 12,
              padding: 2,
              background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              background: C.green,
              borderRadius: 10,
              overflow: 'hidden',
              position: 'relative',
              fontFamily: "'Segoe UI', 'Inter', 'Poppins', system-ui, sans-serif",
              WebkitTextSizeAdjust: 'none',
              textSizeAdjust: 'none',
            }}>
            {/* ── CONCENTRIC CURVED ACCENTS (inverted, layered) ── */}
            {/* Top-right blue overlay (outermost) */}
            <div style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 256,
              height: 176,
              background: C.blue,
              borderBottomLeftRadius: '100%',
              zIndex: 1,
            }} />
            {/* Top-right red overlay (thin stripe) */}
            <div style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 248,
              height: 168,
              background: C.red,
              borderBottomLeftRadius: '100%',
              zIndex: 2,
            }} />
            {/* Top-right yellow overlay (middle) */}
            <div style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 242,
              height: 162,
              background: C.yellow,
              borderBottomLeftRadius: '100%',
              zIndex: 3,
            }} />
            {/* Top-right dark overlay (innermost) */}
            <div style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 234,
              height: 154,
              background: 'rgba(0,0,0,0.15)',
              borderBottomLeftRadius: '100%',
              zIndex: 4,
            }} />

            {/* Half Philippine Sun Crown emerging from top-right curves */}
            <svg style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 100,
              height: 100,
              zIndex: 3.5,
              pointerEvents: 'none',
            }} viewBox="0 0 100 100">
              <defs>
                <g id="phil-ray-back">
                  <polygon points="0,-45 -4,-18 4,-18" fill={C.yellow} />
                  <polygon points="-8,-38 -1,-17 -7,-17" fill={C.yellow} />
                  <polygon points="8,-38 7,-17 1,-17" fill={C.yellow} />
                </g>
              </defs>
              <circle cx={100} cy={0} r={18} fill={C.yellow} />
              <use href="#phil-ray-back" transform="translate(100, 0) rotate(-90)" />
              <use href="#phil-ray-back" transform="translate(100, 0) rotate(-112.5)" />
              <use href="#phil-ray-back" transform="translate(100, 0) rotate(-135)" />
              <use href="#phil-ray-back" transform="translate(100, 0) rotate(-157.5)" />
              <use href="#phil-ray-back" transform="translate(100, 0) rotate(-180)" />
            </svg>

            {/* Bottom-left blue overlay (outermost) */}
            <div style={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 186,
              height: 126,
              background: C.blue,
              borderTopRightRadius: '100%',
              zIndex: 1,
            }} />

            {/* Blended PH Logo background watermark on back side (centered, large and visible) */}
            <img 
              crossOrigin="anonymous"
              src={phLogo} 
              alt="PH Logo Seal"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 190,
                height: 190,
                opacity: 0.28,
                mixBlendMode: 'multiply',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            {/* Bottom-left red overlay (thin stripe) */}
            <div style={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 178,
              height: 118,
              background: C.red,
              borderTopRightRadius: '100%',
              zIndex: 2,
            }} />
            {/* Bottom-left dark overlay (innermost) */}
            <div style={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 172,
              height: 112,
              background: 'rgba(0,0,0,0.12)',
              borderTopRightRadius: '100%',
              zIndex: 3,
            }} />


            {/* ── LOGO (top-left, white/light version on green bg) ── */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: 14,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                background: C.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}>
                <img 
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  src="https://kitenebie.github.io/OSCA/juban-logo.png" 
                  alt="Juban Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{
                  fontSize: 7,
                  fontWeight: 800,
                  color: C.white,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                }}>BAYAN NG JUBAN</div>
                <div style={{
                  fontSize: 5.5,
                  fontWeight: 600,
                  color: 'rgba(254,254,254,0.8)',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                }}>OSCA — Sorsogon, Philippines</div>
              </div>
            </div>

            {/* NFC status indicator */}
            <div style={{
              position: 'absolute',
              top: 10,
              right: 14,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}>
              <div style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: C.yellow,
                boxShadow: `0 0 4px ${C.yellow}`,
              }} />
              <span style={{
                fontSize: 5,
                fontWeight: 700,
                color: C.white,
                fontFamily: "'Consolas', 'SF Mono', monospace",
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}>{nfcEnabled ? 'NFC SMART TAG' : 'SMART TAG'}</span>
            </div>

            {/* ── TERMS & CONDITIONS TEXT BLOCK ── */}
            <div style={{
              position: 'absolute',
              top: 36,
              left: 14,
              right: 120,
              zIndex: 10,
            }}>
              <div style={{
                fontSize: 6.5,
                fontWeight: 800,
                color: C.white,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                lineHeight: 1,
                marginBottom: 4,
              }}>Terms & Privileges</div>
              <div style={{
                fontSize: 5.5,
                fontWeight: 400,
                color: C.white,
                lineHeight: 1.45,
              }}>
                <p style={{ margin: '0 0 2px' }}>1. 20% Discount on Medicines, transport, hospitals, medical supplies as per RA 9994.</p>
                <p style={{ margin: '0 0 2px' }}>2. Non-transferable. Misuse is punishable under LGU Municipal Penal Codes.</p>
                <p style={{ margin: '0 0 2px' }}>3. If lost, report immediately to OSCA Office, Juban Municipal Hall.</p>
              </div>
              
              {/* Emergency contact */}
              <div style={{ marginTop: 5 }}>
                <div style={{
                  fontSize: 5.5,
                  fontWeight: 800,
                  color: C.white,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  lineHeight: 1,
                  marginBottom: 2,
                }}>Emergency Contact:</div>
                <div style={{ fontSize: 5.5, fontWeight: 500, color: C.white, lineHeight: 1.4 }}>
                  Landline: (056) 211-1234 (MSWDO)
                </div>
                <div style={{ fontSize: 5.5, fontWeight: 500, color: C.white, lineHeight: 1.4 }}>
                  Mobile: {senior.contactNumber || '+63 LGU Emergency'}
                </div>
              </div>
            </div>

            {/* ── QR CODE (right side with white bg box and accent frame) ── */}
            <div style={{
              position: 'absolute',
              top: 36,
              right: 14,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}>
              {/* Yellow accent ring / seal */}
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: `2px solid ${C.yellow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: -2,
                right: -2,
                zIndex: 11,
              }}>
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: C.yellow,
                }} />
              </div>
              
              {/* QR container with gradient border: 40% red, 20% yellow, 40% blue */}
              <div style={{
                width: 74,
                height: 74,
                padding: 2,
                borderRadius: 5,
                background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: C.white,
                  borderRadius: 3.5,
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img 
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    src={qrCodeUrl} 
                    alt="OSCA QR Verification" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>
              <span style={{
                fontSize: 5,
                fontWeight: 700,
                color: C.white,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>SCAN TO VERIFY</span>
            </div>

            {/* ── BARCODE (bottom-center strip) ── */}
            <div style={{
              position: 'absolute',
              bottom: 28,
              left: 14,
              right: 100,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                width: '100%',
                height: 18,
                background: 'rgba(0,0,0,0.08)',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.15)',
                padding: 2,
                display: 'flex',
                alignItems: 'stretch',
                overflow: 'hidden',
              }}>
                {(() => {
                  const { bars, totalWidth } = renderBarcodeBits(senior.oscaNumber);
                  return (
                    <svg viewBox={`0 0 ${totalWidth} 20`} width="100%" height="100%" preserveAspectRatio="none" style={{ fill: C.white }}>
                      {bars.map((bar, idx) => bar.isBlack ? (
                        <rect key={idx} x={bar.x} y={0} width={bar.width} height={20} />
                      ) : null)}
                    </svg>
                  );
                })()}
              </div>
              <span style={{
                fontSize: 5.5,
                fontFamily: "'Consolas', 'SF Mono', monospace",
                fontWeight: 700,
                color: 'rgba(254,254,254,0.7)',
                marginTop: 1,
                letterSpacing: '0.5px',
              }}>{senior.oscaNumber}</span>
            </div>

            {/* ── FOOTER SIGNATURES ── */}
            <div style={{
              position: 'absolute',
              bottom: 6,
              left: 14,
              right: 14,
              zIndex: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(254,254,254,0.15)',
              paddingTop: 4,
            }}>
              <div>
                <div style={{
                  fontSize: 6,
                  fontWeight: 800,
                  color: C.white,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}>Hon. Antonio Alindogan</div>
                <div style={{
                  fontSize: 4.5,
                  fontWeight: 500,
                  color: 'rgba(254,254,254,0.65)',
                  textTransform: 'uppercase',
                  marginTop: 1,
                }}>Municipal Mayor</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  height: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: 7,
                    fontStyle: 'italic',
                    color: C.white,
                    fontFamily: 'Georgia, serif',
                    transform: 'rotate(-3deg)',
                    display: 'inline-block',
                    opacity: 0.85,
                  }}>M. Santos</span>
                </div>
                <div style={{
                  fontSize: 4.5,
                  fontWeight: 500,
                  color: 'rgba(254,254,254,0.65)',
                  textTransform: 'uppercase',
                  borderTop: '1px solid rgba(254,254,254,0.3)',
                  paddingTop: 1,
                  marginTop: 1,
                }}>OSCA Head / MSWDO</div>
              </div>
            </div>

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

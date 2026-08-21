import { useState, useEffect } from 'react';
import { SeniorCitizen } from '../../types';
import { signatoriesService, DocumentSignatory } from '../../services/supabaseService';
import { CreditCard, RotateCcw } from 'lucide-react';
import { renderBarcodeBits } from '../../utils/idGenerator';

interface Props {
  senior: SeniorCitizen;
  selectedVariant: 'variant1' | 'variant2';
}

const RA9994_BENEFITS = [
  'Twenty percent (20%) discount and exemption from Value Added Tax (VAT) on the purchase of medicines, food and non-alcoholic beverages in restaurants, and on fees and charges for medical and dental services in private facilities.',
  'Minimum of twenty percent (20%) discount on admission fees charged by theaters, cinema houses and concert halls, circuses, carnivals and other similar places of culture, leisure and amusement.',
  'Exemption from the payment of individual income taxes: provided, that their annual taxable income does not exceed the poverty level as determined by the National Economic and Development Authority (NEDA).',
  'Free medical and dental services in government facilities, including diagnostic and laboratory fees, and professional fees of attending physicians and dentists.',
  'Express lanes in all commercial and government establishments; in the absence thereof, priority shall be given to them.',
];

const BLUE_BANNER = '#0d3b8e';
const C = {
  green:    '#02A952',
  yellow:   '#FDFE00',
  white:    '#FEFEFE',
  blue:     '#0000FD',
  red:      '#FD0000',
  darkText: '#1a1a1a',
} as const;

export default function IDCardFlipInline({ senior, selectedVariant }: Props) {
  const [flipped, setFlipped] = useState(false);

  // Fetch signatories from database
  const [oscaHead, setOscaHead] = useState<{ fullName: string; signatureData: string }>({ fullName: '', signatureData: '' });
  const [mayor, setMayor] = useState<{ fullName: string; signatureData: string }>({ fullName: '', signatureData: '' });

  useEffect(() => {
    signatoriesService.getByDocumentType('id_card').then((data) => {
      const oscaEntry = data.find((s) => s.roleKey === 'osca_head');
      const mayorEntry = data.find((s) => s.roleKey === 'municipal_mayor');
      if (oscaEntry) setOscaHead({ fullName: oscaEntry.fullName, signatureData: oscaEntry.signatureData });
      if (mayorEntry) setMayor({ fullName: mayorEntry.fullName, signatureData: mayorEntry.signatureData });
    }).catch((err) => console.error('Failed to load signatories:', err));
  }, []);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=02A952&data=${encodeURIComponent(
    JSON.stringify({
      osca: senior.oscaNumber,
      name: `${senior.firstName} ${senior.lastName}`,
      barangay: senior.barangay,
      pensioner: senior.pensionBeneficiary,
    })
  )}`;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-4 w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
          <CreditCard size={15} className="text-blue-700" />
          <div>
            <span className="font-bold text-xs uppercase tracking-wide">ID Card Preview</span>
            <span className="ml-2 text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
              {selectedVariant === 'variant1' ? '(Smart Digital ID)' : '(Official Juban Form)'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setFlipped(f => !f)}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 hover:text-blue-900 transition-colors bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5"
        >
          <RotateCcw size={11} />
          {flipped ? 'View Front' : 'View Back'}
        </button>
      </div>

      {/* 3D Flip Card Scene */}
      <div style={{ perspective: '900px', width: '100%', aspectRatio: '340 / 214', maxWidth: 340, alignSelf: 'center' }}>
        <div style={{
          width: '100%', height: '100%', position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>

          {/* ══════════════════════════ FRONT FACE ══════════════════════════ */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            borderRadius: selectedVariant === 'variant1' ? 12 : 10,
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}>
            {selectedVariant === 'variant1' ? (
              /* ── Variant 1 Front ── */
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`,
                padding: 2, boxSizing: 'border-box',
              }}>
                <div style={{
                  width: '100%', height: '100%', background: C.white,
                  borderRadius: 10, overflow: 'hidden', position: 'relative',
                  fontFamily: "'Segoe UI','Inter',sans-serif",
                }}>
                  {/* Top-left accent blobs */}
                  {[
                    { w: 272, h: 182, bg: C.blue, z: 1 },
                    { w: 264, h: 174, bg: C.red,  z: 2 },
                    { w: 258, h: 168, bg: C.yellow,z: 3 },
                    { w: 250, h: 160, bg: C.green, z: 4 },
                  ].map((a, i) => (
                    <div key={i} style={{ position: 'absolute', top: -60, left: -60, width: a.w, height: a.h, background: a.bg, borderBottomRightRadius: '100%', zIndex: a.z }} />
                  ))}
                  {/* Bottom-right accent blobs */}
                  {[
                    { w: 204, h: 134, bg: C.blue,  z: 1 },
                    { w: 198, h: 128, bg: C.red,   z: 2 },
                    { w: 192, h: 122, bg: C.yellow, z: 3 },
                    { w: 184, h: 114, bg: C.green,  z: 4 },
                  ].map((a, i) => (
                    <div key={i} style={{ position: 'absolute', bottom: -50, right: -50, width: a.w, height: a.h, background: a.bg, borderTopLeftRadius: '100%', zIndex: a.z }} />
                  ))}
                  {/* PH Logo watermark */}
                  <img src="/ph_logo.png" alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 190, height: 190, opacity: 0.35, mixBlendMode: 'multiply', pointerEvents: 'none', zIndex: 0 }} />
                  {/* OSCA label */}
                  <div style={{ position: 'absolute', top: 10, left: 14, zIndex: 10, fontSize: 10, fontWeight: 900, color: C.white, letterSpacing: '1px' }}>OSCA</div>
                  {/* Logo + name */}
                  <div style={{ position: 'absolute', top: 8, left: 54, zIndex: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 4, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                      <img src="/juban-logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 7, fontWeight: 800, color: C.white, letterSpacing: '0.5px', lineHeight: 1.1, textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>MUNICIPALITY OF JUBAN</div>
                      <div style={{ fontSize: 5.5, fontWeight: 600, color: 'rgba(254,254,254,0.85)', lineHeight: 1.1, textTransform: 'uppercase' }}>Office of Senior Citizens Affairs</div>
                    </div>
                  </div>
                  {/* OSCA badge top-right */}
                  <div style={{ position: 'absolute', top: 8, right: 12, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ background: C.green, color: C.white, fontSize: 6, fontWeight: 900, padding: '3px 6px', borderRadius: 3, letterSpacing: '1px', lineHeight: 1 }}>OSCA</div>
                    <div style={{ fontSize: 5, color: C.green, fontWeight: 700, marginTop: 1, letterSpacing: '0.3px' }}>SENIOR CITIZEN</div>
                  </div>
                  {/* Photo */}
                  <div style={{ position: 'absolute', top: 38, left: 100, width: 68, height: 78, borderRadius: 8, border: `2.5px solid ${C.green}`, background: '#f0f4f3', overflow: 'hidden', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {senior.profilePhoto
                      ? <img src={senior.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ fontSize: 8, color: C.green, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', lineHeight: 1.3 }}>2x2{'\n'}PHOTO</div>}
                  </div>
                  {/* Name block */}
                  <div style={{ position: 'absolute', top: 40, left: 178, right: 14, zIndex: 10 }}>
                    <div style={{ fontSize: 5.5, fontWeight: 600, color: C.green, textTransform: 'uppercase', letterSpacing: '0.8px', lineHeight: 1, marginBottom: 2 }}>Senior Citizen Name</div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: C.darkText, lineHeight: 1.15, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{senior.firstName} {senior.lastName}</div>
                    <div style={{ fontSize: 7.5, fontWeight: 600, color: C.green, lineHeight: 1.2, marginTop: 2 }}>Brgy. {senior.barangay}</div>
                  </div>
                  {/* OSCA number */}
                  <div style={{ position: 'absolute', top: 82, left: 178, right: 14, zIndex: 10 }}>
                    <div style={{ fontSize: 5, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.6px', lineHeight: 1, marginBottom: 1 }}>OSCA Number</div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: C.green, fontFamily: "'Consolas','SF Mono',monospace", letterSpacing: '0.8px', lineHeight: 1 }}>{senior.oscaNumber}</div>
                  </div>
                  {/* Contact info */}
                  <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}><span style={{ color: '#888', fontWeight: 600 }}>DOB: </span>{senior.birthdate}</span>
                    <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}><span style={{ color: '#888', fontWeight: 600 }}>Sex: </span>{senior.sex}</span>
                    <span style={{ fontSize: 6.5, color: C.darkText, fontWeight: 500 }}>{senior.contactNumber || '(No Phone)'}</span>
                  </div>
                  {/* Signature + issued */}
                  <div style={{ position: 'absolute', bottom: 10, left: 130, right: 60, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ height: 16, width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {senior.signatureData
                        ? <img src={senior.signatureData} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'brightness(0)' }} />
                        : <div style={{ width: '100%', borderBottom: `1px solid ${C.green}`, height: 1 }} />}
                    </div>
                    <div style={{ fontSize: 5, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 1 }}>Signature of Holder</div>
                    <div style={{ fontSize: 5, color: '#888', fontWeight: 500, marginTop: 2 }}>
                      Issued: <span style={{ fontWeight: 700, color: C.darkText }}>{senior.registeredDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Variant 2 Front ── */
              <div style={{ width: '100%', height: '100%', background: '#ffffff', fontFamily: "'Segoe UI','Inter',Arial,sans-serif", position: 'relative' }}>
                <div style={{ position: 'absolute', top: 6, left: 8, width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/juban-logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ position: 'absolute', top: 6, left: 56, right: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: '#000', lineHeight: 1.15 }}>Republic of the Philippines</div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#000', lineHeight: 1.15 }}>Municipality of Juban</div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: '#000', lineHeight: 1.15, marginTop: 1 }}>Office for Senior Citizens Affairs</div>
                </div>
                <div style={{ position: 'absolute', top: 50, right: 10, width: 90, height: 90, border: '1.5px solid #000', background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {senior.profilePhoto
                    ? <img src={senior.profilePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ fontSize: 7.5, fontWeight: 800, color: '#4b5563', textAlign: 'center', lineHeight: 1.3 }}>2×2<br />PHOTO</div>}
                </div>
                <div style={{ position: 'absolute', top: 52, left: 10, right: 108, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 8.5, fontWeight: 900, color: '#000', whiteSpace: 'nowrap' }}>NAME:</span>
                  <div style={{ flex: 1, borderBottom: '1px solid #000', fontSize: 8, fontWeight: 800, color: '#000', paddingBottom: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {senior.lastName}, {senior.firstName} {senior.middleName || ''}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 84, left: 10, right: 108, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 8.5, fontWeight: 900, color: '#000', whiteSpace: 'nowrap' }}>ADDRESS:</span>
                  <div style={{ flex: 1, borderBottom: '1px solid #000', fontSize: 7.5, fontWeight: 800, color: '#000', paddingBottom: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {senior.address || `BRGY. ${senior.barangay.toUpperCase()}, JUBAN, SORSOGON`}
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 116, left: 10, right: 108, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ fontSize: 7.5, fontWeight: 900, color: '#000' }}>DATE OF BIRTH:</span>
                    <span style={{ fontSize: 7.5, fontWeight: 800, color: '#000', borderBottom: '1px solid #000', paddingBottom: 1, paddingRight: 4 }}>{senior.birthdate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ fontSize: 7.5, fontWeight: 900, color: '#000' }}>AGE:</span>
                    <span style={{ fontSize: 7.5, fontWeight: 800, color: '#000', borderBottom: '1px solid #000', paddingBottom: 1, minWidth: 18, textAlign: 'center' }}>{senior.age}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ fontSize: 7.5, fontWeight: 900, color: '#000' }}>SEX:</span>
                    <span style={{ fontSize: 7.5, fontWeight: 800, color: '#000', borderBottom: '1px solid #000', paddingBottom: 1, minWidth: 24, textAlign: 'center', textTransform: 'uppercase' }}>{senior.sex}</span>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 26, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ width: 150, textAlign: 'center' }}>
                    <div style={{ height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {senior.signatureData && <img src={senior.signatureData} alt="" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'brightness(0)' }} />}
                    </div>
                    <div style={{ borderTop: '1px solid #000', paddingTop: 2 }}>
                      <div style={{ fontSize: 5.4, fontWeight: 900, color: '#000', textTransform: 'uppercase' }}>PRINTED NAME AND SIGNATURE / THUMBMARK</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 7.8, fontWeight: 900, color: '#000' }}>I.D. CARD NO.:</span>
                      <span style={{ fontSize: 8, fontWeight: 900, color: '#000', borderBottom: '1px solid #000', minWidth: 65, textAlign: 'center' }}>{senior.oscaNumber}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 7.8, fontWeight: 900, color: '#000' }}>DATE ISSUED:</span>
                      <span style={{ fontSize: 7.8, fontWeight: 800, color: '#000', borderBottom: '1px solid #000', minWidth: 65, textAlign: 'center' }}>{senior.registeredDate}</span>
                    </div>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 22, background: BLUE_BANNER, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                  <span style={{ color: '#fff', fontSize: 6, fontWeight: 900, letterSpacing: '0.4px', textTransform: 'uppercase' }}>THIS CARD IS NON-TRANSFERABLE AND VALID ANYWHERE IN THE COUNTRY</span>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════ BACK FACE ══════════════════════════ */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: selectedVariant === 'variant1' ? 12 : 10,
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}>
            {selectedVariant === 'variant1' ? (
              /* ── Variant 1 Back — identical design to IDCardPreview ── */
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`,
                padding: 2, boxSizing: 'border-box',
              }}>
                <div style={{
                  width: '100%', height: '100%', background: C.green,
                  borderRadius: 10, overflow: 'hidden', position: 'relative',
                  fontFamily: "'Segoe UI','Inter','Poppins',system-ui,sans-serif",
                }}>
                  {/* Top-right accent blobs */}
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 256, height: 176, background: C.blue,              borderBottomLeftRadius: '100%', zIndex: 1 }} />
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 248, height: 168, background: C.red,               borderBottomLeftRadius: '100%', zIndex: 2 }} />
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 242, height: 162, background: C.yellow,            borderBottomLeftRadius: '100%', zIndex: 3 }} />
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 234, height: 154, background: 'rgba(0,0,0,0.15)',  borderBottomLeftRadius: '100%', zIndex: 4 }} />

                  {/* Philippine Sun top-right */}
                  <svg style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, zIndex: 3.5, pointerEvents: 'none' }} viewBox="0 0 100 100">
                    <defs>
                      <g id="flip-ray-back">
                        <polygon points="0,-45 -4,-18 4,-18" fill={C.yellow} />
                        <polygon points="-8,-38 -1,-17 -7,-17" fill={C.yellow} />
                        <polygon points="8,-38 7,-17 1,-17"  fill={C.yellow} />
                      </g>
                    </defs>
                    <circle cx={100} cy={0} r={18} fill={C.yellow} />
                    <use href="#flip-ray-back" transform="translate(100, 0) rotate(-90)" />
                    <use href="#flip-ray-back" transform="translate(100, 0) rotate(-112.5)" />
                    <use href="#flip-ray-back" transform="translate(100, 0) rotate(-135)" />
                    <use href="#flip-ray-back" transform="translate(100, 0) rotate(-157.5)" />
                    <use href="#flip-ray-back" transform="translate(100, 0) rotate(-180)" />
                  </svg>

                  {/* Bottom-left blobs */}
                  <div style={{ position: 'absolute', bottom: -50, left: -50, width: 186, height: 126, background: C.blue,             borderTopRightRadius: '100%', zIndex: 1 }} />
                  <div style={{ position: 'absolute', bottom: -50, left: -50, width: 178, height: 118, background: C.red,              borderTopRightRadius: '100%', zIndex: 2 }} />
                  <div style={{ position: 'absolute', bottom: -50, left: -50, width: 172, height: 112, background: 'rgba(0,0,0,0.12)', borderTopRightRadius: '100%', zIndex: 3 }} />

                  {/* PH Logo watermark */}
                  <img src="/ph_logo.png" alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 190, height: 190, opacity: 0.28, mixBlendMode: 'multiply', pointerEvents: 'none', zIndex: 0 }} />

                  {/* Logo top-left */}
                  <div style={{ position: 'absolute', top: 10, left: 14, zIndex: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                      <img src="/juban-logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 7, fontWeight: 800, color: C.white, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.1 }}>MUNICIPALITY OF JUBAN</div>
                      <div style={{ fontSize: 5.5, fontWeight: 600, color: 'rgba(254,254,254,0.8)', textTransform: 'uppercase', lineHeight: 1.1 }}>OSCA — Sorsogon, Philippines</div>
                    </div>
                  </div>

                  {/* Smart tag indicator top-right */}
                  <div style={{ position: 'absolute', top: 10, right: 14, zIndex: 10, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.yellow, boxShadow: `0 0 4px ${C.yellow}` }} />
                    <span style={{ fontSize: 5, fontWeight: 700, color: C.white, fontFamily: "'Consolas','SF Mono',monospace", letterSpacing: '0.8px', textTransform: 'uppercase' }}>SMART TAG</span>
                  </div>

                  {/* Benefits & Privileges text (matching Variant 2) */}
                  <div style={{ position: 'absolute', top: 36, left: 14, right: 120, zIndex: 10 }}>
                    <div style={{ fontSize: 5.5, fontWeight: 800, color: C.white, textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: 1, marginBottom: 4 }}>BENEFITS & PRIVILEGES UNDER RA 9994</div>
                    <div style={{ fontSize: 5, fontWeight: 400, color: C.white, lineHeight: 1.35, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <p style={{ margin: 0 }}>Free Medical & Dental, Diagnostic & Laboratory Services in all Government Facilities.</p>
                      <p style={{ margin: 0 }}>20% discount in purchase of unbranded generic medicines, discounts in hotels, restaurants, recreation center, theatres, cinema houses & concert halls, discount in Medical & Dental, Diagnostic & Laboratory Services in all private facilities, discount fare for domestic air, sea travel and public land transportation, discount in funeral & burial services.</p>
                      <p style={{ margin: 0 }}>5% discounts for regular retail price of prime necessities & prime commodities monthly utilization of water and electricity.</p>
                      <p style={{ margin: 0 }}>20% discount & VAT exemption, if applicable on the sale of goods & services.</p>
                      <p style={{ margin: 0, fontWeight: 700 }}>Only EXCLUSIVE USE OF SENIOR CITIZENS, abuse of privileges is punishable by law. Persons & Corporations violating RA 9994 shall be penalized.</p>
                    </div>
                  </div>

                  {/* QR Code right side */}
                  <div style={{ position: 'absolute', top: 36, right: 14, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    {/* Yellow seal dot */}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${C.yellow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -2, right: -2, zIndex: 11 }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.yellow }} />
                    </div>
                    {/* QR gradient frame */}
                    <div style={{ width: 74, height: 74, padding: 2, borderRadius: 5, background: `linear-gradient(to right, ${C.red} 0%, ${C.red} 40%, ${C.yellow} 40%, ${C.yellow} 60%, ${C.blue} 60%, ${C.blue} 100%)`, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '100%', height: '100%', background: C.white, borderRadius: 3.5, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img crossOrigin="anonymous" referrerPolicy="no-referrer" src={qrCodeUrl} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 5, fontWeight: 700, color: C.white, textTransform: 'uppercase', letterSpacing: '0.5px' }}>SCAN TO VERIFY</span>
                  </div>

                  {/* Barcode bottom */}
                  <div style={{ position: 'absolute', bottom: 28, left: 14, right: 100, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: 18, background: 'rgba(0,0,0,0.08)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.15)', padding: 2, display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
                      {(() => {
                        const { bars, totalWidth } = renderBarcodeBits(senior.oscaNumber);
                        return (
                          <svg viewBox={`0 0 ${totalWidth} 20`} width="100%" height="100%" preserveAspectRatio="none" style={{ fill: C.white }}>
                            {bars.map((bar, idx) => bar.isBlack ? <rect key={idx} x={bar.x} y={0} width={bar.width} height={20} /> : null)}
                          </svg>
                        );
                      })()}
                    </div>
                    <span style={{ fontSize: 5.5, fontFamily: "'Consolas','SF Mono',monospace", fontWeight: 700, color: 'rgba(254,254,254,0.7)', marginTop: 1, letterSpacing: '0.5px' }}>{senior.oscaNumber}</span>
                  </div>

                  {/* Footer signatures (matching Variant 2) */}
                  <div style={{ position: 'absolute', bottom: 6, left: 14, right: 14, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(254,254,254,0.15)', paddingTop: 4 }}>
                    <div style={{ textAlign: 'center' }}>
                      {oscaHead.signatureData && (
                        <div style={{ height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                          <img src={oscaHead.signatureData} alt="" style={{ maxHeight: '100%', maxWidth: 60, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                        </div>
                      )}
                      <div style={{ borderTop: '1px solid rgba(254,254,254,0.5)', paddingTop: 2 }}>
                        <div style={{ fontSize: 5.5, fontWeight: 800, color: C.white, lineHeight: 1, textTransform: 'uppercase' }}>{oscaHead.fullName || 'OSCA Head'}</div>
                        <div style={{ fontSize: 4.5, fontWeight: 500, color: 'rgba(254,254,254,0.65)', textTransform: 'uppercase', marginTop: 1 }}>OSCA Head</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {mayor.signatureData && (
                        <div style={{ height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                          <img src={mayor.signatureData} alt="" style={{ maxHeight: '100%', maxWidth: 60, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
                        </div>
                      )}
                      <div style={{ borderTop: '1px solid rgba(254,254,254,0.5)', paddingTop: 2 }}>
                        <div style={{ fontSize: 5.5, fontWeight: 800, color: C.white, lineHeight: 1, textTransform: 'uppercase' }}>{mayor.fullName || 'Municipal Mayor'}</div>
                        <div style={{ fontSize: 4.5, fontWeight: 500, color: 'rgba(254,254,254,0.65)', textTransform: 'uppercase', marginTop: 1 }}>Municipal Mayor</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Variant 2 Back ── */
              <div style={{
                width: '100%', height: '100%', background: '#ffffff',
                fontFamily: "'Segoe UI','Inter',Arial,sans-serif",
                position: 'relative', padding: '12px 14px 10px 14px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box',
              }}>
                {/* Title + Benefits */}
                <div>
                  <div style={{ fontSize: 9.2, fontWeight: 900, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.2px', textAlign: 'left', marginBottom: 6 }}>
                    BENEFITS &amp; PRIVILEGES UNDER REPUBLIC ACT NO.9994
                  </div>
                  <div style={{ fontSize: 6.5, fontWeight: 500, color: '#000000', lineHeight: 1.35, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <p style={{ margin: 0 }}>
                      Free Medical &amp; Dental, Diagnostic &amp; Laboratory Services in all Government Facilities.
                    </p>
                    <p style={{ margin: 0 }}>
                      20% discount in purchase of unbranded generic medicines, discounts in hotels, restaurants, recreation center, theatres, cinema houses &amp; concert halls, discount in Medical &amp; Dental, Diagnostic &amp; Laboratory Services in all private facilities, discount fare for domestic air, sea travel and public land transportation, discount in funeral &amp; burial services.
                    </p>
                    <p style={{ margin: 0 }}>
                      5% discounts for regular retail price of prime necessities &amp; prime commodities monthly utilization of water and electricity.
                    </p>
                    <p style={{ margin: 0 }}>
                      20% discount &amp; VAT exemption, if applicable on the sale of goods &amp; services.
                    </p>
                    <p style={{ margin: 0, fontWeight: 700 }}>
                      Only EXCLUSIVE USE OF SENIOR CITIZENS, abuse of privileges is punishable by law. Persons &amp; Corporations violating RA 9994 shall be penalized.
                    </p>
                  </div>
                </div>

                {/* Signatures Row at Bottom */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: 4, width: '100%' }}>
                  <div style={{ textAlign: 'center', width: 105 }}>
                    {oscaHead.signatureData && (
                      <div style={{ height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                        <img src={oscaHead.signatureData} alt="" style={{ maxHeight: '100%', maxWidth: 70, objectFit: 'contain', filter: 'brightness(0)' }} />
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #000', paddingTop: 2 }}>
                      <div style={{ fontSize: 6.5, fontWeight: 800, color: '#000', textTransform: 'uppercase' }}>{oscaHead.fullName || 'OSCA Head'}</div>
                      <div style={{ fontSize: 5.5, fontWeight: 600, color: '#444', textTransform: 'uppercase' }}>OSCA Head</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', width: 105 }}>
                    {mayor.signatureData && (
                      <div style={{ height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                        <img src={mayor.signatureData} alt="" style={{ maxHeight: '100%', maxWidth: 70, objectFit: 'contain', filter: 'brightness(0)' }} />
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #000', paddingTop: 2 }}>
                      <div style={{ fontSize: 6.5, fontWeight: 800, color: '#000', textTransform: 'uppercase' }}>{mayor.fullName || 'Municipal Mayor'}</div>
                      <div style={{ fontSize: 5.5, fontWeight: 600, color: '#444', textTransform: 'uppercase' }}>Municipal Mayor</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[10px] text-slate-400 font-medium -mt-1">
        {flipped ? 'Likod ng ID Card (Back)' : 'Harap ng ID Card (Front)'}
        {' · '}
        <span className="font-semibold text-slate-500">{selectedVariant === 'variant1' ? 'Variant 1' : 'Variant 2'}</span>
      </p>
    </div>
  );
}

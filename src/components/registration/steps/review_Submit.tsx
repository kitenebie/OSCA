import React from 'react';
import { User, Fingerprint } from 'lucide-react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
  previewOscaNumber: string;
}

const ReviewField = ({ label, value }: { label: string; value: any }) => (
  <div>
    <span className="text-xs text-slate-400 uppercase tracking-wider block">{label}</span>
    <strong className="text-slate-800 text-sm">{value || 'N/A'}</strong>
  </div>
);

const ReviewSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
    <h6 className="font-bold text-xs text-teal-700 uppercase tracking-wider border-b border-slate-200 pb-1.5">{title}</h6>
    {children}
  </div>
);

const TagList = ({ items }: { items: string[] }) => (
  items?.length > 0 ? (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span key={i} className="px-2 py-0.5 bg-teal-50 border border-teal-100 rounded-lg text-xs text-teal-700 font-medium">{item}</span>
      ))}
    </div>
  ) : <span className="text-xs text-slate-400 italic">None</span>
);

/** Signature display helper — removes white background with mix-blend-mode */
const SignaturePreview = ({ src, alt }: { src: string | null | undefined; alt: string }) => (
  src ? (
    <img
      src={src}
      alt={alt}
      className="h-10 border border-slate-200 rounded-lg p-1"
      style={{ mixBlendMode: 'darken', background: 'transparent' }}
    />
  ) : (
    <span className="text-xs text-slate-400 italic">No signature</span>
  )
);

export default function ReviewSubmit({ form, setForm, previewOscaNumber }: StepProps) {
  return (
    <div className="space-y-6 max-w-full animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">Review & Submit</h5>
          <p className="text-sm text-slate-400">Carefully review all details below before submitting.</p>
        </div>
        <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">Step 11 of 11</span>
      </div>

      {/* OSCA ID Banner */}
      <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs text-teal-700 uppercase tracking-wider block font-bold">Generated OSCA ID</span>
          <strong className="text-teal-900 font-mono text-sm tracking-wide uppercase">{previewOscaNumber}</strong>
        </div>
        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-teal-600 text-white uppercase">Auto-generated</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ===== I. IDENTIFYING INFORMATION ===== */}
        <div className="md:col-span-2">
        <ReviewSection title="I. Identifying Information">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <ReviewField label="Last Name" value={form.lastName} />
            <ReviewField label="First Name" value={form.firstName} />
            <ReviewField label="Middle Name" value={form.middleName} />
            <ReviewField label="Suffix" value={form.suffix} />
            <ReviewField label="Birthdate" value={form.birthdate} />
            <ReviewField label="Sex" value={form.sex} />
            <ReviewField label="Civil Status" value={form.civilStatus} />
            <ReviewField label="Blood Type" value={form.bloodType} />
            <ReviewField label="Religion" value={form.religion} />
            <ReviewField label="Ethnic Origin" value={form.ethnicOrigin} />
            <ReviewField label="Language" value={form.languageSpoken} />
            <ReviewField label="Mobile No." value={form.contactNumber} />
            <ReviewField label="Telephone" value={form.telephone} />
            <ReviewField label="Email" value={form.emailAddress} />
            <div className="col-span-2 md:col-span-4">
              <ReviewField label="Address" value={form.streetAddress} />
            </div>
            <ReviewField label="Barangay" value={form.barangay} />
            <ReviewField label="City/Town" value={form.cityTown} />
            <ReviewField label="Province" value={form.province} />
            <ReviewField label="Region" value={form.region} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
            <ReviewField label="GSIS" value={form.gsis} />
            <ReviewField label="SSS" value={form.sss} />
            <ReviewField label="TIN" value={form.tin} />
            <ReviewField label="PhilHealth" value={form.philHealth} />
            <ReviewField label="SC Assoc/Org ID" value={form.scAssocOrgId} />
            <ReviewField label="Other Govt ID" value={form.otherGovtId} />
            <ReviewField label="Employment" value={form.employmentStatus} />
            <ReviewField label="Classification" value={form.classification} />
            <ReviewField label="Pension" value={form.monthlyPension} />
            <ReviewField label="Education" value={form.highestEducationalAttainment} />
            <ReviewField label="Can Travel?" value={form.capabilityToTravel ? 'Yes' : 'No'} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
            <ReviewField label="Emergency Contact" value={form.emergencyContactName} />
            <ReviewField label="Emergency Phone" value={form.emergencyContactPhone} />
          </div>
        </ReviewSection>
        </div>

        {/* ===== II. FAMILY COMPOSITION ===== */}
        <ReviewSection title="II. Family Composition">
          <div className="grid grid-cols-2 gap-2">
            <ReviewField label="Spouse" value={[form.spouseFirstName, form.spouseMiddleName, form.spouseLastName, form.spouseExtension].filter(Boolean).join(' ') || 'N/A'} />
            <ReviewField label="Father" value={[form.fatherFirstName, form.fatherMiddleName, form.fatherLastName, form.fatherExtension].filter(Boolean).join(' ') || 'N/A'} />
            <div className="col-span-2">
              <ReviewField label="Mother" value={[form.motherFirstName, form.motherMiddleName, form.motherLastName].filter(Boolean).join(' ') || 'N/A'} />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Children ({form.children?.length || 0})</span>
            {form.children?.length > 0 ? form.children.map((c: any, i: number) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2 p-2 bg-white rounded-lg border border-slate-100">
                <ReviewField label="Name" value={c.name} />
                <ReviewField label="Contact Number" value={c.contactNumber} />
                <ReviewField label="Occupation" value={c.occupation} />
                <ReviewField label="Income" value={c.income} />
                <ReviewField label="Age" value={c.age} />
              </div>
            )) : <span className="text-xs text-slate-400 italic">None</span>}
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Dependents ({form.dependents?.length || 0})</span>
            {form.dependents?.length > 0 ? form.dependents.map((d: any, i: number) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2 p-2 bg-white rounded-lg border border-slate-100">
                <ReviewField label="Name" value={d.name} />
                <ReviewField label="Occupation" value={d.occupation} />
                <ReviewField label="Income" value={d.income} />
                <ReviewField label="Age" value={d.age} />
                <ReviewField label="Status" value={d.workingStatus} />
              </div>
            )) : <span className="text-xs text-slate-400 italic">None</span>}
          </div>
        </ReviewSection>

        {/* ===== III. EDUCATION / HR PROFILE ===== */}
        <ReviewSection title="III. Education / HR Profile">
          <ReviewField label="Education" value={form.highestEducationalAttainment} />
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Specializations</span>
            <TagList items={form.specializations} />
          </div>
          {form.specOthersText && <ReviewField label="Other Specialization" value={form.specOthersText} />}
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Skills to Share</span>
            <p className="text-xs text-slate-700">{form.shareSkills?.filter(Boolean).join(', ') || 'None'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Community Services</span>
            <TagList items={form.communityServices} />
          </div>
          {form.commOthersText && <ReviewField label="Other Services" value={form.commOthersText} />}
        </ReviewSection>

        {/* ===== IV. DEPENDENCY PROFILE ===== */}
        <ReviewSection title="IV. Dependency Profile">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Living With</span>
            <TagList items={form.livingWith} />
          </div>
          {form.livingOthersText && <ReviewField label="Others" value={form.livingOthersText} />}
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Household Condition</span>
            <TagList items={form.householdCondition} />
          </div>
          {form.householdOthersText && <ReviewField label="Others" value={form.householdOthersText} />}
        </ReviewSection>

        {/* ===== V. ECONOMIC PROFILE ===== */}
        <ReviewSection title="V. Economic Profile">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Income Sources</span>
            <TagList items={form.incomeSources} />
          </div>
          {form.incomeOthersText && <ReviewField label="Others" value={form.incomeOthersText} />}
          <ReviewField label="Monthly Income Range" value={form.monthlyIncomeRange} />
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Real Properties</span>
            <TagList items={form.realProperties} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Movable Properties</span>
            <TagList items={form.movableProperties} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Problems/Needs</span>
            <TagList items={form.problemsNeeds} />
          </div>
        </ReviewSection>

        {/* ===== VI. HEALTH PROFILE ===== */}
        <ReviewSection title="VI. Health Profile">
          <div className="grid grid-cols-2 gap-2">
            <ReviewField label="Blood Type" value={form.bloodType} />
            <ReviewField label="Physical Disability" value={form.physicalDisability ? `Yes — ${form.physicalDisabilityText || 'Unspecified'}` : 'No'} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Medical Concerns</span>
            <TagList items={form.medicalConcerns} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Dental</span>
            <TagList items={form.dentalConcerns} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Optical</span>
            <TagList items={form.opticalConcerns} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Hearing</span>
            <TagList items={form.hearingConcerns} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Social/Emotional</span>
            <TagList items={form.socialEmotional} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Area of Difficulty</span>
            <TagList items={form.areaDifficulty} />
          </div>
          <ReviewField label="Checkup Frequency" value={form.checkupFrequency} />
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Medicines</span>
            {form.medicines?.filter((m: any) => m.name).length > 0 ? form.medicines.filter((m: any) => m.name).map((m: any, i: number) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 p-2 bg-white rounded-lg border border-slate-100">
                <ReviewField label="Medicine Name" value={m.name} />
                <ReviewField label="Dosage" value={m.dosage} />
                <ReviewField label="Notes" value={m.notes} />
              </div>
            )) : <span className="text-xs text-slate-400 italic">None</span>}
          </div>
        </ReviewSection>

        {/* ===== VII & VIII. BIOMETRICS ===== */}
        <ReviewSection title="VII–VIII. Biometrics & Signature">
          <div className="grid grid-cols-3 gap-4">
            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Profile Photo</span>
            {form.profilePhoto ? (
                <img src={form.profilePhoto} alt="Profile" className="w-32 h-32 rounded-xl object-cover border-2 border-teal-200 shadow-md" />
            ) : (
                <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <User size={32} className="text-slate-300" />
              </div>
            )}
            </div>

            {/* Signature */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Signature</span>
              {form.signatureData ? (
                <img src={form.signatureData} alt="Signature" className="w-full h-32 object-contain border-2 border-slate-200 rounded-xl p-2 bg-white" style={{ mixBlendMode: 'darken' }} />
              ) : (
                <div className="w-full h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <span className="text-xs text-slate-400 italic">No signature</span>
                </div>
              )}
            </div>

            {/* Thumbprint */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Thumbprint</span>
                {form.fingerprintTemplate && (form.fingerprintTemplate.startsWith('data:') || form.fingerprintTemplate.startsWith('http')) ? (
                <img src={form.fingerprintTemplate} alt="Thumbprint" className="w-32 h-32 object-contain border-2 border-slate-200 rounded-xl p-1.5 bg-white" />
                ) : (
                <div className="w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1">
                  <Fingerprint size={28} className="text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 text-center">
                      {form.fingerprintTemplate ? 'Fingerprint Enrolled ✓' : 'No Fingerprint'}
                    </span>
                </div>
                )}
            </div>
          </div>

          {form.validIdPhoto && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Valid ID</span>
              <img src={form.validIdPhoto} alt="Valid ID" className="w-full h-56 object-cover rounded-xl border-2 border-slate-200 shadow-sm" />
            </div>
          )}
        </ReviewSection>

        {/* ===== IX. ASSISTING PERSON ===== */}
        <ReviewSection title="IX. Assisting Person">
          <div className="grid grid-cols-2 gap-2">
            <ReviewField label="Person 1" value={form.assistingPerson1Name} />
            <ReviewField label="Relationship" value={form.assistingPerson1Relationship} />
            <ReviewField label="Person 2" value={form.assistingPerson2Name} />
            <ReviewField label="Relationship" value={form.assistingPerson2Relationship} />
          </div>
          {/* Signatures */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">AP1 Signature</span>
              <SignaturePreview src={form.assistingPerson1Signature} alt="AP1 Signature" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">AP2 Signature</span>
              <SignaturePreview src={form.assistingPerson2Signature} alt="AP2 Signature" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Interviewer Signature</span>
              <SignaturePreview src={form.interviewerSignature} alt="Interviewer Signature" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <ReviewField label="Interviewer" value={form.interviewerName} />
            <ReviewField label="Organization" value={form.interviewerOrganization} />
            <ReviewField label="Date" value={form.interviewDate} />
            <ReviewField label="Place" value={form.interviewPlace} />
          </div>
        </ReviewSection>

        {/* ===== X. DISASTER RISK ===== */}
        <ReviewSection title="X. Disaster Risk Info">
          <div className="grid grid-cols-2 gap-2">
            <ReviewField label="In Risk Area?" value={form.inRiskArea === 'yes' ? 'Yes' : 'No'} />
            {form.inRiskArea === 'yes' && (
              <>
                <ReviewField label="Risk Type" value={form.riskType} />
                <ReviewField label="Severity" value={form.riskSeverity} />
                <ReviewField label="Details" value={form.riskDetails} />
              </>
            )}
          </div>
        </ReviewSection>
      </div>
    </div>
  );
}

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
        <ReviewSection title="I. Identifying Information">
          <div className="grid grid-cols-2 gap-2">
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
            <div className="col-span-2">
              <ReviewField label="Address" value={form.streetAddress} />
            </div>
            <ReviewField label="Barangay" value={form.barangay} />
            <ReviewField label="City/Town" value={form.cityTown} />
            <ReviewField label="Province" value={form.province} />
            <ReviewField label="Region" value={form.region} />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
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
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <ReviewField label="Emergency Contact" value={form.emergencyContactName} />
            <ReviewField label="Emergency Phone" value={form.emergencyContactPhone} />
          </div>
        </ReviewSection>

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
              <p key={i} className="text-xs text-slate-700">{c.name || 'Unnamed'} — Age: {c.age || '?'}, {c.occupation || 'N/A'}</p>
            )) : <span className="text-xs text-slate-400 italic">None</span>}
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Dependents ({form.dependents?.length || 0})</span>
            {form.dependents?.length > 0 ? form.dependents.map((d: any, i: number) => (
              <p key={i} className="text-xs text-slate-700">{d.name || 'Unnamed'} — Age: {d.age || '?'}, {d.occupation || 'N/A'}</p>
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
              <p key={i} className="text-xs text-slate-700">{m.name} — {m.dosage || 'no dosage'} {m.notes ? `(${m.notes})` : ''}</p>
            )) : <span className="text-xs text-slate-400 italic">None</span>}
          </div>
        </ReviewSection>

        {/* ===== VII & VIII. BIOMETRICS ===== */}
        <ReviewSection title="VII–VIII. Biometrics & Signature">
          <div className="flex items-start gap-4">
            {form.profilePhoto ? (
              <img src={form.profilePhoto} alt="Profile" className="w-20 h-20 rounded-xl object-cover border-2 border-teal-200 shadow-sm" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center">
                <User size={20} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Signature</span>
                {form.signatureData ? (
                  <img src={form.signatureData} alt="Signature" className="h-10 bg-white border border-slate-200 rounded-lg p-1" />
                ) : (
                  <span className="text-xs text-slate-400 italic">No signature</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Fingerprint size={12} className="text-teal-600" />
                <span className="text-xs font-bold text-slate-600">
                  {form.fingerprintTemplate ? 'Fingerprint Enrolled ✓' : 'No Fingerprint'}
                </span>
              </div>
            </div>
          </div>
          {form.validIdPhoto && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Valid ID</span>
              <img src={form.validIdPhoto} alt="Valid ID" className="w-full h-24 object-cover rounded-xl border border-slate-200" />
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

import React from 'react';
import { capitalizeInput } from '../../../utils/capitalizeInput';
import { Trash } from 'lucide-react';

interface StepProps {
  form: any;
  setForm: (f: any) => void;
}

export default function FamilyComposition({ form, setForm }: StepProps) {
  return (
    <div className="space-y-6 max-w-full animate-fadeIn">

              <div className="border-b border-slate-100 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>

                  <h5 className="font-bold text-base text-slate-800 uppercase tracking-wide">II. Family Composition</h5>

                  <p className="text-sm text-slate-400">Spouse, parents, children, and other dependents of the senior citizen.</p>

                </div>

                <div className="flex items-center gap-2">

                  <span className="text-[13px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-mono">

                    Step 2 of 10

                  </span>

                </div>

              </div>

              <div className="space-y-5">

                {/* Spouse */}

                <div>

                  <p className="text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">21. Name of Spouse (if applicable)</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                    <input type="text" value={form.spouseLastName} onChange={(e) => setForm({ ...form, spouseLastName: capitalizeInput(e.target.value) })} placeholder="Last Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                    <input type="text" value={form.spouseFirstName} onChange={(e) => setForm({ ...form, spouseFirstName: capitalizeInput(e.target.value) })} placeholder="First Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                    <input type="text" value={form.spouseMiddleName} onChange={(e) => setForm({ ...form, spouseMiddleName: capitalizeInput(e.target.value) })} placeholder="Middle Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                    <input type="text" value={form.spouseExtension} onChange={(e) => setForm({ ...form, spouseExtension: capitalizeInput(e.target.value) })} placeholder="Ext. (Jr/Sr)" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                  </div>

                </div>

                {/* Father */}

                <div>

                  <p className="text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">22. Father's Name</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                    <input type="text" value={form.fatherLastName} onChange={(e) => setForm({ ...form, fatherLastName: capitalizeInput(e.target.value) })} placeholder="Last Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                    <input type="text" value={form.fatherFirstName} onChange={(e) => setForm({ ...form, fatherFirstName: capitalizeInput(e.target.value) })} placeholder="First Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                    <input type="text" value={form.fatherMiddleName} onChange={(e) => setForm({ ...form, fatherMiddleName: capitalizeInput(e.target.value) })} placeholder="Middle Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                    <input type="text" value={form.fatherExtension} onChange={(e) => setForm({ ...form, fatherExtension: capitalizeInput(e.target.value) })} placeholder="Ext." className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                  </div>

                </div>

                {/* Mother */}

                <div>

                  <p className="text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wide">23. Mother's Maiden Name</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                    <input type="text" value={form.motherLastName} onChange={(e) => setForm({ ...form, motherLastName: capitalizeInput(e.target.value) })} placeholder="Last Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                    <input type="text" value={form.motherFirstName} onChange={(e) => setForm({ ...form, motherFirstName: capitalizeInput(e.target.value) })} placeholder="First Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                    <input type="text" value={form.motherMiddleName} onChange={(e) => setForm({ ...form, motherMiddleName: capitalizeInput(e.target.value) })} placeholder="Middle Name" className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                  </div>

                </div>

                {/* Children Repeater */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">24. Children</p>

                    <button type="button" onClick={() => setForm({ ...form, children: [...form.children, { name: '', contactNumber: '', occupation: '', income: '', age: '', workingStatus: '' }] })} className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100 hover:bg-teal-100 transition-all cursor-pointer">+ Add Child</button>

                  </div>

                  {form.children.length === 0 && <p className="text-[13px] text-slate-400 italic">No children added yet.</p>}

                  {form.children.map((child: any, idx: number) => (

                    <div key={idx} className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2 items-end">

                      <input type="text" value={child.name} onChange={(e) => { const c = [...form.children]; c[idx] = { ...c[idx], name: capitalizeInput(e.target.value) }; setForm({ ...form, children: c }); }} placeholder="Full Name" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <input type="text" value={child.contactNumber} onChange={(e) => { const c = [...form.children]; c[idx] = { ...c[idx], contactNumber: capitalizeInput(e.target.value) }; setForm({ ...form, children: c }); }} placeholder="Contact Number" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <input type="text" value={child.occupation} onChange={(e) => { const c = [...form.children]; c[idx] = { ...c[idx], occupation: capitalizeInput(e.target.value) }; setForm({ ...form, children: c }); }} placeholder="Occupation" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <input type="text" value={child.income} onChange={(e) => { const c = [...form.children]; c[idx] = { ...c[idx], income: capitalizeInput(e.target.value) }; setForm({ ...form, children: c }); }} placeholder="Income" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <input type="number" value={child.age} onChange={(e) => { const c = [...form.children]; c[idx] = { ...c[idx], age: capitalizeInput(e.target.value) }; setForm({ ...form, children: c }); }} placeholder="Age" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <button type="button" onClick={() => { const c = [...form.children]; c.splice(idx, 1); setForm({ ...form, children: c }); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"><Trash size={12} /></button>

                    </div>

                  ))}

                </div>

                {/* Dependents Repeater */}

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wide">25. Other Dependents</p>

                    <button type="button" onClick={() => setForm({ ...form, dependents: [...form.dependents, { name: '', occupation: '', income: '', age: '', workingStatus: '' }] })} className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100 hover:bg-teal-100 transition-all cursor-pointer">+ Add Dependent</button>

                  </div>

                  {form.dependents.length === 0 && <p className="text-[13px] text-slate-400 italic">No dependents added yet.</p>}

                  {form.dependents.map((dep: any, idx: number) => (

                    <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2 items-end">

                      <input type="text" value={dep.name} onChange={(e) => { const d = [...form.dependents]; d[idx] = { ...d[idx], name: capitalizeInput(e.target.value) }; setForm({ ...form, dependents: d }); }} placeholder="Full Name" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <input type="text" value={dep.occupation} onChange={(e) => { const d = [...form.dependents]; d[idx] = { ...d[idx], occupation: capitalizeInput(e.target.value) }; setForm({ ...form, dependents: d }); }} placeholder="Occupation" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <input type="text" value={dep.income} onChange={(e) => { const d = [...form.dependents]; d[idx] = { ...d[idx], income: capitalizeInput(e.target.value) }; setForm({ ...form, dependents: d }); }} placeholder="Income" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <input type="number" value={dep.age} onChange={(e) => { const d = [...form.dependents]; d[idx] = { ...d[idx], age: capitalizeInput(e.target.value) }; setForm({ ...form, dependents: d }); }} placeholder="Age" className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold focus:ring-1 focus:ring-teal-500 focus:outline-none" tabIndex={0} />

                      <button type="button" onClick={() => { const d = [...form.dependents]; d.splice(idx, 1); setForm({ ...form, dependents: d }); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"><Trash size={12} /></button>

                    </div>

                  ))}
                </div>
              </div>
            </div>
  );
}

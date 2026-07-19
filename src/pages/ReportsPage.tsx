import React from 'react';
import ReportGenerator from '../components/reports/ReportGenerator';

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Page Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm md:text-base">Census Reports at MSWDO Audit Sheets</h4>
        <p className="text-[11px] text-slate-400">Generate Master lists, Demographic audits, and DSWD Pension Disbursement sheets</p>
      </div>

      {/* Main generator content */}
      <ReportGenerator />

    </div>
  );
}

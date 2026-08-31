// ============================================================
// Certification (DSWD Pension) DOCX Generator
// ============================================================
// Uses docxtemplater + pizzip to fill BLANK-FORM-CERTIFICATION.docx
// with senior citizen and signatory data.
// ============================================================

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export interface CertificationData {
  Person_Name: string;
  Age: string;
  Barangay: string;
  Program: string;
  Day: string;
  Day_Suffix: string;
  Month_Year: string;
  OSCA_Head_Name: string;
  MSWDO_Head_Name: string;
  MSWDO_Head_Position: string;
  License_No: string;
}

async function loadTemplate(): Promise<ArrayBuffer> {
  const res = await fetch('/docs/BLANK-FORM-CERTIFICATION.docx?v=' + Date.now());
  if (!res.ok) throw new Error(`Failed to load Certification template: ${res.status} ${res.statusText}`);
  return await res.arrayBuffer();
}

/**
 * Generate a filled Certification DOCX from the template.
 */
export async function generateCertificationDocx(data: CertificationData): Promise<Blob> {
  const templateBuffer = await loadTemplate();
  const zip = new PizZip(templateBuffer.slice(0));

  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData(data);
  doc.render();

  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/**
 * Trigger browser download of the generated DOCX blob.
 */
export function downloadCertificationDocx(blob: Blob, filename = 'Certification.docx') {
  saveAs(blob, filename);
}

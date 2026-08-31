// ============================================================
// Certificate of Transfer DOCX Generator
// ============================================================
// Uses docxtemplater + pizzip to fill BLANK-FORM-CERTIFICATE-OF-TRANSFER.docx
// with real senior data and signatory info.
// ============================================================

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export interface CertificateTransferData {
  Person_Name: string;
  Age: string;
  Brgy: string;
  Address: string;
  Transferred_Place: string;
  Transfer_Address: string;
  Osca_Id_No: string;
  Date_Issued: string;
  Day: string;
  Month_Year: string;
  OSCA_Head_Name: string;
  Acting_Head_Name: string;
  License_No: string;
  Acting_Position: string;
}


async function loadTemplate(): Promise<ArrayBuffer> {
  // Cache-bust to ensure latest template is loaded
  const res = await fetch('/docs/BLANK-FORM-CERTIFICATE-OF-TRANSFER.docx?v=' + Date.now());
  if (!res.ok) throw new Error(`Failed to load template: ${res.status} ${res.statusText}`);
  return await res.arrayBuffer();
}

/**
 * Generate a filled Certificate of Transfer DOCX from the template.
 */
export async function generateCertificateTransferDocx(data: CertificateTransferData): Promise<Blob> {
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
export function downloadCertificateTransferDocx(blob: Blob, filename = 'Certificate-of-Transfer.docx') {
  saveAs(blob, filename);
}

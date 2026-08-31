// ============================================================
// MSWDO Transmittal DOCX Generator
// ============================================================
// Uses docxtemplater + pizzip to fill BLANK-FORM-MSWDO-TRANSMITTAL.docx
// with signatory and content data.
// ============================================================

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export interface MswdoTransmittalData {
  Date: string;
  Recipient_Name: string;
  Recipient_Position: string;
  Recipient_Address: string;
  Dear_Name: string;
  Body: string;
  MSWDO_Head_Name: string;
  MSWDO_Head_Position: string;
  Noted_By_Name: string;
  Noted_By_Position: string;
}

async function loadTemplate(): Promise<ArrayBuffer> {
  const res = await fetch('/docs/BLANK-FORM-MSWDO-TRANSMITTAL.docx?v=' + Date.now());
  if (!res.ok) throw new Error(`Failed to load MSWDO template: ${res.status} ${res.statusText}`);
  return await res.arrayBuffer();
}

/**
 * Generate a filled MSWDO Transmittal DOCX from the template.
 */
export async function generateMswdoTransmittalDocx(data: MswdoTransmittalData): Promise<Blob> {
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
export function downloadMswdoTransmittalDocx(blob: Blob, filename = 'MSWDO-Transmittal.docx') {
  saveAs(blob, filename);
}

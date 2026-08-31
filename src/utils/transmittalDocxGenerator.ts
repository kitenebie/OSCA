// ============================================================
// OSCA Transmittal DOCX Generator + PDF Export
// ============================================================
// Uses docxtemplater + pizzip for DOCX, file-saver for download.
// ============================================================

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export interface BarangayRow {
  name: string;
  count: string;
}

export interface TransmittalData {
  NCSC_Reg_Director: string;
  OSCA_Head: string;
  Acting_MSWDO: string;
  Receiver_Name: string;
  barangayRows: BarangayRow[];
}

// Cache the template so we only fetch once
let cachedTemplate: ArrayBuffer | null = null;

async function loadTemplate(): Promise<ArrayBuffer> {
  if (cachedTemplate) return cachedTemplate;
  // Cache-bust to ensure latest template is loaded
  const res = await fetch('/docs/BLANK-FORM-TRANSMITAL.docx?v=' + Date.now());
  if (!res.ok) throw new Error(`Failed to load template: ${res.status} ${res.statusText}`);
  cachedTemplate = await res.arrayBuffer();
  return cachedTemplate;
}

function buildTableRowXml(barangay: string, count: string): string {
  return `<w:tr>
    <w:tc>
      <w:tcPr><w:tcW w:w="4788" w:type="dxa"/><w:tcBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      </w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr>
          <w:t>${escapeXml(barangay)}</w:t>
        </w:r>
      </w:p>
    </w:tc>
    <w:tc>
      <w:tcPr><w:tcW w:w="4788" w:type="dxa"/><w:tcBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      </w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr>
          <w:t>${escapeXml(count)}</w:t>
        </w:r>
      </w:p>
    </w:tc>
  </w:tr>`;
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Generate a filled OSCA Transmittal DOCX from the template.
 */
export async function generateTransmittalDocx(data: TransmittalData): Promise<Blob> {
  const templateBuffer = await loadTemplate();
  const zip = new PizZip(templateBuffer.slice(0));

  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData({
    NCSC_Reg_Director: data.NCSC_Reg_Director,
    OSCA_Head: data.OSCA_Head,
    Acting_MSWDO: data.Acting_MSWDO,
    Receiver_Name: data.Receiver_Name,
  });
  doc.render();

  const renderedZip = doc.getZip();
  const documentXml = renderedZip.file('word/document.xml')?.asText();
  if (documentXml) {
    const tblStart = documentXml.indexOf('<w:tbl>');
    const tblEnd = documentXml.indexOf('</w:tbl>');
    if (tblStart !== -1 && tblEnd !== -1) {
      const tableXml = documentXml.substring(tblStart, tblEnd + '</w:tbl>'.length);
      const firstTrEnd = tableXml.indexOf('</w:tr>') + '</w:tr>'.length;
      const headerPart = tableXml.substring(0, firstTrEnd);
      const tblPrMatch = tableXml.match(/<w:tblPr>[\s\S]*?<\/w:tblPr>/);
      const tblGridMatch = tableXml.match(/<w:tblGrid>[\s\S]*?<\/w:tblGrid>/);

      const rows = data.barangayRows.length > 0
        ? data.barangayRows
        : [{ name: '', count: '' }];

      const newRowsXml = rows.map(r => buildTableRowXml(r.name, r.count)).join('\n');
      const newTableXml = `<w:tbl>${tblPrMatch ? tblPrMatch[0] : ''}${tblGridMatch ? tblGridMatch[0] : ''}${headerPart.replace(/<w:tbl>/, '').replace(/<w:tblPr>[\s\S]*?<\/w:tblPr>/, '').replace(/<w:tblGrid>[\s\S]*?<\/w:tblGrid>/, '')}${newRowsXml}</w:tbl>`;

      const updatedXml = documentXml.substring(0, tblStart) + newTableXml + documentXml.substring(tblEnd + '</w:tbl>'.length);
      renderedZip.file('word/document.xml', updatedXml);
    }
  }

  return renderedZip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/**
 * Trigger browser download of the generated DOCX blob.
 */
export function downloadTransmittalDocx(blob: Blob, filename = 'OSCA-Transmittal.docx') {
  saveAs(blob, filename);
}

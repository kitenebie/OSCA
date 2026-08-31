// ============================================================
// PhilHealth Transmittal DOCX Generator
// ============================================================

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export interface PhilHealthSenior {
  no: number;
  fullName: string;
  sex: string;
  birthdate: string;
  civilStatus: string;
}

export interface PhilHealthTransmittalData {
  address: string;
  barangay: string;
  OSCA_Head: string;
  seniors: PhilHealthSenior[];
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildDataRowXml(s: PhilHealthSenior): string {
  const cells = [
    `${s.no}.`,
    s.fullName.toUpperCase(),
    s.sex === 'Male' ? 'M' : 'F',
    s.birthdate,
    s.civilStatus,
  ];

  const widths = ['600', '3600', '800', '1200', '800'];
  const aligns = ['center', 'left', 'center', 'center', 'center'];

  const cellXmls = cells.map((text, idx) => `<w:tc>
    <w:tcPr><w:tcW w:w="${widths[idx]}" w:type="dxa"/><w:tcBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    </w:tcBorders></w:tcPr>
    <w:p><w:pPr><w:jc w:val="${aligns[idx]}"/></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/></w:rPr>
        <w:t>${escapeXml(text)}</w:t>
      </w:r>
    </w:p>
  </w:tc>`);

  return `<w:tr>${cellXmls.join('')}</w:tr>`;
}

async function loadTemplate(): Promise<ArrayBuffer> {
  const res = await fetch('/docs/BLANK-FORM-TRANSMITAL-PHILHEALTH.docx?v=' + Date.now());
  if (!res.ok) throw new Error(`Failed to load template: ${res.status} ${res.statusText}`);
  return await res.arrayBuffer();
}

export async function generatePhilHealthTransmittalDocx(data: PhilHealthTransmittalData): Promise<Blob> {
  const templateBuffer = await loadTemplate();
  const zip = new PizZip(templateBuffer.slice(0));

  // Step 1: Fill text placeholders
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData({
    address: data.address,
    barangay: data.barangay,
    OSCA_Head: data.OSCA_Head,
  });
  doc.render();

  // Step 2: Replace static table rows with dynamic senior data
  const renderedZip = doc.getZip();
  const documentXml = renderedZip.file('word/document.xml')?.asText();
  if (documentXml && data.seniors.length > 0) {
    const tblStart = documentXml.indexOf('<w:tbl>');
    const tblEnd = documentXml.indexOf('</w:tbl>');
    if (tblStart !== -1 && tblEnd !== -1) {
      const tableXml = documentXml.substring(tblStart, tblEnd + '</w:tbl>'.length);

      const tblPrMatch = tableXml.match(/<w:tblPr>[\s\S]*?<\/w:tblPr>/);
      const tblGridMatch = tableXml.match(/<w:tblGrid>[\s\S]*?<\/w:tblGrid>/);

      // Get header row (first <w:tr>)
      const trRegex = /<w:tr[\s\S]*?<\/w:tr>/g;
      const allRows: string[] = [];
      let match;
      while ((match = trRegex.exec(tableXml)) !== null) {
        allRows.push(match[0]);
      }
      const headerRow = allRows[0] || '';

      const dataRowsXml = data.seniors.map(s => buildDataRowXml(s)).join('\n');

      const newTableXml = `<w:tbl>${tblPrMatch ? tblPrMatch[0] : ''}${tblGridMatch ? tblGridMatch[0] : ''}${headerRow}${dataRowsXml}</w:tbl>`;
      const updatedXml = documentXml.substring(0, tblStart) + newTableXml + documentXml.substring(tblEnd + '</w:tbl>'.length);
      renderedZip.file('word/document.xml', updatedXml);
    }
  }

  return renderedZip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export function downloadPhilHealthTransmittalDocx(blob: Blob, filename = 'PhilHealth-Transmittal.docx') {
  saveAs(blob, filename);
}

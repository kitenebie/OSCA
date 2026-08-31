// ============================================================
// ECA Beneficiaries Masterlist DOCX Generator
// ============================================================
// Uses docxtemplater + pizzip for placeholders, then direct XML
// manipulation to dynamically build the table rows from senior data.
// ============================================================

import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export interface MasterlistSenior {
  no: number;
  lastName: string;
  firstName: string;
  middleName: string;
  sex: string;
  barangay: string;
}

export interface MasterlistData {
  OSCA_Head: string;
  MSWDO: string;
  seniors: MasterlistSenior[];
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildDataRowXml(s: MasterlistSenior): string {
  const cells = [
    String(s.no),
    s.lastName.toUpperCase(),
    s.firstName.toUpperCase(),
    (s.middleName || '').toUpperCase(),
    s.sex === 'Male' ? 'M' : 'F',
    s.barangay,
    '\u00A0', // PICTURE checkbox placeholder
    '\u00A0', // AFFIDAVIT
    '\u00A0', // RESIDENCY
    '\u00A0', // BAPTISMAL
  ];

  const cellXmls = cells.map((text, idx) => {
    // First 6 columns normal width, last 4 narrower (requirements)
    const width = idx < 6 ? '1440' : '1080';
    const align = (idx === 0 || idx >= 4) ? 'center' : 'left';
    return `<w:tc>
      <w:tcPr><w:tcW w:w="${width}" w:type="dxa"/><w:tcBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      </w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:jc w:val="${align}"/></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="18"/></w:rPr>
          <w:t>${escapeXml(text)}</w:t>
        </w:r>
      </w:p>
    </w:tc>`;
  });

  return `<w:tr>${cellXmls.join('')}</w:tr>`;
}

async function loadTemplate(): Promise<ArrayBuffer> {
  const res = await fetch('/docs/BLANK-FORM-ECA-BENES.docx?v=' + Date.now());
  if (!res.ok) throw new Error(`Failed to load template: ${res.status} ${res.statusText}`);
  return await res.arrayBuffer();
}

/**
 * Generate a filled ECA Beneficiaries Masterlist DOCX.
 */
export async function generateMasterlistDocx(data: MasterlistData): Promise<Blob> {
  const templateBuffer = await loadTemplate();
  const zip = new PizZip(templateBuffer.slice(0));

  // Step 1: Fill signatory placeholders
  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.setData({
    OSCA_Head: data.OSCA_Head,
    MSWDO: data.MSWDO,
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

      // Extract table properties and the first two header rows
      const tblPrMatch = tableXml.match(/<w:tblPr>[\s\S]*?<\/w:tblPr>/);
      const tblGridMatch = tableXml.match(/<w:tblGrid>[\s\S]*?<\/w:tblGrid>/);

      // Get header rows (row 0 = merged header, row 1 = column names)
      const trRegex = /<w:tr[\s\S]*?<\/w:tr>/g;
      const allRows: string[] = [];
      let match;
      while ((match = trRegex.exec(tableXml)) !== null) {
        allRows.push(match[0]);
      }
      const headerRows = allRows.slice(0, 2).join('');

      // Build data rows
      const dataRowsXml = data.seniors.map(s => buildDataRowXml(s)).join('\n');

      const newTableXml = `<w:tbl>${tblPrMatch ? tblPrMatch[0] : ''}${tblGridMatch ? tblGridMatch[0] : ''}${headerRows}${dataRowsXml}</w:tbl>`;

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
export function downloadMasterlistDocx(blob: Blob, filename = 'ECA-Beneficiaries-Masterlist.docx') {
  saveAs(blob, filename);
}

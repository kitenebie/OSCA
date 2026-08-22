// ============================================================
// Centenarian Honoring Grantee Claim Form Filler
// ============================================================
// Client-side PDF form filler using pdf-lib.
// Since the Centenarian PDF has no AcroForm fields, we overlay
// text directly at calculated coordinates using drawText.
//
// REQUIREMENT: npm install pdf-lib (already installed for NCSC)
//
// Usage:
//   import { fillCentenarianForm } from '../utils/centenarianFormFiller';
//   const blob = await fillCentenarianForm({ senior, centenarianApp });

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { SeniorCitizen, CentenarianApplication } from "../types";

// ─────────────────────────────────────────────────────────────
// PDF Path
// ─────────────────────────────────────────────────────────────
const CENTENARIAN_PDF_PATH = "/docs/dccc60_6ac76acaf6f04787a7af7efa3ce8eafd.pdf";

// ─────────────────────────────────────────────────────────────
// Fill Options
// ─────────────────────────────────────────────────────────────
export interface CentenarianFillOptions {
  senior: SeniorCitizen;
  centenarianApp?: CentenarianApplication;
  flatten?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Coordinate Mappings (x, y from bottom-left in PDF points)
// Page dimensions: ~595 x 842 (A4) or ~612 x 792 (Letter)
// Adjust these values as needed for precise alignment.
// ─────────────────────────────────────────────────────────────

interface FieldCoord {
  page: number; // 0-indexed
  x: number;
  y: number;
  fontSize?: number;
  maxWidth?: number;
}

// Page 1 fields
const PAGE1_FIELDS: Record<string, FieldCoord> = {
  // C.1 NCSC Registration Reference Number
  ncscRefNumber:       { page: 0, x: 155, y: 548, fontSize: 9 },
  // C.2 LGU OSCA ID Number
  oscaIdNumber:        { page: 0, x: 430, y: 548, fontSize: 9 },
  // C.3 First Name
  firstName:           { page: 0, x: 72,  y: 518, fontSize: 10 },
  // C.4 Middle Name
  middleName:          { page: 0, x: 320, y: 518, fontSize: 10 },
  // C.5 Last Name
  lastName:            { page: 0, x: 72,  y: 490, fontSize: 10 },
  // C.6 Suffix
  suffix:              { page: 0, x: 430, y: 490, fontSize: 10 },
  // C.7 Date of Birth
  dateOfBirth:         { page: 0, x: 72,  y: 458, fontSize: 9 },
  // C.8 Cellphone Number
  cellphoneNumber:     { page: 0, x: 370, y: 458, fontSize: 9 },
  // C.9.1 Address in the Philippines (multi-field row)
  addressHouseNo:      { page: 0, x: 72,  y: 420, fontSize: 8 },
  addressStreet:       { page: 0, x: 135, y: 420, fontSize: 8 },
  addressBarangay:     { page: 0, x: 240, y: 420, fontSize: 8 },
  addressCity:         { page: 0, x: 330, y: 420, fontSize: 8 },
  addressProvince:     { page: 0, x: 420, y: 420, fontSize: 8 },
  addressZip:          { page: 0, x: 510, y: 420, fontSize: 8 },
  // C.10 Sex checkmark position (Male / Female)
  sexMale:             { page: 0, x: 82,  y: 373, fontSize: 11 },
  sexFemale:           { page: 0, x: 82,  y: 360, fontSize: 11 },
  // C.11 Civil Status checkmarks
  civilSingle:         { page: 0, x: 195, y: 385, fontSize: 11 },
  civilMarried:        { page: 0, x: 195, y: 373, fontSize: 11 },
  civilWidow:          { page: 0, x: 195, y: 360, fontSize: 11 },
  civilCommonLaw:      { page: 0, x: 195, y: 347, fontSize: 11 },
  // C.12 Citizenship
  citizenFilipino:     { page: 0, x: 335, y: 385, fontSize: 11 },
  // C.13 Disability
  disabilityNo:        { page: 0, x: 455, y: 373, fontSize: 11 },
  disabilityYes:       { page: 0, x: 420, y: 373, fontSize: 11 },
  // C.14 Ethnicity / IP
  ipNo:                { page: 0, x: 200, y: 318, fontSize: 11 },
  ipYes:               { page: 0, x: 165, y: 318, fontSize: 11 },
  ipTribe:             { page: 0, x: 370, y: 318, fontSize: 9 },
};

// Page 2 fields
const PAGE2_FIELDS: Record<string, FieldCoord> = {
  // D.1 Name of Spouse
  spouseName:          { page: 1, x: 72,  y: 750, fontSize: 9 },
  // D.2 Contact Number of Spouse
  spouseContact:       { page: 1, x: 430, y: 750, fontSize: 9 },
  // D.3 Children (5 slots)
  child1Name:          { page: 1, x: 72,  y: 700, fontSize: 8 },
  child1Sex:           { page: 1, x: 310, y: 700, fontSize: 8 },
  child1Age:           { page: 1, x: 370, y: 700, fontSize: 8 },
  child1Phone:         { page: 1, x: 420, y: 700, fontSize: 8 },
  child2Name:          { page: 1, x: 72,  y: 685, fontSize: 8 },
  child2Sex:           { page: 1, x: 310, y: 685, fontSize: 8 },
  child2Age:           { page: 1, x: 370, y: 685, fontSize: 8 },
  child2Phone:         { page: 1, x: 420, y: 685, fontSize: 8 },
  child3Name:          { page: 1, x: 72,  y: 670, fontSize: 8 },
  child3Sex:           { page: 1, x: 310, y: 670, fontSize: 8 },
  child3Age:           { page: 1, x: 370, y: 670, fontSize: 8 },
  child3Phone:         { page: 1, x: 420, y: 670, fontSize: 8 },
  child4Name:          { page: 1, x: 72,  y: 655, fontSize: 8 },
  child4Sex:           { page: 1, x: 310, y: 655, fontSize: 8 },
  child4Age:           { page: 1, x: 370, y: 655, fontSize: 8 },
  child4Phone:         { page: 1, x: 420, y: 655, fontSize: 8 },
  child5Name:          { page: 1, x: 72,  y: 640, fontSize: 8 },
  child5Sex:           { page: 1, x: 310, y: 640, fontSize: 8 },
  child5Age:           { page: 1, x: 370, y: 640, fontSize: 8 },
  child5Phone:         { page: 1, x: 420, y: 640, fontSize: 8 },
};

// ─────────────────────────────────────────────────────────────
// Main fill function
// ─────────────────────────────────────────────────────────────
export async function fillCentenarianForm(
  options: CentenarianFillOptions
): Promise<Blob> {
  const { senior, centenarianApp, flatten = false } = options;

  // Load the blank PDF template
  const pdfUrl = CENTENARIAN_PDF_PATH;
  const existingPdfBytes = await fetch(pdfUrl).then((res) => {
    if (!res.ok) throw new Error(`Failed to load Centenarian PDF: ${res.status}`);
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  // Helper to draw text on a page
  const drawField = (
    fieldKey: string,
    value: string,
    fieldMap: Record<string, FieldCoord>,
    bold = false
  ) => {
    const coord = fieldMap[fieldKey];
    if (!coord || !value) return;
    const page = pages[coord.page];
    if (!page) return;

    page.drawText(value, {
      x: coord.x,
      y: coord.y,
      size: coord.fontSize || 9,
      font: bold ? fontBold : font,
      color: rgb(0, 0, 0),
      maxWidth: coord.maxWidth,
    });
  };

  // Helper to draw a checkmark
  const drawCheck = (
    fieldKey: string,
    fieldMap: Record<string, FieldCoord>
  ) => {
    const coord = fieldMap[fieldKey];
    if (!coord) return;
    const page = pages[coord.page];
    if (!page) return;

    page.drawText("X", {
      x: coord.x,
      y: coord.y,
      size: coord.fontSize || 11,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
  };

  // ── PAGE 1: Personal Information ──────────────────────────

  // C.2 OSCA ID
  drawField("oscaIdNumber", senior.oscaNumber || "", PAGE1_FIELDS);

  // C.3 First Name
  drawField("firstName", (senior.firstName || "").toUpperCase(), PAGE1_FIELDS, true);

  // C.4 Middle Name
  drawField("middleName", (senior.middleName || "").toUpperCase(), PAGE1_FIELDS, true);

  // C.5 Last Name
  drawField("lastName", (senior.lastName || "").toUpperCase(), PAGE1_FIELDS, true);

  // C.6 Suffix
  drawField("suffix", (senior.suffix || "").toUpperCase(), PAGE1_FIELDS);

  // C.7 Date of Birth
  if (senior.birthdate) {
    const dob = new Date(senior.birthdate);
    const formatted = dob.toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    drawField("dateOfBirth", formatted, PAGE1_FIELDS);
  }

  // C.8 Cellphone
  drawField("cellphoneNumber", senior.contactNumber || "", PAGE1_FIELDS);

  // C.9.1 Address
  const addressParts = (senior.address || "").split(",").map((s) => s.trim());
  drawField("addressHouseNo", addressParts[0] || "", PAGE1_FIELDS);
  drawField("addressStreet", addressParts[1] || "", PAGE1_FIELDS);
  drawField("addressBarangay", senior.barangay || "", PAGE1_FIELDS);
  drawField("addressCity", senior.cityTown || "", PAGE1_FIELDS);
  drawField("addressProvince", senior.province || "", PAGE1_FIELDS);

  // C.10 Sex
  if (senior.sex === "Male") {
    drawCheck("sexMale", PAGE1_FIELDS);
  } else if (senior.sex === "Female") {
    drawCheck("sexFemale", PAGE1_FIELDS);
  }

  // C.11 Civil Status
  const civilMap: Record<string, string> = {
    Single: "civilSingle",
    Married: "civilMarried",
    Widowed: "civilWidow",
    "Widow/Widower": "civilWidow",
    Separated: "civilCommonLaw",
  };
  const civilKey = civilMap[senior.civilStatus || ""];
  if (civilKey) drawCheck(civilKey, PAGE1_FIELDS);

  // C.12 Citizenship - Default to Filipino
  drawCheck("citizenFilipino", PAGE1_FIELDS);

  // C.13 Disability - Default No
  drawCheck("disabilityNo", PAGE1_FIELDS);

  // C.14 Ethnicity/IP
  if (senior.ethnicOrigin) {
    drawCheck("ipYes", PAGE1_FIELDS);
    drawField("ipTribe", senior.ethnicOrigin, PAGE1_FIELDS);
  } else {
    drawCheck("ipNo", PAGE1_FIELDS);
  }

  // ── PAGE 2: Family Information ────────────────────────────

  // D.1 Spouse Name
  const spouseFullName = [
    senior.spouseLastName,
    senior.spouseFirstName,
    senior.spouseMiddleName,
    senior.spouseExtension,
  ]
    .filter(Boolean)
    .join(", ");
  drawField("spouseName", spouseFullName.toUpperCase(), PAGE2_FIELDS);

  // D.3 Children (up to 5)
  const children = senior.children || [];
  for (let i = 0; i < Math.min(children.length, 5); i++) {
    const child = children[i];
    const idx = i + 1;
    drawField(`child${idx}Name`, (child.name || "").toUpperCase(), PAGE2_FIELDS);
    drawField(`child${idx}Age`, child.age || "", PAGE2_FIELDS);
  }

  // ── Flatten if requested ──────────────────────────────────
  if (flatten) {
    const form = pdfDoc.getForm();
    try {
      form.flatten();
    } catch {
      // No form fields to flatten (expected for this PDF)
    }
  }

  // ── Save and return as Blob ───────────────────────────────
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
}

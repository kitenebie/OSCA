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

import type { SeniorCitizen } from "../types";



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

// Page dimensions: ~612 x 792 (Letter)

// Adjust these values as needed for precise alignment.

// ─────────────────────────────────────────────────────────────



interface FieldCoord {

  page: number; // 0-indexed

  x: number;

  y: number;

  fontSize?: number;

  maxWidth?: number;

}



// ═══════════════════════════════════════════════════════════════

// PAGE 1 FIELDS — C. PERSONAL INFORMATION

// ═══════════════════════════════════════════════════════════════

const PAGE1_FIELDS: Record<string, FieldCoord> = {

  // A. Data Privacy Consent

  consentYes:          { page: 0, x: 205, y: 506, fontSize: 16 },

  consentNo:           { page: 0, x: 321, y: 506, fontSize: 16 },



  // B. Place of Submission

  submissionLocal:     { page: 0, x: 106, y: 464, fontSize: 16 },

  submissionAbroad:    { page: 0, x: 322, y: 464, fontSize: 16 },



  // C.1 NCSC Registration Reference Number

  ncscRefNumber:       { page: 0, x: 100, y: 412, fontSize: 12 },

  // C.2 LGU OSCA ID Number

  oscaIdNumber:        { page: 0, x: 350, y: 412, fontSize: 12 },

  // C.3 First Name

  firstName:           { page: 0, x: 70,  y: 380, fontSize: 12 },

  // C.4 Middle Name

  middleName:          { page: 0, x: 330, y: 380, fontSize: 12 },

  // C.5 Last Name

  lastName:            { page: 0, x: 70,  y: 350, fontSize: 12 },

  // C.6 Suffix

  suffix:              { page: 0, x: 430, y: 350, fontSize: 12 },

  // C.7 Date of Birth

  dateOfBirth:         { page: 0, x: 72,  y: 306, fontSize: 15 },

  // C.8 Cellphone Number

  cellphoneNumber:     { page: 0, x: 415, y: 306, fontSize: 15 },

  // C.9.1 Address in the Philippines

  addressHouseNo:      { page: 0, x: 45,  y: 253, fontSize: 12 },

  addressStreet:       { page: 0, x: 125, y: 253, fontSize: 12 },

  addressBarangay:     { page: 0, x: 200, y: 253, fontSize: 12 },

  addressCity:         { page: 0, x: 350, y: 253, fontSize: 12 },

  addressProvince:     { page: 0, x: 430, y: 253, fontSize: 12 },

  addressZip:          { page: 0, x: 530, y: 253, fontSize: 12 },

  // C.9.2 Address Abroad

  abroadHouseNo:       { page: 0, x: 45,  y: 200, fontSize: 12 },

  abroadStreet:        { page: 0, x: 125, y: 200, fontSize: 12 },

  abroadCity:          { page: 0, x: 200, y: 200, fontSize: 12 },

  abroadState:         { page: 0, x: 320, y: 200, fontSize: 12 },

  abroadCountry:       { page: 0, x: 410, y: 200, fontSize: 12 },

  abroadZipCode:       { page: 0, x: 516, y: 200, fontSize: 12 },

  // C.10 Sex checkmark position (Male / Female)

  sexMale:             { page: 0, x: 53,  y: 151, fontSize: 11 },

  sexFemale:           { page: 0, x: 53,  y: 137, fontSize: 11 },

  // C.11 Civil Status checkmarks

  civilSingle:         { page: 0, x: 117, y: 163, fontSize: 11 },

  civilMarried:        { page: 0, x: 117, y: 146, fontSize: 11 },

  civilWidow:          { page: 0, x: 117, y: 129, fontSize: 11 },

  civilCommonLaw:      { page: 0, x: 117, y: 112, fontSize: 11 },

  civilOthers:         { page: 0, x: 117, y: 99, fontSize: 11 },

  // C.12 Citizenship

  citizenFilipino:     { page: 0, x: 214.5, y: 166.5, fontSize: 11 },

  citizenDual:         { page: 0, x: 214.5, y: 150.5, fontSize: 11 },

  dualDetails:         { page: 0, x: 255, y: 140, fontSize: 8 },

  // C.13 Disability

  disabilityYes:       { page: 0, x: 422.5, y: 155, fontSize: 11 },

  disabilityNo:        { page: 0, x: 466, y: 156, fontSize: 11 },

  disabilityType:      { page: 0, x: 372, y: 120.5, fontSize: 8 },

  // C.14 Ethnicity / IP

  ipYes:               { page: 0, x: 243.5, y: 73.5, fontSize: 11 },

  ipNo:                { page: 0, x: 290, y: 73.5, fontSize: 11 },

  ipTribe:             { page: 0, x: 458, y: 75, fontSize: 12 },

};



// ═══════════════════════════════════════════════════════════════

// PAGE 2 FIELDS — D. FAMILY INFO & E. TRANSACTION ACCOUNT

// ═══════════════════════════════════════════════════════════════

const PAGE2_FIELDS: Record<string, FieldCoord> = {

  // D.1 Name of Spouse

  spouseName:          { page: 1, x: 65,  y: 725, fontSize: 12 },

  // D.2 Contact Number of Spouse

  spouseContact:       { page: 1, x: 410, y: 725, fontSize: 12 },

  // D.3–D.6 Children (Name, Sex, Age, Cellphone) — 5 slots

  child1Name:          { page: 1, x: 60,  y: 663, fontSize: 10 },

  child1Sex:           { page: 1, x: 325, y: 670, fontSize: 10 },

  child1Age:           { page: 1, x: 385, y: 670, fontSize: 10 },

  child1Phone:         { page: 1, x: 438, y: 670, fontSize: 10 },


  child2Name:          { page: 1, x: 60,  y: 640, fontSize: 10 },

  child2Sex:           { page: 1, x: 325, y: 647, fontSize: 10 },

  child2Age:           { page: 1, x: 385, y: 647, fontSize: 10 },

  child2Phone:         { page: 1, x: 438, y: 647, fontSize: 10 },


  child3Name:          { page: 1, x: 60,  y: 616, fontSize: 10 },

  child3Sex:           { page: 1, x: 325, y: 625, fontSize: 10 },

  child3Age:           { page: 1, x: 385, y: 625, fontSize: 10 },

  child3Phone:         { page: 1, x: 438, y: 625, fontSize: 10 },


  child4Name:          { page: 1, x: 60,  y: 592, fontSize: 10 },

  child4Sex:           { page: 1, x: 325, y: 602, fontSize: 10 },

  child4Age:           { page: 1, x: 385, y: 602, fontSize: 10 },

  child4Phone:         { page: 1, x: 438, y: 602, fontSize: 10 },


  child5Name:          { page: 1, x: 60,  y: 570, fontSize: 10 },

  child5Sex:           { page: 1, x: 325, y: 578, fontSize: 10 },

  child5Age:           { page: 1, x: 385, y: 578, fontSize: 10 },

  child5Phone:         { page: 1, x: 438, y: 578, fontSize: 10 },



  // E. Grantee's Transaction Account

  // E.1 Preferred Payment Mode checkmarks

  payLandbank:         { page: 1, x: 55,  y: 478, fontSize: 11 },

  payOtherBanks:       { page: 1, x: 55,  y: 461, fontSize: 11 },

  payGCash:            { page: 1, x: 55,  y: 433, fontSize: 11 },

  payPalawan:          { page: 1, x: 55,  y: 415, fontSize: 11 },

  // E.2 Account Details

  accountNumber:       { page: 1, x: 213, y: 365, fontSize: 14 },

  bankName:            { page: 1, x: 213, y: 340, fontSize: 14 },

  branchName:          { page: 1, x: 213, y: 317.5, fontSize: 14 },

  bankAddress:         { page: 1, x: 130, y:  305, fontSize: 13 },

  isJointAccount:      { page: 1, x: 213, y: 293, fontSize: 12 },

  bicSwiftCode:        { page: 1, x: 190, y: 259, fontSize: 14 },

  iban:                { page: 1, x: 190, y: 247, fontSize: 12 },

  // F.1 Date of Death

  dateOfDeath:         { page: 1, x: 180, y: 150, fontSize: 16 },

  // F.2 Claimant Contact

  claimantContact:     { page: 1, x: 360, y: 165, fontSize: 13 },

  claimantEmail:       { page: 1, x: 360, y: 150, fontSize: 13 },

  // F.3 Name of Claimant

  claimantName:        { page: 1, x: 72,  y: 90, fontSize: 16 },

};



// ═══════════════════════════════════════════════════════════════

// PAGE 3 FIELDS — F. DECEASED GRANTEES & G. ATTESTATION

// ═══════════════════════════════════════════════════════════════

const PAGE3_FIELDS: Record<string, FieldCoord> = {

  // F.4 Claimant Address

  claimantHouseNo:     { page: 2, x: 53,  y: 725, fontSize: 13 },

  claimantStreet:      { page: 2, x: 140, y: 725, fontSize: 13 },

  claimantBarangay:    { page: 2, x: 250, y: 725, fontSize: 13 },

  claimantCity:        { page: 2, x: 340, y: 725, fontSize: 13 },

  claimantProvince:    { page: 2, x: 438, y: 725, fontSize: 13 },

  claimantZipCode:     { page: 2, x: 514, y: 725, fontSize: 13 },

  // F.5 Relationship

  claimantRelationship: { page: 2, x: 230, y: 680, fontSize: 14 },

  // F.6 Claimant Payment Mode

  claimantPayLandbank: { page: 2, x: 55,  y: 629, fontSize: 11 },

  claimantPayOther:    { page: 2, x: 55,  y: 611, fontSize: 11 },

  claimantPayGCash:    { page: 2, x: 55,  y: 583, fontSize: 11 },

  claimantPayPalawan:  { page: 2, x: 55,  y: 565.5, fontSize: 11 },

  // F.7 Claimant Account Details

  claimantAccountNo:   { page: 2, x: 220, y: 515.5, fontSize: 13 },

  claimantBankName:    { page: 2, x: 220, y: 493, fontSize: 13 },

  claimantBranchName:  { page: 2, x: 190, y: 473, fontSize: 13 },

  claimantBankAddress: { page: 2, x: 120, y: 448, fontSize: 13 },

  claimantJointAcct:   { page: 2, x: 210, y: 424, fontSize: 13 },

  claimantSwift:       { page: 2, x: 180, y: 390, fontSize: 13 },

  claimantIban:        { page: 2, x: 190, y: 378, fontSize: 12 },


  GranteeSigned:        { page: 2, x: 72, y: 75, fontSize: 14 },
  // G. Attestation

  dateSigned:          { page: 2, x: 460, y: 75, fontSize: 14 },

};

const PAGE4_FIELDS: Record<string, FieldCoord> = {
  RemarksNoteLackingDocs: {page: 3,  x: 455, y: 628, fontSize: 8},
  Doc1: {page: 3,  x: 71, y: 628, fontSize: 12},
  Doc2: {page: 3,  x: 71, y: 615, fontSize: 12},
  Doc3: {page: 3,  x: 71, y: 590, fontSize: 12},
  Doc4: {page: 3,  x: 71, y: 565, fontSize: 12},
  Doc5: {page: 3,  x: 71, y: 528, fontSize: 12},
  Doc6: {page: 3,  x: 71, y: 515, fontSize: 12},
  Doc7: {page: 3,  x: 71, y: 450, fontSize: 12},
  Doc8: {page: 3,  x: 71, y: 425, fontSize: 12},
  Doc9: {page: 3,  x: 71, y: 388, fontSize: 12},
  Doc10: {page: 3,  x: 71, y: 346, fontSize: 12},
  Doc11: {page: 3,  x: 71, y: 333, fontSize: 12},
  IsEligible: {page: 3,  x: 212, y: 237, fontSize: 12},
  IsNotEligible: {page: 3,  x: 344, y: 237, fontSize: 12},
  VerifierSignatureName: {page: 3, x: 200, y: 180, fontSize: 14},
  verificationDate: {page: 3, x: 100, y: 80, fontSize: 14},
  NCSCRegNo: {page: 3, x: 330, y: 80, fontSize: 14},
  verifierContactInfo: {page: 3, x:100, y:146, fontSize: 12},
}

// ─────────────────────────────────────────────────────────────

// Main fill function

// ─────────────────────────────────────────────────────────────

export async function fillCentenarianForm(

  options: CentenarianFillOptions

): Promise<Blob> {

  const { senior, centenarianApp, flatten = false } = options;

  const s = senior as any; // Allow access to extended fields



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



  // ══════════════════════════════════════════════════════════════

  // PAGE 1: Personal Information

  // ══════════════════════════════════════════════════════════════



  // A. Data Privacy Consent

  if (s.dataPrivacyConsent === "Consent") {

    drawCheck("consentYes", PAGE1_FIELDS);

  } else if (s.dataPrivacyConsent === "Dissent") {

    drawCheck("consentNo", PAGE1_FIELDS);

  }



  // B. Place of Submission

  if (s.placeOfSubmission === "Local") {

    drawCheck("submissionLocal", PAGE1_FIELDS);

  } else if (s.placeOfSubmission === "Abroad") {

    drawCheck("submissionAbroad", PAGE1_FIELDS);

  }



  // C.1 NCSC Reference Number

  drawField("ncscRefNumber", s.ncscReferenceCode || "", PAGE1_FIELDS);



  // C.2 OSCA ID

  drawField("oscaIdNumber", s.oscaNumber || "", PAGE1_FIELDS);



  // C.3 First Name

  drawField("firstName", (s.firstName || "").toUpperCase(), PAGE1_FIELDS, true);



  // C.4 Middle Name

  drawField("middleName", (s.middleName || "").toUpperCase(), PAGE1_FIELDS, true);



  // C.5 Last Name

  drawField("lastName", (s.lastName || "").toUpperCase(), PAGE1_FIELDS, true);



  // C.6 Suffix

  drawField("suffix", (s.suffix || "").toUpperCase(), PAGE1_FIELDS);



  // C.7 Date of Birth

  if (s.birthdate) {

    const dob = new Date(s.birthdate);

    const formatted = dob.toLocaleDateString("en-PH", {

      month: "long",

      day: "numeric",

      year: "numeric",

    });

    drawField("dateOfBirth", formatted, PAGE1_FIELDS);

  }



  // C.8 Cellphone

  drawField("cellphoneNumber", s.contactNumber || "", PAGE1_FIELDS);



  // C.9.1 Address in PH

  const addressParts = (s.address || "").split(",").map((p: string) => p.trim());

  drawField("addressHouseNo", addressParts[0] || "", PAGE1_FIELDS);

  drawField("addressStreet", addressParts[1] || "", PAGE1_FIELDS);

  drawField("addressBarangay", s.barangay || "", PAGE1_FIELDS);

  drawField("addressCity", s.cityTown || "", PAGE1_FIELDS);

  drawField("addressProvince", s.province || "", PAGE1_FIELDS);

  drawField("addressZip", s.zipCode || "", PAGE1_FIELDS);



  // C.9.2 Address Abroad

  drawField("abroadHouseNo", s.abroadHouseNo || "", PAGE1_FIELDS);

  drawField("abroadStreet", s.abroadStreet || "", PAGE1_FIELDS);

  drawField("abroadCity", s.abroadCity || "", PAGE1_FIELDS);

  drawField("abroadState", s.abroadState || "", PAGE1_FIELDS);

  drawField("abroadCountry", s.abroadCountry || "", PAGE1_FIELDS);

  drawField("abroadZipCode", s.abroadZipCode || "", PAGE1_FIELDS);



  // C.10 Sex

  if (s.sex === "Male") {

    drawCheck("sexMale", PAGE1_FIELDS);

  } else if (s.sex === "Female") {

    drawCheck("sexFemale", PAGE1_FIELDS);

  }



  // C.11 Civil Status

  const civilMap: Record<string, string> = {

    Single: "civilSingle",

    Married: "civilMarried",

    Widowed: "civilWidow",

    "Widow/Widower": "civilWidow",

    "Common-Law": "civilCommonLaw",

    "Others": "civilOthers",

  };

  const civilKey = civilMap[s.civilStatus || ""];

  if (civilKey) drawCheck(civilKey, PAGE1_FIELDS);



  // C.12 Citizenship

  if (s.citizenship === "Dual") {

    drawCheck("citizenDual", PAGE1_FIELDS);

    drawField("dualDetails", s.dualCitizenDetails || "", PAGE1_FIELDS);

  } else {

    drawCheck("citizenFilipino", PAGE1_FIELDS);

  }



  // C.13 Disability

  if (s.physicalDisability) {

    drawCheck("disabilityYes", PAGE1_FIELDS);

    drawField("disabilityType", s.physicalDisabilityText || "", PAGE1_FIELDS);

  } else {

    drawCheck("disabilityNo", PAGE1_FIELDS);

  }



  // C.14 Ethnicity/IP

  if (s.ethnicOrigin) {

    drawCheck("ipYes", PAGE1_FIELDS);

    drawField("ipTribe", s.ethnicOrigin, PAGE1_FIELDS);

  } else {

    drawCheck("ipNo", PAGE1_FIELDS);

  }



  // ══════════════════════════════════════════════════════════════

  // PAGE 2: Family Information & Transaction Account

  // ══════════════════════════════════════════════════════════════



  // D.1 Spouse Name

  const spouseFullName = [

    s.spouseLastName,

    s.spouseFirstName,

    s.spouseMiddleName,

    s.spouseExtension,

  ]

    .filter(Boolean)

    .join(", ");

  drawField("spouseName", spouseFullName.toUpperCase(), PAGE2_FIELDS);



  // D.2 Spouse Contact

  drawField("spouseContact", s.spouseContactNumber || "", PAGE2_FIELDS);



  // D.3–D.6 Children (up to 5)

  const children = s.children || [];

  for (let i = 0; i < Math.min(children.length, 5); i++) {

    const child = children[i];

    const idx = i + 1;

    drawField(`child${idx}Name`, (child.name || "").toUpperCase(), PAGE2_FIELDS);

    drawField(`child${idx}Sex`, child.sex || "", PAGE2_FIELDS);

    drawField(`child${idx}Age`, child.age || "", PAGE2_FIELDS);

    drawField(`child${idx}Phone`, child.contactNumber || "", PAGE2_FIELDS);

  }



  // E.1 Preferred Payment Mode

  const paymentMap: Record<string, string> = {

    Landbank: "payLandbank",

    "Other Banks": "payOtherBanks",

    GCash: "payGCash",

    "Palawan PSP": "payPalawan",

  };

  const payKey = paymentMap[s.preferredPaymentMode || ""];

  if (payKey) drawCheck(payKey, PAGE2_FIELDS);



  // E.2 Account Details

  drawField("accountNumber", s.accountNumber || "", PAGE2_FIELDS);

  drawField("bankName", s.bankName || "", PAGE2_FIELDS);

  drawField("branchName", s.branchName || "", PAGE2_FIELDS);

  drawField("bankAddress", s.bankAddress || "", PAGE2_FIELDS);

  drawField("isJointAccount", s.isJointAccount || "", PAGE2_FIELDS);

  drawField("bicSwiftCode", s.bicSwiftCode || "", PAGE2_FIELDS);

  drawField("iban", s.iban || "", PAGE2_FIELDS);



  // ══════════════════════════════════════════════════════════════

  // PAGE 3: Deceased Grantees & Attestation

  // ══════════════════════════════════════════════════════════════



  if (s.isDeceased && s.dateOfDeath) {

    // F.1 Date of Death

    drawField("dateOfDeath", s.dateOfDeath, PAGE2_FIELDS);



    // F.2 Claimant Contact

    drawField("claimantContact", s.claimantContactNumber || "", PAGE2_FIELDS);

    drawField("claimantEmail", s.claimantEmail || "", PAGE2_FIELDS);



    // F.3 Claimant Name

    const claimantName = [

      s.claimantLastName,

      s.claimantFirstName,

      s.claimantMiddleName,

      s.claimantExtension,

    ]

      .filter(Boolean)

      .join(", ");

    drawField("claimantName", claimantName.toUpperCase(), PAGE2_FIELDS);



    // F.4 Claimant Address

    drawField("claimantHouseNo", s.claimantHouseNo || "", PAGE3_FIELDS);

    drawField("claimantStreet", s.claimantStreet || "", PAGE3_FIELDS);

    drawField("claimantBarangay", s.claimantBarangay || "", PAGE3_FIELDS);

    drawField("claimantCity", s.claimantCity || "", PAGE3_FIELDS);

    drawField("claimantProvince", s.claimantProvince || "", PAGE3_FIELDS);

    drawField("claimantZipCode", s.claimantZipCode || "", PAGE3_FIELDS);



    // F.5 Relationship

    drawField("claimantRelationship", s.claimantRelationship || "", PAGE3_FIELDS);



    // F.6 Claimant Payment Mode

    const claimantPayMap: Record<string, string> = {

      Landbank: "claimantPayLandbank",

      "Other Banks": "claimantPayOther",

      GCash: "claimantPayGCash",

      "Palawan PSP": "claimantPayPalawan",

    };

    const claimantPayKey = claimantPayMap[s.claimantPaymentMode || ""];

    if (claimantPayKey) drawCheck(claimantPayKey, PAGE3_FIELDS);



    // F.7 Claimant Account Details

    drawField("claimantAccountNo", s.claimantAccountNumber || "", PAGE3_FIELDS);

    drawField("claimantBankName", s.claimantBankName || "", PAGE3_FIELDS);

    drawField("claimantBranchName", s.claimantBranchName || "", PAGE3_FIELDS);

    drawField("claimantBankAddress", s.claimantBankAddress || "", PAGE3_FIELDS);

    drawField("claimantJointAcct", s.claimantIsJointAccount || "", PAGE3_FIELDS);

    drawField("claimantSwift", s.claimantBicSwiftCode || "", PAGE3_FIELDS);

    drawField("claimantIban", s.claimantIban || "", PAGE3_FIELDS);

  }


  drawField("GranteeSigned", s.GranteeSigned || "", PAGE3_FIELDS);

  // G. Grantee Signature Image (embed on Page 3 above printed name)
  if (s.GranteeSignature) {
    try {
      const sigResponse = await fetch(s.GranteeSignature);
      if (sigResponse.ok) {
        const sigBytes = await sigResponse.arrayBuffer();
        const contentType = sigResponse.headers.get("content-type") || "";
        let sigImage;
        if (contentType.includes("png")) {
          sigImage = await pdfDoc.embedPng(sigBytes);
        } else {
          sigImage = await pdfDoc.embedJpg(sigBytes);
        }
        const page = pages[2];
        if (page) {
          const sigWidth = 120;
          const sigHeight = (sigImage.height / sigImage.width) * sigWidth;
          page.drawImage(sigImage, { x: 72, y: 85, width: sigWidth, height: sigHeight });
        }
      }
    } catch (e) {
      console.error("[Centenarian PDF] Failed to embed grantee signature:", e);
    }
  }

  // G. Attestation - Date Signed

  drawField("dateSigned", s.dateSigned || "", PAGE3_FIELDS);


  
    drawCheck("Doc1", PAGE4_FIELDS);
  
    drawCheck("Doc2", PAGE4_FIELDS);
  
    drawCheck("Doc3", PAGE4_FIELDS);
  
    drawCheck("Doc4", PAGE4_FIELDS);
  
    drawCheck("Doc5", PAGE4_FIELDS);
  
    drawCheck("Doc6", PAGE4_FIELDS);
  
    drawCheck("Doc7", PAGE4_FIELDS);
  
    drawCheck("Doc8", PAGE4_FIELDS);
  
    drawCheck("Doc9", PAGE4_FIELDS);
  
    drawCheck("Doc10", PAGE4_FIELDS);
  
    drawCheck("Doc11", PAGE4_FIELDS);

    drawField("RemarksNoteLackingDocs", s.RemarksNoteLackingDocs || "", PAGE4_FIELDS);

    drawCheck("IsEligible", PAGE4_FIELDS);

    drawCheck("IsNotEligible", PAGE4_FIELDS);

    drawField("VerifierSignatureName", s.VerifierSignatureName || "", PAGE4_FIELDS);

    drawField("verificationDate",s.verificationDate || "",  PAGE4_FIELDS);

    drawField("NCSCRegNo", s.NCSCRegNo || "", PAGE4_FIELDS);

    drawField("verifierContactInfo", s.verifierContactInfo || "", PAGE4_FIELDS);



  // ── Flatten if requested ──────────────────────────────────────

  if (flatten) {

    const form = pdfDoc.getForm();

    try {

      form.flatten();

    } catch {

      // No form fields to flatten (expected for this PDF)

    }

  }



  // ── Save and return as Blob ───────────────────────────────────

  const pdfBytes = await pdfDoc.save();

  return new Blob([pdfBytes], { type: "application/pdf" });

}


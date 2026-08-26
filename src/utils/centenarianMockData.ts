// ============================================================

// Centenarian Honoring Claim Form — Mock Data for Testing

// ============================================================

// Complete mock data covering ALL fields in the 4-page PDF form.

// Used for testing PDF coordinate alignment in centenarianFormFiller.ts

//

// Usage:

//   import { mockSenior } from '../utils/centenarianMockData';

//   const blob = await fillCentenarianForm({ senior: mockSenior, centenarianApp: mockCentenarianApp });

import type { SeniorCitizen } from "../types";

export const mockSenior: Partial<SeniorCitizen> & Record<string, any> = {
  id: "mock-senior-001",

  // ========================

  // PAGE 1 — C. PERSONAL INFORMATION

  // ========================

  // A. Data Privacy Consent

  dataPrivacyConsent: "Dissent", // "Consent" | "Dissent"

  // B. Place of Submission

  placeOfSubmission: "Abroad", // "Local" | "Abroad"

  // C.1 NCSC Registration Reference Number

  ncscReferenceCode: "NCSC-V-SOR-2025-001234",

  // C.2 LGU OSCA ID Number

  oscaNumber: "OSCA-2025-JBN-00123",

  // C.3 First Name

  firstName: "Maria",

  // C.4 Middle Name

  middleName: "Santos",

  // C.5 Last Name

  lastName: "Dela Cruz",

  // C.6 Suffix

  suffix: "N/A", // "N/A" | "Jr." | "Sr." | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX" | "X"

  // C.7 Date of Birth

  birthdate: "1926-03-15",

  age: 100,

  // C.8 Cellphone Number

  contactNumber: "09171234567",

  // C.9.1 Address in the Philippines

  address: "123 Pedro St Purok 3",

  barangay: "Tugos",

  cityTown: "Juban",

  province: "Sorsogon",

  region: "Region V (Bicol Region)",

  zipCode: "4703",

  // C.9.2 Address Abroad (for living abroad only)

  abroadHouseNo: "123",

  abroadStreet: " Juan St",

  abroadCity: "York New",

  abroadState: "New York",

  abroadCountry: "United States",

  abroadZipCode: "123456",

  // C.10 Sex

  sex: "Female",

  // C.11 Civil Status

  civilStatus: "Others", // "Single" | "Married" | "Widowed" | "Common-Law" | "Others"

  // C.12 Citizenship

  citizenship: "Filipino", // "Filipino" | "Dual"

  dualCitizenDetails: "This is a test message for dual citizenship details",

  // C.13 Disability

  physicalDisability: false,

  physicalDisabilityText: "This is a test message for dual citizenship details",

  // C.14 Ethnicity / IP

  ethnicOrigin: "Tribal", // empty = No; non-empty = Yes + tribe name

  // ========================

  // PAGE 2 — D. FAMILY INFORMATION

  // ========================

  // D.1 Name of Spouse

  spouseLastName: "Dela Cruz",

  spouseFirstName: "Juan",

  spouseMiddleName: "Reyes",

  spouseExtension: "Sr.",

  // D.2 Contact Number of Spouse

  spouseContactNumber: "09191234567",

  // D.3–D.6 Children (Name, Sex, Age, Cellphone) — up to 5

  children: [
    {
      name: "Jose Dela Cruz Jr.",
      sex: "Male",
      age: "75",
      contactNumber: "09181111111",
      occupation: "Farmer",
      income: "15,000",
    },

    {
      name: "Ana Dela Cruz Garcia",
      sex: "Female",
      age: "72",
      contactNumber: "09182222222",
      occupation: "Teacher (Retired)",
      income: "20,000",
    },

    {
      name: "Pedro Dela Cruz",
      sex: "Male",
      age: "68",
      contactNumber: "09183333333",
      occupation: "Fisherman",
      income: "10,000",
    },

    {
      name: "Luisa Dela Cruz Santos",
      sex: "Female",
      age: "65",
      contactNumber: "09184444444",
      occupation: "Housewife",
      income: "N/A",
    },

    {
      name: "Roberto Dela Cruz",
      sex: "Male",
      age: "60",
      contactNumber: "09185555555",
      occupation: "OFW (Retired)",
      income: "25,000",
    },
  ],

  // ========================

  // PAGE 2 — E. GRANTEE'S TRANSACTION ACCOUNT

  // ========================

  // E.1 Preferred Mode to Receive Cash Gift

  preferredPaymentMode: "Palawan PSP", // "Landbank" | "Other Banks" | "GCash" | "Palawan PSP"

  // E.2 Account Details

  accountNumber: "1234-5678-9012",

  bankName: "Landbank of the Philippines",

  branchName: "Sorsogon Branch",

  bankAddress: "National Highway, Sorsogon City",

  isJointAccount: "No",

  // For abroad only

  bicSwiftCode: "12334543543342",

  iban: "Test IBAN 1234567890",

  // ========================

  // PAGE 2/3 — F. FOR DECEASED GRANTEES

  // ========================

  // F.1 Date of Death

  isDeceased: true,

  dateOfDeath: "January 31, 2026",

  // F.2 Claimant Contact

  claimantContactNumber: "09123456789",

  claimantEmail: "Johndoemarkhalosguamos@gmail.com",

  // F.3 Name of Claimant

  claimantLastName: "Guamos",

  claimantFirstName: "John Doe Mark",

  claimantMiddleName: "Halos",

  claimantExtension: "N/A",

  // F.4 Permanent Address of Claimant

  claimantHouseNo: "12345",

  claimantStreet: "Aluinaty St.",

  claimantBarangay: "Aroroy",

  claimantCity: "Juban",

  claimantProvince: "Sprsogon",

  claimantZipCode: "112345",

  // F.5 Relationship to the Deceased

  claimantRelationship: "Daughter",

  // F.6 Claimant's Payment Mode

  claimantPaymentMode: "Palawan PSP", // "Landbank" | "Other Banks" | "GCash" | "Palawan PSP"

  // F.7 Claimant Account Details

  claimantAccountNumber: "12345678900001234566666789",

  claimantBankName: "John Doe Mark Halos Guamos",

  claimantBranchName: "Palawan Express Branch Juban",

  claimantBankAddress:
    "Palawan Express Branch Juban, Sorsogon City, Philippines",

  claimantIsJointAccount: "Yes",

  claimantBicSwiftCode: "82748734897324328",

  claimantIban: "BAN 623862384283932",

  // ========================

  // PAGE 3 — G. ATTESTATION

  // ========================

  // Signature / Thumbmark of Grantee

  GranteeSigned: "JOHN DOE MARK HALOS GUAMOS",

  GranteeSignature:
    "https://www.freepnglogos.com/uploads/signature-png/file-gary-vaynerchuk-signature-download-28.png",

  dateSigned: "2026-02-01",

  // ========================

  // VERIFICATION CHECKLIST

  // ========================

  Doc1: true, //Accomplished Annex A Grantee/Claimant Form

  Doc2: true, // Primary ID for Local Applicants: PSA/LCR issued birth certificate, PhilSys / National ID, or Valid Philippine Passport, Grantee's Digital NSCID verified

  Doc3: true, // Primary ID for Applicants Abroad: Valid PH Passport or Identification Certificate, signed and marked with “Verified from the Original Document”

  Doc4: true, //Secondary IDs: Photocopy of any two (2) of the identified secondary ID in existing guidelines (indicate name of the two documents in the Remarks), signed and marked with “Verified from the Original Document”

  Doc5: true, //Whole-body/half-upper body photo

  Doc6: true, //Photocopy of Grantee’s bank-verified deposit slip or screenshot of GCash Profile Information Sheet, signed and marked with “Verified from the Original Document”, if applicable

  //Other documents for deceased grantees:

  Doc7: true, //Photocopy PSA/LCR death certificate or apostilled equivalent document issued overseas, signed and marked with “verified from the original document”

  Doc8: true, //Proof of relationship: Photocopy of PSA/LCR certificates/documents or apostilled equivalent document issued overseas, as proof of relationship, signed and marked with “Verified from the Original Document”

  Doc9: true, //Photocopy of Claimant’s Bank-verified deposit slip or screenshot of GCash Profile Information signed and marked with “Verified from the Original Document” (to replace Grantee’s bank account)

  Doc10: true, //Original Copy of Warranty and Release From Liability Form

  Doc11: true, //Original LGU/RCF Certification of no relative

  RemarksNoteLackingDocs: "This is a test\n message for lacking\n documents remarks",

  // I. VERIFICATION RESULT (to be filled-up by the Verifier/Staff)
  IsEligible: true,
  IsNotEligible: true,
  VerifierSignature:
    "https://www.freepnglogos.com/uploads/signature-png/file-gary-vaynerchuk-signature-download-28.png",
  VerifierSignatureName: "JANE SMITH SIGNATURE",
  verificationDate: "12-23-2026",
  NCSCRegNo: "1237585462347662342",

  verifierContactInfo: "Purok 3, Brgy. Aroroy, Juban, Sorsogon, 09123456789, janesmith@gmail.com",//Name of office with location, Contact Numbers and Email Address of Verifier
};
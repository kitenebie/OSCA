export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SeniorCitizen {
  id: string;
  oscaNumber: string;          // format: "OSCA-CAR-2024-0001"
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string;
  birthdate: string;
  age: number;
  sex: "Male" | "Female";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated" | "Divorced";
  contactNumber: string;
  barangay: string;
  address: string;
  coordinates: Coordinates;
  profilePhoto: string;         // base64 image or path
  thumbprintData: string | null; // base64 or status
  signatureData: string | null;  // base64 signature path
  status: "Pending" | "Approved" | "Rejected" | "For Verification" | "Deactivated" | "Deceased";
  registeredDate: string;
  registeredBy: string;         // encoder name/id
  pensionBeneficiary: boolean;
  remarks?: string;

  // New Registration Fields
  region?: string;
  province?: string;
  cityTown?: string;
  telephone?: string;
  emailAddress?: string;
  bloodType?: string;
  religion?: string;
  highestEducationalAttainment?: string;
  gsis?: string;
  sss?: string;
  tin?: string;
  philHealth?: string;
  employmentStatus?: string;
  classification?: string;
  monthlyPension?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  validIdPhoto?: string;
  inRiskArea?: "yes" | "no";
  riskType?: string;
  riskDetails?: string;
  riskSeverity?: "low" | "medium" | "high" | "critical";

  // NCSC-aligned fields (Identifying Information)
  placeOfBirth?: string;
  ethnicOrigin?: string;
  languageSpoken?: string;
  scAssocOrgId?: string;
  otherGovtId?: string;
  capabilityToTravel?: boolean;
  serviceBusinessEmployment?: string;

  // Family Composition
  spouseLastName?: string;
  spouseFirstName?: string;
  spouseMiddleName?: string;
  spouseExtension?: string;
  fatherLastName?: string;
  fatherFirstName?: string;
  fatherMiddleName?: string;
  fatherExtension?: string;
  motherLastName?: string;
  motherFirstName?: string;
  motherMiddleName?: string;
  children?: { name: string; occupation: string; income: string; age: string; workingStatus: string }[];
  dependents?: { name: string; occupation: string; income: string; age: string; workingStatus: string }[];

  // III. Education / HR Profile
  specializations?: string[];
  specOthersText?: string;
  shareSkills?: string[];
  communityServices?: string[];
  commOthersText?: string;

  // IV. Dependency Profile
  livingWith?: string[];
  livingOthersText?: string;
  householdCondition?: string[];
  householdOthersText?: string;

  // V. Economic Profile
  incomeSources?: string[];
  incomeOthersText?: string;
  realProperties?: string[];
  realPropOthersText?: string;
  movableProperties?: string[];
  movablePropOthersText?: string;
  monthlyIncomeRange?: string;
  problemsNeeds?: string[];
  problemsSkillsText?: string;
  problemsLivelihoodText?: string;
  problemsOthersText?: string;

  // VI. Health Profile
  physicalDisability?: boolean;
  physicalDisabilityText?: string;
  medicalConcerns?: string[];
  medicalOthersText?: string;
  dentalConcerns?: string[];
  dentalOthersText?: string;
  opticalConcerns?: string[];
  opticalOthersText?: string;
  hearingConcerns?: string[];
  hearingOthersText?: string;
  socialEmotional?: string[];
  socialEmotionalOthersText?: string;
  areaDifficulty?: string[];
  areaDifficultyOthersText?: string;
  checkupFrequency?: string;
  medicines?: { name: string; dosage: string; notes: string }[];
  scheduledCheckup?: string;

  // IX. Assisting Person
  assistingPerson1Name?: string;
  assistingPerson1Relationship?: string;
  assistingPerson2Name?: string;
  assistingPerson2Relationship?: string;
  assistingPerson1Signature?: string;
  assistingPerson2Signature?: string;
  interviewerSignature?: string;
  interviewerName?: string;
  interviewerOrganization?: string;
  interviewDate?: string;
  ncscReferenceCode?: string;


  // Deceased / Vital Status
  isDeceased?: boolean;
  dateOfDeath?: string;
  causeOfDeath?: string;
}

export interface Barangay {
  id: string;
  name: string;
  population: number;
  seniorCount: number;
  centerCoordinates: Coordinates;
  barangayHallAddress: string;
}

export interface User {
  id: string;
  username: string;
  profilePhoto?: string;
  fullName: string;
  role: string;
  barangayAssigned?: string; // For Barangay Encoders
  contactNumber: string;
  email: string;
  status: "Active" | "Inactive" | "Deactivated";
}

export interface RolePermission {
  role: string;
  permissions: {
    // --- Records Management (Seniors) ---
    canViewSeniors: boolean;
    canCreateSenior: boolean;
    canEditSenior: boolean;
    canDeleteSenior: boolean;
    canApproveReject: boolean;

    // --- User Administration (Users) ---
    canViewUsers: boolean;
    canCreateUser: boolean;
    canEditUser: boolean;
    canDeleteUser: boolean;
    canManageUsers: boolean;

    // --- Reports & Documents ---
    canGenerateReports: boolean;
    canDeleteReports: boolean;

    // --- Notifications & SMS ---
    canSendSMS: boolean;
    canManageNotifications: boolean;

    // --- Page Access Control ---
    canAccessDashboard: boolean;
    canAccessSeniorsList: boolean;
    canAccessSeniorProfile: boolean;
    canAccessRegister: boolean;
    canAccessReports: boolean;
    canAccessSMSCenter: boolean;
    canAccessUserManagement: boolean;
    canAccessFindUser: boolean;
    canAccessConfiguration: boolean;
    canAccessMapping: boolean;
  };
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  amount: number;
  frequency: "Monthly" | "Quarterly" | "Bi-Annual" | "Annual";
  status: "Active" | "Completed" | "Suspended";
  distributionDate: string;
}

export interface SMSLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  barangay?: string;
  message: string;
  status: "Sent" | "Failed" | "Pending";
  sentBy: string;
  timestamp: string;
}

export interface AuditLogNotification {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT' | 'SMS' | 'SESSION_TERMINATE' | 'SESSION_TERMINATE_ALL' | 'SESSION_EXPIRED' | 'SESSION_RENEW';
  entity: 'Senior' | 'User' | 'Role' | 'Report' | 'SMS' | 'System' | 'Session';
  details: string;
  actorName: string;
  actorRole: string;
  barangay?: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'success' | 'warning' | 'danger';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "MasterList" | "Pension" | "Census" | "Individual";
  category: "Demographic" | "Financial" | "Administrative";
  parameters: string[];
}

// ==================== NCSC Senior Citizen Data Form ====================
export interface NCSCDataForm {
  id: string;
  seniorId: string;
  referenceCode: string; // Based on Region/Province/City/Barangay
  interviewDate: string;
  interviewedBy: string;

  // Economic Profile
  incomeSource?: string;
  estimatedMonthlyIncome?: string;
  receivingPension?: boolean;
  pensionType?: string;
  pensionAmount?: string;
  receivingSocialPension?: boolean;
  isIndigent?: boolean;
  ownsProperty?: boolean;
  propertyType?: string;

  // Health Profile
  healthCondition?: string;
  existingIllnesses?: string[];
  medications?: string[];
  mobility?: "Independent" | "With Assistance" | "Bedridden";
  mentalHealthStatus?: string;
  hasPhilHealth?: boolean;
  philHealthCategory?: string;
  lastCheckupDate?: string;
  hospitalPreference?: string;

  // Household Profile
  livingArrangement?: "Alone" | "With Spouse" | "With Children" | "With Relatives" | "Institution";
  householdSize?: number;
  caregiverName?: string;
  caregiverRelationship?: string;
  caregiverContact?: string;
  housingType?: "Owned" | "Rented" | "Living with Relative" | "Government Housing" | "Informal Settlement";
  hasAccessToWater?: boolean;
  hasAccessToElectricity?: boolean;
  hasAccessToSanitation?: boolean;

  // Participation & Needs
  memberOfSeniorOrg?: boolean;
  seniorOrgName?: string;
  participatesInActivities?: boolean;
  activitiesJoined?: string[];
  primaryNeeds?: string[];
  suggestedPrograms?: string[];

  status: "Pending" | "Completed" | "Incomplete";
  completedDate?: string;
}

// ==================== Centenarian Honoring Program ====================
export interface CentenarianApplication {
  id: string;
  seniorId: string;
  milestoneType: "Octogenarian-80" | "Octogenarian-85" | "Nonagenarian-90" | "Nonagenarian-95" | "Centenarian-100";
  milestoneAge: number;
  milestoneDateReached: string;
  cashGiftAmount: number;
  applicationDate: string;
  applicantType: "Self" | "Representative" | "Posthumous";
  representativeName?: string;
  representativeRelationship?: string;
  representativeContact?: string;

  // Requirements Checklist
  hasApplicationForm: boolean;
  hasFullBodyPhoto: boolean;
  hasEndorsementLetter: boolean; // From Local Chief Executive
  hasBirthCertificate: boolean;
  hasValidId: boolean;
  hasDeathCertificate?: boolean; // For posthumous

  // Award Details
  status: "Pending" | "Endorsed" | "Approved" | "Claimed" | "Expired" | "Posthumous";
  endorsedBy?: string;
  endorsedDate?: string;
  claimDeadline?: string; // Must claim within 1 year of milestone
  claimedDate?: string;
  remarks?: string;
}

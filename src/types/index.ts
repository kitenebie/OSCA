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
  status: "Pending" | "Approved" | "Rejected" | "For Verification" | "Deactivated";
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
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'SMS';
  entity: 'Senior' | 'User' | 'Role' | 'Report' | 'SMS' | 'System';
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

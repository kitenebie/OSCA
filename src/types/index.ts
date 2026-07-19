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
  status: "Pending" | "Approved" | "Rejected" | "For Verification";
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
  role: "Super Admin" | "MSWDO Officer" | "Barangay Encoder" | "Viewer";
  barangayAssigned?: string; // For Barangay Encoders
  contactNumber: string;
  email: string;
  status: "Active" | "Inactive";
}

export interface RolePermission {
  role: "Super Admin" | "MSWDO Officer" | "Barangay Encoder" | "Viewer";
  permissions: {
    canViewSeniors: boolean;
    canCreateSenior: boolean;
    canEditSenior: boolean;
    canApproveReject: boolean;
    canManageUsers: boolean;
    canGenerateReports: boolean;
    canSendSMS: boolean;
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
  barangay: string;
  message: string;
  status: "Sent" | "Failed" | "Pending";
  timestamp: string;
  sentBy: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "MasterList" | "Pension" | "Census" | "Individual";
  category: "Demographic" | "Financial" | "Administrative";
  parameters: string[];
}

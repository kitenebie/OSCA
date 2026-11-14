import { RolePermission } from '../types';

export type ActionPermissionKey =
  | 'canSearch' | 'canFilterBrgy' | 'canFilterStatus' | 'canFilterPension'
  | 'canViewTableList' | 'canViewOnlyAssignedBrgy' | 'canEditRecord' | 'canViewProfile'
  | 'canViewPDFPreviewNCSC' | 'canViewPDFPreviewHonoring' | 'canArchive' | 'canUpdateStatus'
  | 'canViewIDCard' | 'canViewPendingApprovals' | 'canUseDashboardShortcuts'
  | 'canPreviewReports' | 'canDownloadReports' | 'canEditReportSignatories'
  | 'canViewSMSHistory' | 'canResendSMS' | 'canManageSessions'
  | 'canSearchFindUser' | 'canViewFindUserIDCard' | 'canSearchMappingBarangay' | 'canOpenSeniorFromMap'
  | 'canCreateClaimForm' | 'canEditClaimForm' | 'canApproveClaimForm' | 'canRejectClaimForm'
  | 'canRestoreClaimForm' | 'canToggleClaimRegistration'
  | 'canViewAuditLogs' | 'canMarkAuditLogsRead' | 'canClearAuditLogs'
  | 'canManageRoles' | 'canManageBarangays' | 'canManageIdCardDesign' | 'canManageSignatories';

type LegacyPermission = keyof RolePermission['permissions'];

export const ACTION_PERMISSIONS: { key: ActionPermissionKey; label: string; group: string; fallback: LegacyPermission }[] = [
  { key: 'canPreviewReports', label: 'Preview generated reports', group: 'Reports & Documents', fallback: 'canGenerateReports' },
  { key: 'canSearchFindUser', label: 'Search senior records in Find User', group: 'Find User', fallback: 'canAccessFindUser' },
  { key: 'canViewFindUserIDCard', label: 'View ID card after Find User search', group: 'Find User', fallback: 'canAccessFindUser' },
  { key: 'canViewTableList', label: 'View senior table list', group: 'Senior Profiles', fallback: 'canViewSeniors' },
  { key: 'canViewOnlyAssignedBrgy', label: 'Limit records to assigned barangay', group: 'Senior Profiles', fallback: 'canViewSeniors' },
  { key: 'canEditRecord', label: 'Edit senior record and photo', group: 'Senior Profiles', fallback: 'canEditSenior' },
  { key: 'canViewProfile', label: 'View senior profile', group: 'Senior Profiles', fallback: 'canAccessSeniorProfile' },
  { key: 'canViewIDCard', label: 'View or generate senior ID card', group: 'Senior Profiles', fallback: 'canAccessSeniorProfile' },
  { key: 'canUpdateStatus', label: 'Update senior status', group: 'Senior Profiles', fallback: 'canApproveReject' },
  { key: 'canArchive', label: 'Deactivate or reactivate senior record', group: 'Senior Profiles', fallback: 'canDeleteSenior' },
  { key: 'canSearchMappingBarangay', label: 'Search barangays on map', group: 'Mapping', fallback: 'canViewSeniors' },
  { key: 'canOpenSeniorFromMap', label: 'Open senior from map', group: 'Mapping', fallback: 'canViewSeniors' },
  { key: 'canCreateClaimForm', label: 'Create claim form', group: 'Grantee Claim Forms', fallback: 'canCreateSenior' },
  { key: 'canEditClaimForm', label: 'Edit claim form', group: 'Grantee Claim Forms', fallback: 'canEditSenior' },
  { key: 'canApproveClaimForm', label: 'Approve claim form', group: 'Grantee Claim Forms', fallback: 'canApproveReject' },
  { key: 'canRejectClaimForm', label: 'Reject claim form', group: 'Grantee Claim Forms', fallback: 'canApproveReject' },
  { key: 'canRestoreClaimForm', label: 'Restore claim form', group: 'Grantee Claim Forms', fallback: 'canApproveReject' },
  { key: 'canToggleClaimRegistration', label: 'Toggle claim registration', group: 'Grantee Claim Forms', fallback: 'canManageUsers' },
  { key: 'canViewAuditLogs', label: 'View audit logs', group: 'Audit Logs', fallback: 'canAccessConfiguration' },
  { key: 'canMarkAuditLogsRead', label: 'Mark logs as read', group: 'Audit Logs', fallback: 'canManageUsers' },
  { key: 'canClearAuditLogs', label: 'Clear audit logs', group: 'Audit Logs', fallback: 'canManageUsers' },
  { key: 'canManageRoles', label: 'Manage roles and permissions', group: 'Configuration', fallback: 'canManageUsers' },
  { key: 'canManageBarangays', label: 'Manage barangays', group: 'Configuration', fallback: 'canManageUsers' },
  { key: 'canManageIdCardDesign', label: 'Manage ID card design', group: 'Configuration', fallback: 'canManageUsers' },
  { key: 'canManageSignatories', label: 'Manage signatories', group: 'Configuration', fallback: 'canManageUsers' },
];

export const withActionPermissionDefaults = (
  permissions: RolePermission['permissions'],
  saved: Partial<Record<ActionPermissionKey, boolean>> = {},
): RolePermission['permissions'] => ({
  ...permissions,
  ...Object.fromEntries(ACTION_PERMISSIONS.map(({ key, fallback }) => [
    key,
    saved[key] ?? permissions[key] ?? (key === 'canViewOnlyAssignedBrgy' ? false : permissions[fallback]),
  ])),
});

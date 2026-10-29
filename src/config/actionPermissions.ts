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
    saved[key] ?? permissions[key] ?? (key === 'canArchive' ? permissions.canDeleteSenior || permissions.canEditSenior : permissions[fallback]),
  ])),
});

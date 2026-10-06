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
  { key: 'canSearch', label: 'Search records', group: 'Senior List', fallback: 'canViewSeniors' },
  { key: 'canFilterBrgy', label: 'Filter by barangay', group: 'Senior List', fallback: 'canViewSeniors' },
  { key: 'canFilterStatus', label: 'Filter by status', group: 'Senior List', fallback: 'canViewSeniors' },
  { key: 'canFilterPension', label: 'Filter by pension', group: 'Senior List', fallback: 'canViewSeniors' },
  { key: 'canViewTableList', label: 'View records table', group: 'Senior List', fallback: 'canViewSeniors' },
  { key: 'canViewOnlyAssignedBrgy', label: 'Restrict to assigned barangay', group: 'Senior List', fallback: 'canViewSeniors' },
  { key: 'canEditRecord', label: 'Edit record', group: 'Senior List & Profile', fallback: 'canEditSenior' },
  { key: 'canViewProfile', label: 'View senior profile', group: 'Senior List & Profile', fallback: 'canViewSeniors' },
  { key: 'canViewPDFPreviewNCSC', label: 'Preview NCSC PDF', group: 'Senior List & Profile', fallback: 'canViewSeniors' },
  { key: 'canViewPDFPreviewHonoring', label: 'Preview honoring PDF', group: 'Senior List & Profile', fallback: 'canViewSeniors' },
  { key: 'canArchive', label: 'Archive record', group: 'Senior List', fallback: 'canEditSenior' },
  { key: 'canUpdateStatus', label: 'Update status', group: 'Senior List & Profile', fallback: 'canEditSenior' },
  { key: 'canViewIDCard', label: 'View or generate ID card', group: 'Senior List & Profile', fallback: 'canViewSeniors' },
  { key: 'canViewPendingApprovals', label: 'View pending approvals', group: 'Dashboard', fallback: 'canViewSeniors' },
  { key: 'canUseDashboardShortcuts', label: 'Use dashboard shortcuts', group: 'Dashboard', fallback: 'canViewSeniors' },
  { key: 'canPreviewReports', label: 'Preview reports', group: 'Reports', fallback: 'canGenerateReports' },
  { key: 'canDownloadReports', label: 'Download or print reports', group: 'Reports', fallback: 'canGenerateReports' },
  { key: 'canEditReportSignatories', label: 'Edit report signatories', group: 'Reports', fallback: 'canGenerateReports' },
  { key: 'canViewSMSHistory', label: 'View SMS history', group: 'SMS Center', fallback: 'canSendSMS' },
  { key: 'canResendSMS', label: 'Resend failed SMS', group: 'SMS Center', fallback: 'canSendSMS' },
  { key: 'canManageSessions', label: 'Manage active sessions', group: 'User Management', fallback: 'canManageUsers' },
  { key: 'canSearchFindUser', label: 'Search users or OSCA ID', group: 'Find User', fallback: 'canViewSeniors' },
  { key: 'canViewFindUserIDCard', label: 'View lookup ID card', group: 'Find User', fallback: 'canViewSeniors' },
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

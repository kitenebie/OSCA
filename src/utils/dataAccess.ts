import { User } from '../types';

/**
 * The role values in existing records use more than one convention
 * (`Super Admin`, `super-admin`, and `super_admin`). Normalize them so the
 * barangay scope cannot be skipped because of formatting alone.
 */
export const isSuperAdmin = (role?: string): boolean =>
  role?.replace(/[^a-z0-9]/gi, '').toLowerCase() === 'superadmin';

/**
 * `undefined` means unrestricted (super admin), while `null` means that the
 * user has no barangay assignment and must not receive senior-specific data.
 */
export const getBarangayScope = (user?: Pick<User, 'role' | 'barangayAssigned'> | null): string | null | undefined => {
  if (!user) return null;
  if (isSuperAdmin(user.role)) return undefined;

  const assignedBarangay = user.barangayAssigned?.trim();
  return assignedBarangay || null;
};

export const isBarangayScopedUser = (user?: Pick<User, 'role' | 'barangayAssigned'> | null): boolean =>
  getBarangayScope(user) !== undefined;

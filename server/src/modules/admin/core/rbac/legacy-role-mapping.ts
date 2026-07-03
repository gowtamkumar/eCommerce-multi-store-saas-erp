import { UserRole } from '@/common/enums/user/user-role.enum'

/**
 * Maps legacy `users.role` values to seeded store RBAC role names when no
 * `user_role_assignments` row exists yet.
 */
export const LEGACY_USER_ROLE_TO_RBAC_ROLE_NAME: Partial<Record<UserRole, string>> = {
  [UserRole.ADMIN]: 'Super Admin',
  [UserRole.STORE_MANAGER]: 'Branch Manager',
  [UserRole.OPERATOR]: 'Sales Associate',
  [UserRole.EMPLOYEE]: 'Sales Associate',
  [UserRole.SUPPORT]: 'Viewer',
  [UserRole.MARKETING]: 'Sales Associate',
}

export function getLegacyRbacRoleName(legacyRole: string): string | null {
  const normalized = (legacyRole || '').toLowerCase() as UserRole
  return LEGACY_USER_ROLE_TO_RBAC_ROLE_NAME[normalized] ?? null
}

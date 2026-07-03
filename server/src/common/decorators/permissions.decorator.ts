import { SetMetadata } from '@nestjs/common'
import { SystemPermissionCode } from '../enums/user/permissions.enum'

export const PERMISSIONS_KEY = 'permissions'
export const ANY_PERMISSIONS_KEY = 'anyPermissions'

export const RequirePermissions = (...permissions: SystemPermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)

/** User needs at least ONE of the listed permissions (OR semantics). */
export const RequireAnyPermissions = (...permissions: SystemPermissionCode[]) =>
  SetMetadata(ANY_PERMISSIONS_KEY, permissions)

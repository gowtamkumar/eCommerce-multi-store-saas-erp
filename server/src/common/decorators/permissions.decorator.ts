import { SetMetadata } from '@nestjs/common'
import { SystemPermissionCode } from '../enums/user/permissions.enum'

export const PERMISSIONS_KEY = 'permissions'
export const RequirePermissions = (...permissions: SystemPermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)

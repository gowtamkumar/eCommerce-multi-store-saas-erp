import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { UserRole } from '../enums/user/user-role.enum'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPermissions) {
      return true // No permissions are required for this endpoint
    }

    const request = context.switchToHttp().getRequest()
    const { user } = request

    if (!user) {
      return false // Require auth first
    }

    const userRole = user.role || ''
    const isGlobalAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(userRole.toLowerCase())

    // 1. Super Admins and Admins bypass all dynamic permissions checks
    if (isGlobalAdmin) {
      return true
    }

    // 2. Load custom role permissions if assigned, or fallback to default legacy permissions
    let assignedPermissions: string[] = []
    if (user.roleEntity) {
      assignedPermissions = user.roleEntity.permissions?.map((p: any) => p.code) || []
    } else {
      // Fallback mapping for legacy role enums
      const roleName = (user.role || '').toLowerCase()
      if (roleName === UserRole.STORE_MANAGER || roleName === UserRole.ADMIN) {
        assignedPermissions = [
          // POS
          'pos:create-sale',
          'pos:manage-shifts',
          // HRM
          'hrm:clock-attendance',
          'hrm:manage-employees',
          'hrm:process-payroll',
          // Finance
          'finance:read-ledger',
          'finance:write-expense',
          // Orders
          'orders:read',
          'orders:write',
          'returns:read',
          'returns:write',
          'payments:read',
          // Marketing
          'coupons:manage',
          // Users
          'users:read',
          'users:invite',
        ]
      } else if (roleName === UserRole.OPERATOR || roleName === UserRole.SUPPORT) {
        assignedPermissions = [
          'pos:create-sale',
          'hrm:clock-attendance',
          'orders:read',
          'orders:write',
          'returns:read',
          'payments:read',
        ]
      } else if (roleName === UserRole.EMPLOYEE) {
        assignedPermissions = [
          'hrm:clock-attendance',
          'pos:create-sale',
          'orders:read',
        ]
      }
    }

    // 3. Verify that the user has all of the required permissions
    const hasAllRequired = requiredPermissions.every((p) => assignedPermissions.includes(p))
    if (!hasAllRequired) {
      throw new ForbiddenException(
        'Access Denied: You do not possess the required functional permission to execute this operation.',
      )
    }

    return true
  }
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { UserRole } from '../enums/user/user-role.enum'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPermissions) {
      return true // No permissions are required for this endpoint
    }

    const request = context.switchToHttp().getRequest()
    let { user } = request

    if (!user) {
      const authHeader = request.headers['authorization']
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        try {
          const secret = this.configService.get('JWT_SECRET_KEY')
          const decoded = jwt.verify(token, secret) as any
          if (decoded && decoded.sub) {
            user = await this.userService.getUser(decoded.sub)
            request.user = user
          }
        } catch (error) {
          // Ignore token parsing error, let it fall through
        }
      }
    }

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
          'promotions:manage',
          'marketing:manage',
          // Users
          'users:read',
          'users:invite',
          // Catalog
          'catalog:read',
          'catalog:write',
          // CRM
          'crm:read',
          'crm:write',
          // Purchasing
          'purchasing:read',
          'purchasing:write',
          'inventory:read',
          'inventory:write',
          'supplier:manage',
          // Accounting
          'accounting:read',
          'accounting:write',
          'invoices:manage',
          // Reports
          'reports:read',
          // Logistics
          'logistics:manage',
          'fulfillment:manage',
          // Settings
          'settings:manage',
          // Content
          'content:manage',
        ]
      } else if (roleName === UserRole.OPERATOR || roleName === UserRole.SUPPORT) {
        assignedPermissions = [
          'pos:create-sale',
          'hrm:clock-attendance',
          'orders:read',
          'orders:write',
          'returns:read',
          'payments:read',
          'catalog:read',
          'crm:read',
          'crm:write',
          'inventory:read',
          'reports:read',
          'fulfillment:manage',
        ]
      } else if (roleName === UserRole.EMPLOYEE) {
        assignedPermissions = [
          'hrm:clock-attendance',
          'pos:create-sale',
          'orders:read',
          'catalog:read',
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

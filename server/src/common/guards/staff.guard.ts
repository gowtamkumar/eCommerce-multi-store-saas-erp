import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CUSTOMER_ROUTE_KEY } from '../decorators/customer-route.decorator'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { UserRole } from '../enums/user/user-role.enum'

const STAFF_ROLES: ReadonlySet<string> = new Set([
  UserRole.ADMIN,
  UserRole.STORE_MANAGER,
  UserRole.OPERATOR,
  UserRole.SUPPORT,
  UserRole.MARKETING,
  UserRole.SUPER_ADMIN,
  UserRole.EMPLOYEE,
])

@Injectable()
export class StaffGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const isCustomerRoute = this.reflector.getAllAndOverride<boolean>(CUSTOMER_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest()
    const { user } = request
    if (!user) return true

    const role = (user.role || '').toLowerCase()

    if (role === UserRole.SUPER_ADMIN) return true

    if (role === UserRole.USER) {
      if (isCustomerRoute) return true
      throw new ForbiddenException('Access denied. Staff credentials required.')
    }

    if (!STAFF_ROLES.has(role)) {
      throw new ForbiddenException('Access denied. Unrecognized role.')
    }

    return true
  }
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import { TenantStatus } from '../enums/tenant/tenant-status.enum'
import { UserRole } from '../enums/user/user-role.enum'
import { IS_PUBLIC_DURING_EXPIRATION_KEY } from '../decorators/public-during-expiration.decorator'

@Injectable()
export class TenantStatusGuard implements CanActivate {
  constructor(
    private readonly tenantService: TenantService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const tenantId = request.tenantId
    const user = request.user

    // 1. Allow Super Admin to bypass all tenant status checks
    if (user?.role === UserRole.SUPER_ADMIN) {
      return true
    }

    if (!tenantId) {
      return true // No tenant context, let other guards handle it
    }

    // 2. Check if the route is explicitly allowed during expiration
    const isPublicDuringExpiration = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_DURING_EXPIRATION_KEY,
      [context.getHandler(), context.getClass()],
    )

    try {
      const tenant = await this.tenantService.findOneTenants(tenantId)

      // 3. Suspended stores are always blocked
      if (tenant.status === TenantStatus.SUSPENDED) {
        throw new ForbiddenException({
          success: false,
          message: 'Your store has been suspended by the administrator. Please contact support.',
          status: TenantStatus.SUSPENDED,
        })
      }

      // 4. Handle Expired status
      if (tenant.status === TenantStatus.EXPIRED || tenant.isExpired) {
        if (isPublicDuringExpiration) {
          return true
        }
        throw new ForbiddenException({
          success: false,
          message: 'Your subscription has expired. Please renew to continue using the store.',
          status: TenantStatus.EXPIRED,
        })
      }

      return true
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
      return true // If tenant not found, let other logic handle it
    }
  }
}

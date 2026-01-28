import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { TenantService } from '../../modules/tenant/tenant.service'

@Injectable()
export class TenantStatusGuard implements CanActivate {
  constructor(private readonly tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const tenantId = request.tenantId

    if (!tenantId) {
      return true // No tenant context, let other guards handle it
    }

    try {
      const tenant = await this.tenantService.findOne(tenantId)

      if (tenant.status === 'suspended') {
        throw new ForbiddenException({
          success: false,
          message: 'Your store has been suspended by the administrator. Please contact support.',
          status: 'suspended',
        })
      }

      return true
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
      return true // If tenant not found, let other logic handle it
    }
  }
}

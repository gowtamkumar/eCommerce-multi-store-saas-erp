import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import { REQUIRED_FEATURE_KEY } from '../decorators/require-feature.decorator'
import { UserRole } from '../enums/user/user-role.enum'

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly tenantService: TenantService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const tenantId = request.tenantId
    const user = request.user
    console.log('user?.role', user?.role)

    // 1. Allow Super Admin to bypass all feature checks
    if (user?.role === UserRole.SUPER_ADMIN) {
      return true
    }

    if (!tenantId) {
      return true // No tenant context, let other guards handle it
    }

    // 2. Identify required feature for this route
    const requiredFeature = this.reflector.getAllAndOverride<string>(REQUIRED_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredFeature) {
      return true // No specific feature required
    }

    try {
      const tenant = await this.tenantService.findOneTenants(tenantId)

      if (!tenant) {
        throw new ForbiddenException('Tenant not found')
      }

      // 3. Verify if plan has the feature
      const features = tenant.subscriptionPlan?.features || []

      if (!features.includes(requiredFeature)) {
        throw new ForbiddenException({
          success: false,
          message: `Upgrade your plan to access the '${requiredFeature}' feature.`,
          requiredFeature,
        })
      }

      return true
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
      return false
    }
  }
}

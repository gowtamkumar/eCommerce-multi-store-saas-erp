import { TenantFeatureEntity } from '@/modules/system/tenant/entities/tenant-feature.entity'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { REQUIRED_FEATURE_KEY } from '../decorators/require-feature.decorator'
import { UserRole } from '../enums/user/user-role.enum'

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly tenantService: TenantService,
    private readonly reflector: Reflector,
    @InjectRepository(TenantFeatureEntity)
    private readonly tenantFeatureRepo: Repository<TenantFeatureEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 0. Bypass subscription check for public endpoints
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

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
      // 3. Verify if feature is explicitly enabled in tenant_features
      const feature = await this.tenantFeatureRepo.findOne({
        where: { tenantId, featureSlug: requiredFeature },
      })

      if (feature && !feature.isEnabled) {
        throw new ForbiddenException({
          success: false,
          message: `The '${requiredFeature}' feature is currently disabled for your store.`,
          requiredFeature,
        })
      }

      // 4. Fallback check: verify if plan has the feature (for legacy or before migration)
      const tenant = await this.tenantService.findOneTenants(tenantId)
      if (!tenant) {
        throw new ForbiddenException('Tenant not found')
      }

      const features = tenant.subscriptionPlan?.features || []

      // If neither explicitly enabled in DB nor present in plan JSONB array, deny
      if (!feature && !features.includes(requiredFeature)) {
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


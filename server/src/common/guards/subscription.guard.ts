import { StoreFeatureEntity } from '@/modules/system/store/entities/store-feature.entity'
import { StoreService } from '@/modules/system/store/store.service'
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
    private readonly storeService: StoreService,
    private readonly reflector: Reflector,
    @InjectRepository(StoreFeatureEntity)
    private readonly storeFeatureRepo: Repository<StoreFeatureEntity>,
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
    const storeId = request.storeId
    const user = request.user

    // 1. Allow Super Admin to bypass all feature checks
    if (user?.role === UserRole.SUPER_ADMIN) {
      return true
    }

    if (!storeId) {
      return true // No store context, let other guards handle it
    }

    // 2. Identify required feature for this route
    const requiredFeature = this.reflector.getAllAndOverride<string>(REQUIRED_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredFeature) {
      return true // No specific feature required
    }

    const featureSlug = requiredFeature

    try {
      // 3. Verify if feature is explicitly enabled/disabled in store_features
      const featureDb = await this.storeFeatureRepo.findOne({
        where: {
          storeId,
          featureSlug,
        },
      })

      // If explicitly disabled in DB, deny access
      if (featureDb && !featureDb.isEnabled) {
        throw new ForbiddenException({
          success: false,
          message: `The '${requiredFeature}' feature is currently disabled for your store.`,
          requiredFeature,
        })
      }

      // If explicitly enabled in DB, allow access
      if (featureDb && featureDb.isEnabled) {
        return true
      }

      // 4. Fallback check: verify if plan has the feature
      const store = await this.storeService.findOneStores(storeId)
      if (!store) {
        throw new ForbiddenException('Store not found')
      }

      const planFeatures = store.subscriptionPlan?.features || []

      // Check if plan features contains featureSlug or requiredFeature (fallback)
      const hasPlanAccess =
        planFeatures.includes(featureSlug) || planFeatures.includes(requiredFeature)

      if (!hasPlanAccess) {
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

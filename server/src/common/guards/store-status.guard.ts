import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { StoreService } from '@/modules/system/store/store.service'
import { StoreStatus } from '../enums/store/store-status.enum'
import { UserRole } from '../enums/user/user-role.enum'
import { IS_PUBLIC_DURING_EXPIRATION_KEY } from '../decorators/public-during-expiration.decorator'
import { SubscriptionStatus } from '../enums/subscription/subscription-status.enum'

@Injectable()
export class StoreStatusGuard implements CanActivate {
  constructor(
    private readonly storeService: StoreService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const storeId = request.storeId
    const user = request.user

    // 1. Allow Super Admin to bypass all store status checks
    if (user?.role === UserRole.SUPER_ADMIN) {
      return true
    }

    if (!storeId) {
      return true // No store context, let other guards handle it
    }

    // 2. Check if the route is explicitly allowed during expiration
    const isPublicDuringExpiration = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_DURING_EXPIRATION_KEY,
      [context.getHandler(), context.getClass()],
    )

    try {
      const store = await this.storeService.findOneStores(storeId)

      // 3. Suspended stores are always blocked
      if (store.status === StoreStatus.SUSPENDED) {
        throw new ForbiddenException({
          success: false,
          message: 'Your store has been suspended by the administrator. Please contact support.',
          status: StoreStatus.SUSPENDED,
        })
      }

      // 4. Handle Expired status (Trial or Subscription)
      if (store.status === StoreStatus.EXPIRED || store.isExpired) {
        if (isPublicDuringExpiration) {
          return true
        }

        const graceDays = Number(this.configService.get('SUBSCRIPTION_GRACE_DAYS') ?? 0)
        if (Number.isFinite(graceDays) && graceDays > 0 && store.subscriptionEndsAt) {
          const graceEndsAt = new Date(store.subscriptionEndsAt)
          graceEndsAt.setDate(graceEndsAt.getDate() + graceDays)
          if (new Date() <= graceEndsAt) {
            return true
          }
        }

        const isTrial = store.subscriptionStatus === SubscriptionStatus.TRIAL
        const message = isTrial
          ? 'Your 14-day trial period has ended. Please upgrade your plan to continue using the store.'
          : 'Your subscription has expired. Please renew to continue using the store.'

        throw new ForbiddenException({
          success: false,
          message,
          status: StoreStatus.EXPIRED,
          subscriptionStatus: store.subscriptionStatus,
        })
      }

      return true
    } catch (error) {
      if (error instanceof ForbiddenException) throw error
      return true // If store not found, let other logic handle it
    }
  }
}

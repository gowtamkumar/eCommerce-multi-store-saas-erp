import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { LoyaltyService } from './loyalty.service'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { LoyaltyTransactionType } from '@/common/enums/loyalty-transaction-type.enum'
import { WalletTransactionType } from '@/common/enums/wallet-transaction-type.enum'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly loyaltyService: LoyaltyService,
    private readonly walletService: WalletService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Generates a unique, readable referral code for a new user registration.
   */
  async generateUniqueReferralCode(
    name: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<string> {
    const em = manager || this.dataSource.manager
    const prefix = name
      ? name
          .replace(/[^a-zA-Z]/g, '')
          .substring(0, 6)
          .toUpperCase()
      : 'REF'

    let isUnique = false
    let referralCode = ''
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
      referralCode = `${prefix}-${suffix}`

      // Check if it already exists
      const existing = await em.findOne(UserEntity, { where: { referralCode, tenantId } })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      // Fallback to timestamp UUID chunk if attempts exhaust
      referralCode = `${prefix}-${Date.now().toString(36).substring(4).toUpperCase()}`
    }

    return referralCode
  }

  /**
   * Links a new user to their referrer by verifying the provided referral code.
   *
   * First-attribution wins: the UPDATE only fires when `referred_by_id`
   * is still NULL. A second referral submission for an already-attributed
   * user is silently ignored (the original referrer keeps the credit).
   */
  async linkReferral(
    refereeId: string,
    referralCode: string,
    tenantId: string,
    manager?: EntityManager,
    source?: string,
  ): Promise<{ attributed: boolean; alreadyAttributed?: boolean }> {
    const em = manager || this.dataSource.manager
    if (!referralCode) return { attributed: false }

    const referrer = await em.findOne(UserEntity, { where: { referralCode, tenantId } })
    if (!referrer) {
      this.logger.warn(`Referral code "${referralCode}" not found for tenant ${tenantId}`)
      return { attributed: false }
    }

    if (referrer.id === refereeId) {
      throw new BadRequestException('You cannot refer yourself')
    }

    // Atomic first-wins attribution. Adds WHERE referred_by_id IS NULL so a
    // late referral cannot overwrite an existing one.
    const result = await em
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        referredById: referrer.id,
        referredAt: () => 'NOW()',
        referralSource: source ?? null,
      })
      .where('id = :refereeId', { refereeId })
      .andWhere('tenant_id = :tenantId', { tenantId })
      .andWhere('referred_by_id IS NULL')
      .execute()

    if ((result.affected ?? 0) === 0) {
      const existing = await em.findOne(UserEntity, {
        where: { id: refereeId, tenantId },
        select: {
          id: true,
          referredById: true,
        },
      })
      this.logger.log(
        `Referral attempt rejected for ${refereeId}: already attributed to ${existing?.referredById ?? 'n/a'}`,
      )
      return { attributed: false, alreadyAttributed: true }
    }

    this.logger.log(
      `Linked referee ${refereeId} to referrer ${referrer.id} (source=${source ?? 'n/a'})`,
    )
    return { attributed: true }
  }

  /**
   * Processes reward logic for the referrer when the referee completes their first qualified purchase.
   */
  async processFirstPurchaseReward(
    refereeId: string,
    orderId: string,
    orderAmount: number,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager || this.dataSource.manager
    const tenantId = ctx.tenantId

    // 1. Get referee user info
    const referee = await em.findOne(UserEntity, { where: { id: refereeId, tenantId } })
    if (!referee || !referee.referredById) {
      return // No referrer associated
    }

    // 2. Verify if this is truly the referee's first qualified purchase (no other completed orders besides this one)
    const priorOrdersCount = await em.count(OrderEntity, {
      where: {
        userId: refereeId,
        tenantId,
        paymentStatus: 'PAID' as any, // Only count successfully paid/completed orders
      },
    })

    // If there's already more than 1 paid order (including the current one if already updated to paid), it's not the first.
    if (priorOrdersCount > 1) {
      this.logger.log(
        `Referee ${refereeId} already has prior completed orders. Referral reward skipped.`,
      )
      return
    }

    // 3. Check loyalty configs
    const config = await this.loyaltyService.getOrCreateConfig(tenantId, em)
    if (!config.isEnabled) {
      return
    }

    // 4. Verify minimum order amount threshold
    if (Number(orderAmount) < Number(config.refereeMinPurchase)) {
      this.logger.log(
        `Order amount $${orderAmount} is less than required referee minimum purchase $${config.refereeMinPurchase} for referral reward`,
      )
      return
    }

    const referrerId = referee.referredById
    const rewardAmount = Number(config.referralRewardAmount)

    if (rewardAmount <= 0) return

    // 5. Award the referrer based on rules configuration
    try {
      if (config.referralRewardType === 'WALLET') {
        await this.walletService.creditWallet(
          {
            customerId: referrerId,
            amount: rewardAmount,
            type: WalletTransactionType.STORE_CREDIT,
            referenceType: 'REFERRAL',
            referenceId: refereeId,
            note: `Referral bonus reward for inviting customer ${referee.name || 'Friend'} (First Purchase completed)`,
          },
          ctx,
          em,
        )
        this.logger.log(`Rewarded referrer ${referrerId} with $${rewardAmount} store credit`)
        await this.notifyReferralWalletReward(referrerId, rewardAmount, ctx)
      } else {
        // Award as loyalty points
        await this.loyaltyService.creditPoints(
          {
            customerId: referrerId,
            points: rewardAmount,
            type: LoyaltyTransactionType.REFERRAL_BONUS,
            referenceType: 'REFERRAL',
            referenceId: refereeId,
            note: `Referral bonus of ${rewardAmount} points for inviting customer ${referee.name || 'Friend'}`,
          },
          ctx,
          em,
        )
        this.logger.log(`Rewarded referrer ${referrerId} with ${rewardAmount} loyalty points`)
      }
    } catch (err: any) {
      this.logger.error(`Failed to award referral bonus to referrer ${referrerId}: ${err.message}`)
    }
  }

  private async notifyReferralWalletReward(
    referrerId: string,
    rewardAmount: number,
    ctx: RequestContextDto,
  ): Promise<void> {
    try {
      await this.notificationService.createNotification(
        {
          title: 'Referral Bonus Earned',
          message: `Referral store credit of ${rewardAmount.toFixed(2)} has been added to your wallet.`,
          type: 'SUCCESS',
          link: '/account/wallet',
          userId: referrerId,
        },
        ctx.tenantId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger referral wallet notification: ${e.message}`)
    }
  }
}

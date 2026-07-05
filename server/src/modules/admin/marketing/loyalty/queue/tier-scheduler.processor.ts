import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { DataSource } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { LoyaltyConfigEntity } from '../entities/loyalty-config.entity'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { LoyaltyService } from '../services/loyalty.service'

@Processor('loyalty')
export class TierSchedulerProcessor extends WorkerHost {
  private readonly logger = new Logger(TierSchedulerProcessor.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly loyaltyService: LoyaltyService,
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing loyalty job ${job.id} (Name: ${job.name})`)

    switch (job.name) {
      case 'assess-tiers':
        await this.runTiersAssessment()
        break
      case 'expire-points':
        await this.runPointsExpiration()
        break
      default:
        this.logger.warn(`Unknown job name: ${job.name}`)
    }
  }

  /**
   * Sweep across stores and retire any earn batches whose `expires_at`
   * has passed. Per-store transaction inside the service keeps each store
   * isolated from any failure in another.
   */
  private async runPointsExpiration(): Promise<void> {
    const configs = await this.dataSource.manager.find(LoyaltyConfigEntity)
    let totalBatches = 0
    let totalPoints = 0
    for (const config of configs) {
      if (!config.isEnabled || !config.pointsExpireAfterDays) continue
      try {
        const { batchesExpired, pointsExpired } = await this.loyaltyService.expirePoints(
          config.storeId,
        )
        totalBatches += batchesExpired
        totalPoints += pointsExpired
        if (batchesExpired) {
          this.logger.log(
            `store=${config.storeId} expired batches=${batchesExpired} points=${pointsExpired}`,
          )
        }
      } catch (e: any) {
        this.logger.error(`Expiry sweep failed for store ${config.storeId}: ${e.message}`)
      }
    }
    this.logger.log(`Points expiry sweep done: batches=${totalBatches} pts=${totalPoints}`)
  }

  /**
   * Run membership tier assessments across all stores.
   */
  private async runTiersAssessment() {
    const em = this.dataSource.manager

    // 1. Get all loyalty configs in the database
    const configs = await em.find(LoyaltyConfigEntity)
    this.logger.log(`Found ${configs.length} loyalty configurations to process`)

    for (const config of configs) {
      if (!config.isEnabled) {
        this.logger.log(`Loyalty is disabled for store ${config.storeId}. Skipping.`)
        continue
      }

      try {
        await this.assessStoreTiers(config)
      } catch (err: any) {
        this.logger.error(`Error assessing tiers for store ${config.storeId}: ${err.message}`)
      }
    }
  }

  /**
   * Process tier assessment for a single store.
   */
  private async assessStoreTiers(config: LoyaltyConfigEntity) {
    const em = this.dataSource.manager
    const storeId = config.storeId

    // Find all active customer users in this store
    const customers = await em.find(UserEntity, {
      where: { storeId, role: UserRole.USER }, // Only assess customer accounts
    })

    this.logger.log(
      `Assessing membership tiers for ${customers.length} customers in store ${storeId}`,
    )

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    for (const customer of customers) {
      // Calculate customer total spending in the last 12 months on paid orders
      const orderStats = await em
        .createQueryBuilder(OrderEntity, 'order')
        .select('SUM(order.totalAmount)', 'totalSpent')
        .where('order.userId = :userId', { userId: customer.id })
        .andWhere('order.storeId = :storeId', { storeId })
        .andWhere('order.paymentStatus = :paymentStatus', { paymentStatus: 'PAID' }) // Paid status
        .andWhere('order.createdAt >= :oneYearAgo', { oneYearAgo })
        .getRawOne()

      const totalSpent = Number(orderStats?.totalSpent || 0)

      // Determine appropriate tier
      let calculatedTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = 'BRONZE'
      if (totalSpent >= Number(config.platinumTierThreshold)) {
        calculatedTier = 'PLATINUM'
      } else if (totalSpent >= Number(config.goldTierThreshold)) {
        calculatedTier = 'GOLD'
      } else if (totalSpent >= Number(config.silverTierThreshold)) {
        calculatedTier = 'SILVER'
      }

      const currentTier = customer.membershipTier || 'BRONZE'

      if (calculatedTier !== currentTier) {
        this.logger.log(
          `Updating customer ${customer.id} tier from ${currentTier} to ${calculatedTier} (Spent: $${totalSpent} in 12m)`,
        )

        customer.membershipTier = calculatedTier
        await em.save(UserEntity, customer)

        // Dispatch status notification alert
        try {
          const isUpgrade = this.isTierUpgrade(currentTier, calculatedTier)
          const title = isUpgrade ? 'Membership Tier Upgraded!' : 'Membership Tier Adjusted'
          const message = isUpgrade
            ? `Congratulations! You have been upgraded to the ${calculatedTier} Membership Tier. Enjoy new point multipliers and rewards!`
            : `Your rolling 12-month spending ($${totalSpent.toFixed(2)}) places you in the ${calculatedTier} tier.`

          await this.notificationService.createNotification(
            {
              title,
              message,
              type: isUpgrade ? 'SUCCESS' : 'INFO',
              link: '/store/loyalty',
              userId: customer.id, // Direct message to this customer user
            },
            storeId,
          )
        } catch (e: any) {
          this.logger.error(`Failed to send tier notification to user ${customer.id}: ${e.message}`)
        }
      }
    }
  }

  /**
   * Helper to check if tier modification is an upgrade.
   */
  private isTierUpgrade(oldTier: string, newTier: string): boolean {
    const weights: Record<string, number> = {
      BRONZE: 1,
      SILVER: 2,
      GOLD: 3,
      PLATINUM: 4,
    }
    return (weights[newTier] || 1) > (weights[oldTier] || 1)
  }
}

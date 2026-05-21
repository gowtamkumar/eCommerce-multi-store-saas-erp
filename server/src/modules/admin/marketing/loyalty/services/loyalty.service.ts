import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { LoyaltyLedgerEntity } from '../entities/loyalty-ledger.entity'
import { LoyaltyConfigEntity } from '../entities/loyalty-config.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { LoyaltyTransactionType } from '@/common/enums/loyalty-transaction-type.enum'

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name)

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Retrieves the tenant's loyalty configuration or creates a default one if it doesn't exist.
   */
  async getOrCreateConfig(tenantId: string, manager?: EntityManager): Promise<LoyaltyConfigEntity> {
    const em = manager || this.dataSource.manager
    let config = await em.findOne(LoyaltyConfigEntity, { where: { tenantId } })
    if (!config) {
      config = em.create(LoyaltyConfigEntity, { tenantId })
      config = await em.save(LoyaltyConfigEntity, config)
    }
    return config
  }

  /**
   * Retrieves the current points balance of a customer.
   */
  async getAvailablePoints(customerId: string, tenantId: string, manager?: EntityManager): Promise<number> {
    const em = manager || this.dataSource.manager
    const user = await em.findOne(UserEntity, { where: { id: customerId, tenantId } })
    return user ? user.loyaltyPointsBalance : 0
  }

  /**
   * Credits loyalty points to a customer's balance.
   */
  async creditPoints(
    data: {
      customerId: string
      points: number
      type: LoyaltyTransactionType
      referenceType?: string
      referenceId?: string
      note?: string
      createdBy?: string
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<LoyaltyLedgerEntity> {
    const em = manager || this.dataSource.manager
    const points = Math.max(0, Math.round(data.points))
    if (points === 0) {
      return null as any
    }

    const tenantId = ctx.tenantId

    // Row lock user for update to prevent race conditions on balance updates
    const user = await em.findOne(UserEntity, {
      where: { id: data.customerId, tenantId },
      lock: { mode: 'pessimistic_write' },
    })

    if (!user) {
      throw new BadRequestException('Customer user not found')
    }

    const currentBalance = user.loyaltyPointsBalance || 0
    const newBalance = currentBalance + points

    // Update user balance
    user.loyaltyPointsBalance = newBalance
    await em.save(UserEntity, user)

    // Save ledger entry
    const ledgerEntry = em.create(LoyaltyLedgerEntity, {
      customerId: data.customerId,
      type: data.type,
      points,
      balanceAfter: newBalance,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      note: data.note,
      tenantId,
      createdBy: data.createdBy || ctx.userId,
    })

    return await em.save(LoyaltyLedgerEntity, ledgerEntry)
  }

  /**
   * Debits loyalty points from a customer's balance.
   */
  async debitPoints(
    data: {
      customerId: string
      points: number
      type: LoyaltyTransactionType
      referenceType?: string
      referenceId?: string
      note?: string
      createdBy?: string
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<LoyaltyLedgerEntity> {
    const em = manager || this.dataSource.manager
    const points = Math.max(0, Math.round(data.points))
    if (points === 0) {
      return null as any
    }

    const tenantId = ctx.tenantId

    // Row lock user for update
    const user = await em.findOne(UserEntity, {
      where: { id: data.customerId, tenantId },
      lock: { mode: 'pessimistic_write' },
    })

    if (!user) {
      throw new BadRequestException('Customer user not found')
    }

    const currentBalance = user.loyaltyPointsBalance || 0
    if (currentBalance < points) {
      throw new BadRequestException(`Insufficient points balance. Available: ${currentBalance}, Required: ${points}`)
    }

    const newBalance = currentBalance - points

    // Update user balance
    user.loyaltyPointsBalance = newBalance
    await em.save(UserEntity, user)

    // Save ledger entry
    const ledgerEntry = em.create(LoyaltyLedgerEntity, {
      customerId: data.customerId,
      type: data.type,
      points: -points, // Negative for debit entries
      balanceAfter: newBalance,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      note: data.note,
      tenantId,
      createdBy: data.createdBy || ctx.userId,
    })

    return await em.save(LoyaltyLedgerEntity, ledgerEntry)
  }

  /**
   * Evaluates points to credit to a customer for completing a purchase/payment.
   */
  async processOrderEarning(
    order: any, // OrderEntity type
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<void> {
    const em = manager || this.dataSource.manager
    const config = await this.getOrCreateConfig(ctx.tenantId, em)
    if (!config.isEnabled) {
      return
    }

    const customerId = order.userId
    if (!customerId) {
      return
    }

    // Resolve membership tier multiplier
    const user = await em.findOne(UserEntity, { where: { id: customerId, tenantId: ctx.tenantId } })
    if (!user) {
      return
    }

    let multiplier = 1.0
    switch (user.membershipTier) {
      case 'SILVER':
        multiplier = Number(config.silverMultiplier)
        break
      case 'GOLD':
        multiplier = Number(config.goldMultiplier)
        break
      case 'PLATINUM':
        multiplier = Number(config.platinumMultiplier)
        break
      default:
        multiplier = 1.0
    }

    const baseAmount = Number(order.totalAmount || 0)
    // Exclude shipping and tax from point calculation if needed, but totalAmount is simpler & standard
    const pointsToEarn = Math.floor(baseAmount * Number(config.pointsPerCurrencySpent) * multiplier)

    if (pointsToEarn > 0) {
      await this.creditPoints(
        {
          customerId,
          points: pointsToEarn,
          type: LoyaltyTransactionType.EARNED,
          referenceType: 'ORDER',
          referenceId: order.id,
          note: `Earned points from Order #${order.id.substring(0, 8)} (${user.membershipTier} tier ${multiplier}x multiplier)`,
        },
        ctx,
        em,
      )
    }
  }

  /**
   * Fetches full history log for a customer.
   */
  async getPointsHistory(customerId: string, tenantId: string): Promise<LoyaltyLedgerEntity[]> {
    return await this.dataSource.manager.find(LoyaltyLedgerEntity, {
      where: { customerId, tenantId },
      order: { createdAt: 'DESC' },
    })
  }
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { LoyaltyLedgerEntity } from '../entities/loyalty-ledger.entity'
import { LoyaltyConfigEntity } from '../entities/loyalty-config.entity'
import { LoyaltyRuleEntity } from '../entities/loyalty-rule.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { LoyaltyTransactionType } from '@/common/enums/loyalty-transaction-type.enum'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Retrieves the store's loyalty configuration or creates a default one if it doesn't exist.
   */
  async getOrCreateConfig(storeId: string, manager?: EntityManager): Promise<LoyaltyConfigEntity> {
    const em = manager || this.dataSource.manager
    let config = await em.findOne(LoyaltyConfigEntity, { where: { storeId } })
    if (!config) {
      config = em.create(LoyaltyConfigEntity, { storeId })
      config = await em.save(LoyaltyConfigEntity, config)
    }
    return config
  }

  /**
   * Retrieves the current points balance of a customer.
   */
  async getAvailablePoints(
    customerId: string,
    storeId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const em = manager || this.dataSource.manager
    const user = await em.findOne(UserEntity, { where: { id: customerId, storeId } })
    return user ? user.loyaltyPointsBalance : 0
  }

  /**
   * Credits loyalty points to a customer's balance.
   *
   * When called WITHOUT a manager, the operation is wrapped in its own
   * transaction so the user-balance update and ledger insert remain
   * atomic — previously a crash between the two would corrupt the
   * running balance.
   *
   * Idempotency: if `referenceType`+`referenceId` is supplied, a unique
   * partial index (see migration `MarketingMarketingHardening`) prevents
   * duplicate awards for the same source event. The duplicate insert is
   * caught and ignored.
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
      expiresAt?: Date | null
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<LoyaltyLedgerEntity | null> {
    const points = Math.max(0, Math.round(data.points))
    if (points === 0) return null

    if (manager) {
      const ledger = await this.creditPointsInternal(data, ctx, manager, points)
      await this.notifyPointsCredited(data.customerId, points, ledger, ctx)
      return ledger
    }
    const ledger = await this.dataSource.transaction((em) =>
      this.creditPointsInternal(data, ctx, em, points),
    )
    await this.notifyPointsCredited(data.customerId, points, ledger, ctx)
    return ledger
  }

  private async creditPointsInternal(
    data: {
      customerId: string
      points: number
      type: LoyaltyTransactionType
      referenceType?: string
      referenceId?: string
      note?: string
      createdBy?: string
      expiresAt?: Date | null
    },
    ctx: RequestContextDto,
    em: EntityManager,
    points: number,
  ): Promise<LoyaltyLedgerEntity | null> {
    const storeId = ctx.storeId

    // Row lock user for update to prevent race conditions on balance updates
    const user = await em.findOne(UserEntity, {
      where: { id: data.customerId, storeId },
      lock: { mode: 'pessimistic_write' },
    })

    if (!user) {
      throw new BadRequestException('Customer user not found')
    }

    // Try to insert the ledger entry first; if a duplicate row already
    // exists for the same (store, customer, type, referenceType, referenceId)
    // we skip the balance update entirely — that's how we guarantee a
    // single earn per order/referral/etc.
    const ledgerEntry = em.create(LoyaltyLedgerEntity, {
      customerId: data.customerId,
      type: data.type,
      points,
      balanceAfter: (user.loyaltyPointsBalance || 0) + points,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      note: data.note,
      storeId,
      createdBy: data.createdBy || ctx.userId,
      expiresAt: data.expiresAt ?? null,
      remainingPoints: points,
    })

    try {
      const saved = await em.save(LoyaltyLedgerEntity, ledgerEntry)
      user.loyaltyPointsBalance = (user.loyaltyPointsBalance || 0) + points
      await em.save(UserEntity, user)
      return saved
    } catch (e: any) {
      if (e?.code === '23505') {
        this.logger.warn(
          `Duplicate loyalty earn suppressed: customer=${data.customerId} ` +
            `type=${data.type} ref=${data.referenceType}:${data.referenceId}`,
        )
        return null
      }
      throw e
    }
  }

  /**
   * Debits loyalty points from a customer's balance.
   *
   * Wraps itself in a transaction when no manager is passed so the user
   * balance update and ledger insert remain atomic. Burns from oldest
   * unexpired earnings first (FIFO) by drawing down the
   * `remaining_points` columns on the credit batches.
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
  ): Promise<LoyaltyLedgerEntity | null> {
    const points = Math.max(0, Math.round(data.points))
    if (points === 0) return null

    if (manager) {
      return this.debitPointsInternal(data, ctx, manager, points)
    }
    return this.dataSource.transaction((em) => this.debitPointsInternal(data, ctx, em, points))
  }

  private async debitPointsInternal(
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
    em: EntityManager,
    points: number,
  ): Promise<LoyaltyLedgerEntity> {
    const storeId = ctx.storeId

    // Row lock user for update
    const user = await em.findOne(UserEntity, {
      where: { id: data.customerId, storeId },
      lock: { mode: 'pessimistic_write' },
    })

    if (!user) {
      throw new BadRequestException('Customer user not found')
    }

    const currentBalance = user.loyaltyPointsBalance || 0
    if (currentBalance < points) {
      throw new BadRequestException(
        `Insufficient points balance. Available: ${currentBalance}, Required: ${points}`,
      )
    }

    // FIFO redemption: drain remaining_points from the oldest unexpired
    // earn batches first. Skips the loop silently if older entries pre-date
    // the column (remaining_points = 0) and falls back to balance-only mode.
    const now = new Date()
    let remaining = points
    const batches = await em
      .createQueryBuilder(LoyaltyLedgerEntity, 'l')
      .where('l.store_id = :storeId AND l.customer_id = :customerId', {
        storeId,
        customerId: data.customerId,
      })
      .andWhere('l.remaining_points > 0')
      .andWhere('(l.expires_at IS NULL OR l.expires_at > :now)', { now })
      .orderBy('l.created_at', 'ASC')
      .setLock('pessimistic_write')
      .getMany()

    for (const batch of batches) {
      if (remaining <= 0) break
      const take = Math.min(batch.remainingPoints, remaining)
      batch.remainingPoints -= take
      remaining -= take
      await em.save(LoyaltyLedgerEntity, batch)
    }

    const newBalance = currentBalance - points
    user.loyaltyPointsBalance = newBalance
    await em.save(UserEntity, user)

    const ledgerEntry = em.create(LoyaltyLedgerEntity, {
      customerId: data.customerId,
      type: data.type,
      points: -points, // Negative for debit entries
      balanceAfter: newBalance,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      note: data.note,
      storeId,
      createdBy: data.createdBy || ctx.userId,
      remainingPoints: 0,
    })

    return await em.save(LoyaltyLedgerEntity, ledgerEntry)
  }

  /**
   * Sweep step: zero out any unredeemed remaining_points whose expiry has
   * passed, and write a matching `EXPIRED` ledger entry. Idempotent — the
   * unique partial index on (referenceType='EXPIRY', referenceId=batchId)
   * keeps repeated runs safe.
   */
  async expirePoints(storeId: string): Promise<{ batchesExpired: number; pointsExpired: number }> {
    return this.dataSource.transaction(async (em) => {
      const now = new Date()
      const expired = await em
        .createQueryBuilder(LoyaltyLedgerEntity, 'l')
        .where('l.store_id = :storeId', { storeId })
        .andWhere('l.remaining_points > 0')
        .andWhere('l.expires_at IS NOT NULL AND l.expires_at <= :now', { now })
        .setLock('pessimistic_write')
        .getMany()

      let pointsExpired = 0
      for (const batch of expired) {
        const drain = batch.remainingPoints
        if (drain <= 0) continue

        // Lock the user and adjust their balance down by what's actually
        // still available (never below zero).
        const user = await em.findOne(UserEntity, {
          where: { id: batch.customerId, storeId },
          lock: { mode: 'pessimistic_write' },
        })
        if (!user) continue
        const reduce = Math.min(drain, user.loyaltyPointsBalance || 0)
        user.loyaltyPointsBalance = (user.loyaltyPointsBalance || 0) - reduce
        await em.save(UserEntity, user)

        batch.remainingPoints = 0
        await em.save(LoyaltyLedgerEntity, batch)

        const ledger = em.create(LoyaltyLedgerEntity, {
          customerId: batch.customerId,
          type: 'EXPIRED' as LoyaltyTransactionType,
          points: -reduce,
          balanceAfter: user.loyaltyPointsBalance,
          referenceType: 'EXPIRY',
          referenceId: batch.id,
          note: `Auto-expired ${reduce} pts from earn dated ${batch.createdAt?.toISOString?.() ?? batch.createdAt}`,
          storeId,
          remainingPoints: 0,
        })
        try {
          await em.save(LoyaltyLedgerEntity, ledger)
          pointsExpired += reduce
        } catch (e: any) {
          if (e?.code !== '23505') throw e
          // Already expired by a concurrent run — safe to skip.
        }
      }
      return { batchesExpired: expired.length, pointsExpired }
    })
  }

  /**
   * Outstanding loyalty liability per store — sum of unredeemed,
   * unexpired remaining_points. Used by the finance/marketing dashboards
   * to surface deferred-revenue exposure.
   */
  async getLiability(storeId: string): Promise<{ outstandingPoints: number; customers: number }> {
    const row = await this.dataSource
      .createQueryBuilder(LoyaltyLedgerEntity, 'l')
      .select('COALESCE(SUM(l.remaining_points), 0)', 'pts')
      .addSelect('COUNT(DISTINCT l.customer_id)', 'customers')
      .where('l.store_id = :storeId', { storeId })
      .andWhere('l.remaining_points > 0')
      .andWhere('(l.expires_at IS NULL OR l.expires_at > NOW())')
      .getRawOne<{ pts: string; customers: string }>()
    return {
      outstandingPoints: Number(row?.pts ?? 0),
      customers: Number(row?.customers ?? 0),
    }
  }

  private async notifyPointsCredited(
    customerId: string,
    points: number,
    ledger: LoyaltyLedgerEntity | null,
    ctx: RequestContextDto,
  ): Promise<void> {
    if (!ledger) return

    try {
      await this.notificationService.createNotification(
        {
          title:
            ledger.type === LoyaltyTransactionType.REFERRAL_BONUS
              ? 'Referral Bonus Earned'
              : 'Loyalty Points Earned',
          message: `${points} loyalty points have been added to your account.`,
          type: 'SUCCESS',
          link: '/account/loyalty',
          userId: customerId,
        },
        ctx.storeId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger loyalty points notification: ${e.message}`)
    }
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
    const config = await this.getOrCreateConfig(ctx.storeId, em)
    if (!config.isEnabled) {
      return
    }

    const customerId = order.userId
    if (!customerId) {
      return
    }

    // Resolve membership tier multiplier
    const user = await em.findOne(UserEntity, { where: { id: customerId, storeId: ctx.storeId } })
    if (!user) {
      return
    }

    let membershipMultiplier = 1.0
    switch (user.membershipTier) {
      case 'SILVER':
        membershipMultiplier = Number(config.silverMultiplier)
        break
      case 'GOLD':
        membershipMultiplier = Number(config.goldMultiplier)
        break
      case 'PLATINUM':
        membershipMultiplier = Number(config.platinumMultiplier)
        break
      default:
        membershipMultiplier = 1.0
    }

    // Load full order details with items and product categories
    const resolvedOrder =
      (await em.findOne(OrderEntity, {
        where: { id: order.id, storeId: ctx.storeId },
        relations: {
          items: {
            product: true,
          },
        },
      })) || order

    const now = new Date()

    // Load active and valid dynamic rules
    const activeRules = await em.find(LoyaltyRuleEntity, {
      where: { storeId: ctx.storeId, isActive: true },
    })

    const validRules = activeRules.filter((rule) => {
      if (rule.startDate && new Date(rule.startDate) > now) return false
      if (rule.endDate && new Date(rule.endDate) < now) return false
      return true
    })

    const pointsPerCurrencySpent = Number(config.pointsPerCurrencySpent)
    let totalItemPoints = 0

    // Evaluate Category Multiplier rules
    for (const item of resolvedOrder.items || []) {
      const itemAmt = Number(item.totalAmount || 0)
      const categoryId = item.product?.categoryId

      // Find matching category rules
      const catRules = validRules.filter((r) => {
        if (r.type !== 'CATEGORY_MULTIPLIER') return false
        const catIds =
          r.conditions?.categoryIds || (r.conditions?.categoryId ? [r.conditions.categoryId] : [])
        return categoryId && catIds.includes(categoryId)
      })

      const catMultiplier = catRules.reduce((max, r) => Math.max(max, Number(r.value)), 1.0)
      const baseItemPoints = itemAmt * pointsPerCurrencySpent * membershipMultiplier
      const finalItemPoints = baseItemPoints * catMultiplier

      totalItemPoints += finalItemPoints
    }

    // Evaluate Weekend Multiplier rules
    const orderDate = new Date(resolvedOrder.createdAt || now)
    const dayOfWeek = orderDate.getDay() // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    let weekendMultiplier = 1.0
    if (isWeekend) {
      const wkndRules = validRules.filter((r) => r.type === 'WEEKEND_MULTIPLIER')
      weekendMultiplier = wkndRules.reduce((max, r) => Math.max(max, Number(r.value)), 1.0)
    }

    let pointsToEarn = Math.floor(totalItemPoints * weekendMultiplier)

    // Evaluate Min Spend Bonus rules
    const orderTotal = Number(resolvedOrder.totalAmount || 0)
    const minSpendRules = validRules.filter((r) => {
      if (r.type !== 'MIN_SPEND_BONUS') return false
      const minSpend = Number(r.conditions?.minSpend || r.conditions?.threshold || 0)
      return orderTotal >= minSpend
    })

    const bonusPoints = minSpendRules.reduce((sum, r) => sum + Math.round(Number(r.value)), 0)
    pointsToEarn += bonusPoints

    if (pointsToEarn > 0) {
      let note = `Earned points from Order #${resolvedOrder.id.substring(0, 8)} (${user.membershipTier} tier ${membershipMultiplier}x)`
      if (isWeekend && weekendMultiplier > 1) {
        note += ` + Weekend multiplier ${weekendMultiplier}x`
      }
      if (bonusPoints > 0) {
        note += ` + Spend bonus of ${bonusPoints} pts`
      }

      const expiresAt = config.pointsExpireAfterDays
        ? new Date(Date.now() + config.pointsExpireAfterDays * 24 * 60 * 60 * 1000)
        : null

      await this.creditPoints(
        {
          customerId,
          points: pointsToEarn,
          type: LoyaltyTransactionType.EARNED,
          referenceType: 'ORDER',
          referenceId: resolvedOrder.id,
          note,
          expiresAt,
        },
        ctx,
        em,
      )
    }
  }

  /**
   * Fetches full history log for a customer.
   */
  async getPointsHistory(customerId: string, storeId: string): Promise<LoyaltyLedgerEntity[]> {
    return await this.dataSource.manager.find(LoyaltyLedgerEntity, {
      where: { customerId, storeId },
      order: { createdAt: 'DESC' },
    })
  }

  // --- Loyalty Rules CRUD ---

  async findAllRules(storeId: string): Promise<LoyaltyRuleEntity[]> {
    return this.dataSource.manager.find(LoyaltyRuleEntity, {
      where: { storeId },
      order: { createdAt: 'DESC' },
    })
  }

  async findRuleById(id: string, storeId: string): Promise<LoyaltyRuleEntity> {
    const rule = await this.dataSource.manager.findOne(LoyaltyRuleEntity, {
      where: { id, storeId },
    })
    if (!rule) {
      throw new BadRequestException(`Loyalty rule with ID ${id} not found`)
    }
    return rule
  }

  async createRule(data: Partial<LoyaltyRuleEntity>, storeId: string): Promise<LoyaltyRuleEntity> {
    const em = this.dataSource.manager
    const rule = em.create(LoyaltyRuleEntity, {
      ...data,
      storeId,
    })
    return em.save(LoyaltyRuleEntity, rule)
  }

  async updateRule(
    id: string,
    data: Partial<LoyaltyRuleEntity>,
    storeId: string,
  ): Promise<LoyaltyRuleEntity> {
    const em = this.dataSource.manager
    const rule = await this.findRuleById(id, storeId)
    Object.assign(rule, data)
    return em.save(LoyaltyRuleEntity, rule)
  }

  async deleteRule(id: string, storeId: string): Promise<void> {
    const em = this.dataSource.manager
    const rule = await this.findRuleById(id, storeId)
    await em.softRemove(LoyaltyRuleEntity, rule)
  }
}

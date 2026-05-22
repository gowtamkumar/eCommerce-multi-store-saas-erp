import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { LoyaltyLedgerEntity } from '../entities/loyalty-ledger.entity'
import { LoyaltyConfigEntity } from '../entities/loyalty-config.entity'
import { LoyaltyRuleEntity } from '../entities/loyalty-rule.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
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
    const resolvedOrder = await em.findOne(OrderEntity, {
      where: { id: order.id, tenantId: ctx.tenantId },
      relations: ['items', 'items.product'],
    }) || order

    const now = new Date()

    // Load active and valid dynamic rules
    const activeRules = await em.find(LoyaltyRuleEntity, {
      where: { tenantId: ctx.tenantId, isActive: true },
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
        const catIds = r.conditions?.categoryIds || (r.conditions?.categoryId ? [r.conditions.categoryId] : [])
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

      await this.creditPoints(
        {
          customerId,
          points: pointsToEarn,
          type: LoyaltyTransactionType.EARNED,
          referenceType: 'ORDER',
          referenceId: resolvedOrder.id,
          note,
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

  // --- Loyalty Rules CRUD ---

  async findAllRules(tenantId: string): Promise<LoyaltyRuleEntity[]> {
    return this.dataSource.manager.find(LoyaltyRuleEntity, {
      where: { tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findRuleById(id: string, tenantId: string): Promise<LoyaltyRuleEntity> {
    const rule = await this.dataSource.manager.findOne(LoyaltyRuleEntity, {
      where: { id, tenantId },
    })
    if (!rule) {
      throw new BadRequestException(`Loyalty rule with ID ${id} not found`)
    }
    return rule
  }

  async createRule(data: Partial<LoyaltyRuleEntity>, tenantId: string): Promise<LoyaltyRuleEntity> {
    const em = this.dataSource.manager
    const rule = em.create(LoyaltyRuleEntity, {
      ...data,
      tenantId,
    })
    return em.save(LoyaltyRuleEntity, rule)
  }

  async updateRule(id: string, data: Partial<LoyaltyRuleEntity>, tenantId: string): Promise<LoyaltyRuleEntity> {
    const em = this.dataSource.manager
    const rule = await this.findRuleById(id, tenantId)
    Object.assign(rule, data)
    return em.save(LoyaltyRuleEntity, rule)
  }

  async deleteRule(id: string, tenantId: string): Promise<void> {
    const em = this.dataSource.manager
    const rule = await this.findRuleById(id, tenantId)
    await em.remove(LoyaltyRuleEntity, rule)
  }
}

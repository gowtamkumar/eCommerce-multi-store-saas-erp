import {
  ABANDONED_CART_IDLE_HOURS,
  ABANDONED_CART_MAX_AGE_DAYS,
} from '@/common/constants/abandoned-cart.constants'
import { CartAbandonedEvent } from '@/common/events/ai-domain.events'
import { CartEntity } from '@/modules/store/cart/entities/cart.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { AiJobService } from '../services/ai-job.service'
import { isStoreAiAutomationReady } from '@/common/utils/store-ai-automation.util'
import { normalizeStoreAiConfig } from '@/modules/system/store/utils/store-ai.util'
import { CartRepository } from '@/modules/store/cart/cart.repository'
import { StoreRepository } from '@/modules/system/store/store.repository'

@Injectable()
export class AiAutomationScheduler {
  private readonly logger = new Logger(AiAutomationScheduler.name)

  constructor(
    private readonly cartRepo: CartRepository,
    private readonly storeRepo: StoreRepository,
    private readonly aiJobService: AiJobService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async scanAbandonedCarts(): Promise<void> {
    const idleBefore = new Date(Date.now() - ABANDONED_CART_IDLE_HOURS * 60 * 60 * 1000)
    const notTooOld = new Date(Date.now() - ABANDONED_CART_MAX_AGE_DAYS * 24 * 60 * 60 * 1000)

    const carts = await this.cartRepo.txRepo()
      .createQueryBuilder('cart')
      .innerJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('cart.user', 'user')
      .where('cart.updated_at <= :idleBefore', { idleBefore })
      .andWhere('cart.updated_at >= :notTooOld', { notTooOld })
      .getMany()

    for (const cart of carts) {
      if (!cart.items?.length || !cart.storeId) {
        continue
      }

      try {
        const store = await this.storeRepo.findOne({ where: { id: cart.storeId } })
        const config = normalizeStoreAiConfig(store?.aiConfig)

        if (!isStoreAiAutomationReady(config) || !config.automation.abandonedCartDraft) {
          continue
        }

        const duplicate = await this.aiJobService.hasRecentCartAbandonedAutomation(
          cart.storeId,
          cart.id,
          24,
        )
        if (duplicate) {
          continue
        }

        const event = this.toCartAbandonedEvent(cart)
        await this.aiJobService.enqueueCartAbandonedAutomation(cart.storeId, event)
      } catch (error) {
        this.logger.warn(`Abandoned cart scan failed for cart ${cart.id}`, error)
      }
    }
  }

  @Cron('0 3 * * 0')
  async runWeeklyDemandForecasts(): Promise<void> {
    const stores = await this.storeRepo.find({ select: { id: true, aiConfig: true } })

    for (const store of stores) {
      const config = normalizeStoreAiConfig(store.aiConfig)
      if (!isStoreAiAutomationReady(config) || !config.automation.demandForecastEnabled) {
        continue
      }

      try {
        const duplicate = await this.aiJobService.hasRecentPayloadJob(
          store.id,
          AiJobType.DEMAND_FORECAST,
          'scheduled',
          'weekly',
          24 * 6,
        )
        if (duplicate) {
          continue
        }

        await this.aiJobService.enqueueDemandForecast(store.id)
      } catch (error) {
        this.logger.warn(`Demand forecast scheduling failed for store ${store.id}`, error)
      }
    }
  }

  private toCartAbandonedEvent(cart: CartEntity): Omit<CartAbandonedEvent, 'storeId'> {
    let totalAmount = 0
    let itemCount = 0
    const itemLines: string[] = []

    for (const item of cart.items ?? []) {
      itemCount += Number(item.quantity)
      const price = Number(item.product?.price ?? 0)
      totalAmount += price * Number(item.quantity)
      itemLines.push(
        `- ${item.product?.name ?? 'Item'} x${item.quantity}${price ? ` @ ${price}` : ''}`,
      )
    }

    const hoursSinceUpdate =
      (Date.now() - new Date(cart.updatedAt).getTime()) / (1000 * 60 * 60)

    let messageTemplate = 'gentle_reminder'
    if (hoursSinceUpdate >= 72) messageTemplate = 'win_back'
    else if (hoursSinceUpdate >= 24) messageTemplate = 'urgency'
    else if (totalAmount >= 100) messageTemplate = 'incentive'

    const lines = [
      `Cart ID: ${cart.id}`,
      `Customer: ${cart.user?.name || 'Customer'}`,
      `Items in cart: ${itemCount}`,
      `Estimated value: ${totalAmount}`,
      `Last updated: ${cart.updatedAt.toISOString()}`,
    ]

    if (cart.user?.email) lines.push(`Email: ${cart.user.email}`)
    if (cart.user?.phone) lines.push(`Phone: ${cart.user.phone}`)
    if (itemLines.length) {
      lines.push('', 'Cart items:', ...itemLines)
    }

    return {
      cartId: cart.id,
      customerName: cart.user?.name || 'Customer',
      customerEmail: cart.user?.email || undefined,
      customerPhone: cart.user?.phone || undefined,
      cartSummary: lines.join('\n'),
      messageTemplate,
      hoursSinceUpdate,
    }
  }
}

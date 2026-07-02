import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { StoreEntity } from '../modules/system/store/entities/store.entity'
import { StoreSubscriptionEntity } from '../modules/system/store/entities/store-subscription.entity'
import { SubscriptionPlanEntity } from '../modules/system/subscription-plan/entities/subscription-plan.entity'
import { SubscriptionStatus } from '../common/enums/subscription/subscription-status.enum'
import { SubscriptionBillingCycle } from '../common/enums/subscription/billing-cycle.enum'
import { StoreStatus } from '../common/enums/store/store-status.enum'
import { DataSource } from 'typeorm'

async function bootstrap() {
  const logger = new Logger('RepairSubscriptions')
  logger.log('Starting subscription recovery...')

  const app = await NestFactory.createApplicationContext(AppModule)
  const dataSource = app.get(DataSource)

  try {
    const storeRepo = dataSource.getRepository(StoreEntity)
    const subRepo = dataSource.getRepository(StoreSubscriptionEntity)
    const planRepo = dataSource.getRepository(SubscriptionPlanEntity)

    // 1. Get default plan
    const defaultPlan =
      (await planRepo.findOne({ where: { code: 'enterprise' } })) || (await planRepo.findOne({}))
    if (!defaultPlan) {
      logger.error('No subscription plan found in the database. Run seed first!')
      return
    }
    logger.log(`Using plan ${defaultPlan.name} as default for recovery.`)

    // 2. Find all stores without active subscription
    const stores = await storeRepo.find({
      relations: {
        activeSubscription: true,
      },
    })

    for (const store of stores) {
      if (!store.activeSubscriptionId) {
        logger.log(
          `Store ${store.storeName} (${store.id}) has no active subscription. Creating one...`,
        )
        const now = new Date()
        const endsAt = new Date()
        endsAt.setDate(endsAt.getDate() + 30) // 30 days trial/access

        const sub = subRepo.create({
          storeId: store.id,
          subscriptionPlanId: defaultPlan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: SubscriptionBillingCycle.MONTHLY,
          startsAt: now,
          endsAt: endsAt,
        })
        const savedSub = await subRepo.save(sub)

        store.activeSubscriptionId = savedSub.id
        store.status = StoreStatus.ACTIVE
        await storeRepo.save(store)
        logger.log(`Restored subscription for store ${store.storeName}.`)
      } else {
        logger.log(
          `Store ${store.storeName} (${store.id}) already has active subscription: ${store.activeSubscriptionId}`,
        )
      }
    }

    logger.log('Recovery completed successfully.')
  } catch (error) {
    logger.error('Error during recovery:', error)
  } finally {
    await app.close()
  }
}

bootstrap()

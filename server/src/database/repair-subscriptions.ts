import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { TenantEntity } from '../modules/system/tenant/entities/tenant.entity'
import { TenantSubscriptionEntity } from '../modules/system/tenant/entities/tenant-subscription.entity'
import { SubscriptionPlanEntity } from '../modules/system/subscription-plan/entities/subscription-plan.entity'
import { SubscriptionStatus } from '../common/enums/subscription/subscription-status.enum'
import { SubscriptionBillingCycle } from '../common/enums/subscription/billing-cycle.enum'
import { TenantStatus } from '../common/enums/tenant/tenant-status.enum'
import { DataSource } from 'typeorm'

async function bootstrap() {
  const logger = new Logger('RepairSubscriptions')
  logger.log('Starting subscription recovery...')

  const app = await NestFactory.createApplicationContext(AppModule)
  const dataSource = app.get(DataSource)

  try {
    const tenantRepo = dataSource.getRepository(TenantEntity)
    const subRepo = dataSource.getRepository(TenantSubscriptionEntity)
    const planRepo = dataSource.getRepository(SubscriptionPlanEntity)

    // 1. Get default plan
    const defaultPlan =
      (await planRepo.findOne({ where: { code: 'enterprise' } })) || (await planRepo.findOne({}))
    if (!defaultPlan) {
      logger.error('No subscription plan found in the database. Run seed first!')
      return
    }
    logger.log(`Using plan ${defaultPlan.name} as default for recovery.`)

    // 2. Find all tenants without active subscription
    const tenants = await tenantRepo.find({
      relations: ['activeSubscription'],
    })

    for (const tenant of tenants) {
      if (!tenant.activeSubscriptionId) {
        logger.log(
          `Tenant ${tenant.storeName} (${tenant.id}) has no active subscription. Creating one...`,
        )
        const now = new Date()
        const endsAt = new Date()
        endsAt.setDate(endsAt.getDate() + 30) // 30 days trial/access

        const sub = subRepo.create({
          tenantId: tenant.id,
          subscriptionPlanId: defaultPlan.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: SubscriptionBillingCycle.MONTHLY,
          startsAt: now,
          endsAt: endsAt,
        })
        const savedSub = await subRepo.save(sub)

        tenant.activeSubscriptionId = savedSub.id
        tenant.status = TenantStatus.ACTIVE
        await tenantRepo.save(tenant)
        logger.log(`Restored subscription for tenant ${tenant.storeName}.`)
      } else {
        logger.log(
          `Tenant ${tenant.storeName} (${tenant.id}) already has active subscription: ${tenant.activeSubscriptionId}`,
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

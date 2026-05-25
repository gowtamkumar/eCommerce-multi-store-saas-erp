import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { RequestContextDto } from '../common/dto/request-context.dto'
import { UserRole } from '../common/enums/user/user-role.enum'
import { UserService } from '../modules/admin/core/user/services/user.service'
import { SubscriptionPlanService } from '../modules/system/subscription-plan/subscription-plan.service'

async function bootstrap() {
  const logger = new Logger('Seeder')
  logger.log('Starting database seeding...')

  // Boot standard NestJS application context (non-HTTP server mode)
  const app = await NestFactory.createApplicationContext(AppModule)
  const userService = app.get(UserService)
  const planService = app.get(SubscriptionPlanService)

  try {
    // 1. Create Super Admin if not exists
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com'
    let superAdmin = await userService.findUserByEmail(superAdminEmail)
    if (!superAdmin) {
      logger.log(`Creating Super Admin user: ${superAdminEmail}`)
      superAdmin = await userService.createUser(
        {
          name: process.env.SUPER_ADMIN_NAME,
          username: process.env.SUPER_ADMIN_USERNAME,
          email: superAdminEmail,
          password: process.env.SUPER_ADMIN_PASSWORD,
          emailVerificationToken: null,
          role: UserRole.SUPER_ADMIN,
          isAdmin: true,
        } as any,
        { tenantId: null, userId: null } as RequestContextDto,
      )
      logger.log('Super Admin user created successfully.')
    } else {
      logger.log('Super Admin user already exists.')
    }

    // 2. Seed Subscription Plans
    logger.log('Seeding/updating initial subscription plans...')
    const plansToSeed = [
      {
        name: 'Starter',
        description: 'Basic storefront configuration and single-location catalog.',
        price: 0,
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ['pos', 'catalog', 'content', 'settings'],
        isActive: true,
        isPopular: false,
        trialPeriodDays: 14,
        code: 'starter',
        currency: 'USD',
        maxBranches: 1,
        maxWarehouses: 1,
        maxStaffUsers: 3,
        maxProducts: 100,
        maxMonthlyOrders: 500,
        maxStorageMb: 1024,
      },
      {
        name: 'Pro Seller',
        description: 'The essentials to get your store up and running with professional features.',
        price: 29,
        monthlyPrice: 29,
        yearlyPrice: 290,
        features: ['pos', 'catalog', 'orders', 'marketing', 'content', 'settings'],
        isActive: true,
        isPopular: true,
        trialPeriodDays: 14,
        code: 'pro_seller',
        currency: 'USD',
        maxBranches: 3,
        maxWarehouses: 3,
        maxStaffUsers: 10,
        maxProducts: 1000,
        maxMonthlyOrders: 5000,
        maxStorageMb: 5120,
      },
      {
        name: 'Enterprise',
        description: 'Scale your business with dedicated support and advanced infrastructure.',
        price: 99,
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: [
          'pos',
          'catalog',
          'orders',
          'marketing',
          'finance',
          'hrm',
          'reports',
          'logistics',
          'settings',
          'content',
          'branding',
        ],
        isActive: true,
        isPopular: false,
        trialPeriodDays: 30,
        code: 'enterprise',
        currency: 'USD',
        maxBranches: 10,
        maxWarehouses: 10,
        maxStaffUsers: 50,
        maxProducts: 10000,
        maxMonthlyOrders: 50000,
        maxStorageMb: 20480,
      },
    ]

    const existingPlans = await planService.findAllSubscriptionPlans()
    for (const planData of plansToSeed) {
      const existing = existingPlans.find((p) => p.name === planData.name)
      if (existing) {
        await planService.updateSubscriptionPlan(existing.id, planData)
        logger.log(`Updated subscription plan: ${planData.name}`)
      } else {
        await planService.createSubscriptionPlan(planData, {
          tenantId: null,
          userId: null,
        } as RequestContextDto)
        logger.log(`Created subscription plan: ${planData.name}`)
      }
    }

    logger.log('Database seeding completed successfully.')
  } catch (error) {
    logger.error('Error during database seeding:', error)
  } finally {
    await app.close()
  }
}

bootstrap()

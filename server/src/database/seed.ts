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
        features: [
          '/admin',
          '/admin/products',
          '/admin/categories',
          '/admin/brands',
          '/admin/media',
          '/admin/profile',
          '/admin/faqs',
          '/admin/pos',
        ],
        isActive: true,
        isPopular: false,
      },
      {
        name: 'Pro Seller',
        description: 'The essentials to get your store up and running with professional features.',
        price: 29,
        monthlyPrice: 29,
        yearlyPrice: 290,
        features: [
          '/admin',
          '/admin/products',
          '/admin/categories',
          '/admin/brands',
          '/admin/media',
          '/admin/profile',
          '/admin/faqs',
          '/admin/pos',
          '/admin/orders',
          '/admin/returns',
          '/admin/fulfillment',
          '/admin/couriers',
          '/admin/coupons',
          '/admin/promotions',
          '/admin/pages',
          '/admin/reviews',
          '/admin/expenses',
          '/admin/settings',
          '/admin/customers',
          '/admin/subscribers',
          '/admin/leads',
          '/admin/carts',
          '/admin/payments',
          '/admin/campaigns',
          'multi_currency',
          'staff_accounts',
        ],
        isActive: true,
        isPopular: true,
      },
      {
        name: 'Enterprise',
        description: 'Scale your business with dedicated support and advanced infrastructure.',
        price: 99,
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: [
          '/admin',
          '/admin/products',
          '/admin/categories',
          '/admin/brands',
          '/admin/media',
          '/admin/profile',
          '/admin/faqs',
          '/admin/pos',
          '/admin/orders',
          '/admin/returns',
          '/admin/fulfillment',
          '/admin/couriers',
          '/admin/coupons',
          '/admin/promotions',
          '/admin/pages',
          '/admin/reviews',
          '/admin/expenses',
          '/admin/settings',
          '/admin/customers',
          '/admin/subscribers',
          '/admin/leads',
          '/admin/carts',
          '/admin/payments',
          '/admin/campaigns',
          '/admin/warehouses',
          '/admin/hrm',
          '/admin/inventory',
          '/admin/finance',
          '/admin/finance/profit-loss',
          '/admin/finance/balance-sheet',
          '/admin/finance/ledger',
          '/admin/invoices',
          '/admin/purchases',
          '/admin/grn',
          '/admin/suppliers',
          '/admin/reports',
          '/admin/reports/sales',
          '/admin/reports/profit-loss',
          '/admin/reports/supplier-ledger',
          '/admin/reports/customer-ledger',
          '/admin/reports/cash-flow',
          '/admin/reports/export',
          '/admin/reports/finance',
          'advanced_analytics',
          'multi_currency',
          'staff_accounts',
          'unlimited_products',
          'remove_branding',
        ],
        isActive: true,
        isPopular: false,
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

import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { SslCommerzPaymentStrategy } from '@/common/strategies/payment/sslcommerz-payment.strategy'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { SubscriptionPlanRepository } from '@/modules/system/subscription-plan/subscription-plan.repository'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { TenantSubscriptionEntity } from '@/modules/system/tenant/entities/tenant-subscription.entity'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { SubscriptionPlanEntity } from '../subscription-plan/entities/subscription-plan.entity'
import { CurrentSubscriptionResponseDto } from './dto/current-subscription-response.dto'
import { SubscriptionInvoiceEntity } from './entities/subscription-invoice.entity'
import { SubscriptionInvoiceRepository } from './subscription-invoice.repository'
import { buildAllowedBillingOrigins, resolveSafeBillingUrl } from './billing-origin.util'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { FileEntity } from '@/modules/admin/operations/infra/file/entities/file.entity'
import { TenantFeatureEntity } from '@/modules/system/tenant/entities/tenant-feature.entity'
import { AddonCatalogService } from '@/modules/system/addon-catalog/addon-catalog.service'

const DEFAULT_PLATFORM_CURRENCY = 'BDT'

@Injectable()
export class SubscriptionBillingService {
  private readonly logger = new Logger(SubscriptionBillingService.name)

  constructor(
    private readonly planRecordRepository: SubscriptionInvoiceRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly planRepository: SubscriptionPlanRepository,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
    private readonly addonCatalogService: AddonCatalogService,
    @InjectRepository(TenantSubscriptionEntity)
    private readonly subscriptionRepo: Repository<TenantSubscriptionEntity>,
    private readonly dataSource: DataSource,
  ) {}


  async getCurrentSubscription(tenantId: string): Promise<CurrentSubscriptionResponseDto> {
    this.logger.log(`${this.getCurrentSubscription.name} Called for tenant: ${tenantId}`)
    const cacheKey = `subscription:${tenantId}:current`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const tenant = await this.tenantRepository.findByIdWithRelations(tenantId)
        if (!tenant) throw new NotFoundException('Tenant not found')

        // Subscription Expiration Alert Logic
        if (tenant.subscriptionEndsAt && !tenant.isExpired) {
          const daysUntilExpiry = Math.ceil(
            (tenant.subscriptionEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          )
          if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            // Use cache to prevent spamming the notification every time they load the page
            const alertKey = `subscription_alert:${tenantId}`
            const alertSent = await this.cacheService.getCache(alertKey, tenantId)
            if (!alertSent) {
              try {
                await this.notificationService.createNotification(
                  {
                    title: 'Subscription Expiring Soon',
                    message: `Your billing plan is nearing expiry (in ${daysUntilExpiry} days). Please renew to avoid interruption.`,
                    type: 'WARNING',
                    link: `/admin/settings/billing`,
                    userId: null as any,
                  },
                  tenantId,
                )
                // Set cache to prevent re-alerting for 24 hours
                await this.cacheService.setCache(alertKey, true, 86400, tenantId)
              } catch (e) {
                this.logger.error(
                  `Failed to trigger subscription expiry notification: ${e.message}`,
                )
              }
            }
          }
        }

        // Calculate storage usage
        const fileResult = await this.dataSource
          .getRepository(FileEntity)
          .createQueryBuilder('file')
          .select('SUM(file.size)', 'total')
          .where('file.tenantId = :tenantId', { tenantId })
          .getRawOne()
        const storageUsage = parseInt(fileResult?.total || '0', 10)

        // Calculate storage limit and collect active overrides
        const baseLimitMb = tenant.subscriptionPlan?.maxStorageMb ?? 1024 // default 1GB
        let storageLimit = baseLimitMb
        const activeAddons: string[] = []

        const activeOverrides = await this.dataSource.getRepository(TenantFeatureEntity).find({
          where: { tenantId, isEnabled: true },
        })

        // Load storage addon definitions from DB (boost_unit === 'mb')
        const storageAddonDefs = await this.addonCatalogService.getStorageAddons()

        let addonsMb = 0
        for (const override of activeOverrides) {
          if (override.featureSlug.startsWith('addon_')) {
            activeAddons.push(override.featureSlug)
          }
          // Match against DB-defined storage addons by prefix
          if (baseLimitMb !== -1) {
            for (const def of storageAddonDefs) {
              if (override.featureSlug === def.slug || override.featureSlug.startsWith(def.slug + '_')) {
                addonsMb += def.boostValue
                break
              }
            }
          }
        }

        if (baseLimitMb !== -1) {
          storageLimit = baseLimitMb + addonsMb
        }

        return {
          planName: tenant.subscriptionPlan?.name || 'No Plan',
          status: tenant.subscriptionStatus,
          startsAt: tenant.subscriptionStartsAt,
          endsAt: tenant.subscriptionEndsAt,
          billingCycle: tenant.subscriptionBillingCycle,
          isExpired: tenant.isExpired,
          storageUsage,
          storageLimit,
          activeAddons,
        }
      },
      3600, // 1 hour
      tenantId,
    )
  }

  async getAvailablePlans(): Promise<SubscriptionPlanEntity[]> {
    return this.cacheService.rememberCache(
      'subscription:plans:active',
      () => this.planRepository.findActiveSortedByPrice(),
      86400, // 24 hours
    )
  }

  async getBillingHistory(tenantId: string): Promise<SubscriptionInvoiceEntity[]> {
    return await this.planRecordRepository.findAllByTenant(tenantId)
  }

  async initiateSubscriptionPayment(
    ctx: RequestContextDto,
    planId: string,
    billingCycle: SubscriptionBillingCycle = SubscriptionBillingCycle.MONTHLY,
    frontendUrl?: string,
  ): Promise<{ gatewayUrl: string }> {
    const { tenantId, userId } = ctx
    this.logger.log(`Initiating subscription payment for tenant ${tenantId} and plan ${planId}`)
    const plan = await this.planRepository.findById(planId)
    if (!plan) throw new NotFoundException('Plan not found')

    const tenant = await this.tenantRepository.findByIdWithUser(tenantId)

    if (!tenant) throw new NotFoundException('Tenant not found')

    // RENEWAL RESTRICTION: Block if not expired and same plan
    const isSamePlan = tenant.subscriptionPlanId === planId
    const isCurrentlyActive =
      tenant.subscriptionStatus !== SubscriptionStatus.TRIAL && !tenant.isExpired

    if (isSamePlan && isCurrentlyActive) {
      throw new BadRequestException(
        'Your current subscription is still active. You can only renew after it expires.',
      )
    }

    const transactionId = `SUB-${Date.now()}`
    // Normalize cycle for robust comparison
    const isYearly = String(billingCycle).toLowerCase() === 'yearly'
    const cycle = isYearly ? SubscriptionBillingCycle.YEARLY : SubscriptionBillingCycle.MONTHLY

    // Calculate base amount
    let amount = isYearly ? Number(plan.yearlyPrice || 0) : Number(plan.monthlyPrice || 0)

    // Fallback: if yearly is zero, use 12x monthly
    if (isYearly && amount === 0) {
      amount = Number(plan.monthlyPrice || 0) * 12
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Plan is not priced for the requested billing cycle')
    }

    this.logger.log(`Subscription initiation: ${cycle} calculation Result: ${amount}`)

    // Plan currency is authoritative. We persist it on the invoice so the
    // success-callback verification can re-check that the gateway charged us
    // in the currency we asked for.
    const currency = (plan.currency || DEFAULT_PLATFORM_CURRENCY).toUpperCase()

    const invoiceNumber = `INV-${Date.now()}`
    const record = await this.planRecordRepository.createAndSave(
      {
        invoiceNumber,
        tenantId,
        subscriptionPlanId: planId,
        amount,
        billingCycle: cycle,
        currency,
        status: PaymentStatus.PENDING,
        transactionId,
        billingDate: new Date(),
      },
      ctx,
    )

    // Restrict frontendUrl to origins we recognise for this tenant —
    // otherwise an attacker could send users to a phishing host after a real
    // successful payment.
    const platformFrontend = this.configService.get<string>('FRONTEND_URL') || ''
    const allowedOrigins = buildAllowedBillingOrigins(tenant, {
      frontendUrl: platformFrontend,
      platformHost: this.configService.get<string>('PLATFORM_HOST'),
      nodeEnv: this.configService.get<string>('NODE_ENV'),
    })
    const safeFrontendUrl = resolveSafeBillingUrl(frontendUrl, platformFrontend, allowedOrigins)

    // Actual SSLCommerz Integration
    const strategy = new SslCommerzPaymentStrategy()

    const mockOrder = {
      id: record.id,
      transactionId: transactionId,
      totalAmount: amount,
      currency,
      customerName: tenant.user?.name || tenant.storeName || 'Store Owner',
      customerEmail: tenant.user?.email || 'billing@omnicart.com',
      address: tenant.user?.address || 'Dhaka, Bangladesh',
      customerPhone: tenant.user?.phone || '01700000000',
      items: [{ product: { name: `Subscription: ${plan.name} Plan` } }],
    } as any as OrderEntity

    const platformStoreId = this.configService.get<string>('SUPER_ADMIN_STORE_ID')
    const platformStorePass = this.configService.get<string>('SUPER_ADMIN_STORE_PASS')
    const platformIsSandbox =
      String(this.configService.get('SSLCOMMERZ_LIVE') ?? 'false').toLowerCase() !== 'true'

    if (!platformStoreId || !platformStorePass) {
      throw new BadRequestException('Platform billing gateway is not configured')
    }

    const mockSettings = {
      payment: {
        sslCommerzStoreId: platformStoreId,
        sslCommerzStorePassword: platformStorePass,
        sslCommerzIsSandbox: platformIsSandbox,
      },
    } as any as SiteSettingsEntity

    const callbackUrl = `${safeFrontendUrl}/billing`

    const result = await strategy.initiate(mockOrder, mockSettings, {
      callbackUrl,
      tenantId: tenant.id,
      frontendUrl: safeFrontendUrl,
    })

    if (result.success) {
      return { gatewayUrl: result.gatewayUrl }
    } else {
      throw new BadRequestException(result.error || 'Failed to initiate payment')
    }
  }

  async completeSubscriptionPayment(
    transactionId: string,
    gatewayResponse: any = {},
  ): Promise<SubscriptionInvoiceEntity | { success: boolean }> {
    return this.handleSuccessPayment(transactionId, gatewayResponse)
  }

  async handleSuccessPayment(
    transactionId: string,
    gatewayResponse: any = {},
  ): Promise<SubscriptionInvoiceEntity | { success: boolean }> {
    this.logger.log(`Handling success subscription payment for transaction: ${transactionId}`)

    if (!transactionId) {
      throw new BadRequestException('Missing transaction id')
    }

    const record = await this.planRecordRepository.findByTransactionId(transactionId)

    if (!record) throw new NotFoundException('Subscription record not found')
    // Idempotency: once an invoice is COMPLETED we never re-grant subscription
    // entitlements even if the callback fires again.
    if (record.status === PaymentStatus.COMPLETED) return record

    const strategy = new SslCommerzPaymentStrategy()
    const platformStoreId = this.configService.get<string>('SUPER_ADMIN_STORE_ID')
    const platformStorePass = this.configService.get<string>('SUPER_ADMIN_STORE_PASS')
    const platformIsSandbox =
      String(this.configService.get('SSLCOMMERZ_LIVE') ?? 'false').toLowerCase() !== 'true'

    const valId =
      gatewayResponse?.val_id ?? gatewayResponse?.value_id ?? gatewayResponse?.['VAL_ID']

    const verification = await strategy.verifyTransaction({
      valId,
      transactionId,
      storeId: platformStoreId,
      storePassword: platformStorePass,
      isSandbox: platformIsSandbox,
      expectedAmount: Number(record.amount),
      expectedCurrency: record.currency,
    })

    if (!verification.success) {
      this.logger.warn(
        `Subscription payment verification failed for tran_id=${transactionId} reason=${verification.reason}`,
      )
      return this.handleFailPayment(transactionId, {
        ...gatewayResponse,
        verification: verification.gatewayResponse,
        failureReason: verification.reason,
      })
    }

    await this.planRecordRepository.updateAndSave(record, {
      status: PaymentStatus.COMPLETED,
      gatewayResponse: verification.gatewayResponse ?? gatewayResponse,
    })

    const tenant = await this.tenantRepository.findByIdWithRelations(record.tenantId)
    const plan = await this.planRepository.findById(record.subscriptionPlanId)

    if (tenant && plan) {
      const currentDate = new Date()
      // If current subscription is still active, extend from endsAt, otherwise from now
      const isCurrentlyActive = tenant.subscriptionEndsAt && tenant.subscriptionEndsAt > currentDate
      const baseDate = isCurrentlyActive ? tenant.subscriptionEndsAt : currentDate

      const newEndsAt = new Date(baseDate)

      // Dynamic Expiry Calculation
      if (record.billingCycle === SubscriptionBillingCycle.YEARLY) {
        newEndsAt.setFullYear(newEndsAt.getFullYear() + 1)
      } else if (record.billingCycle === SubscriptionBillingCycle.MONTHLY) {
        newEndsAt.setMonth(newEndsAt.getMonth() + 1)
      }

      const sub = this.subscriptionRepo.create({
        tenantId: tenant.id,
        subscriptionPlanId: record.subscriptionPlanId,
        status: SubscriptionStatus.ACTIVE,
        billingCycle: record.billingCycle,
        startsAt: (isCurrentlyActive && tenant.subscriptionStartsAt) ? tenant.subscriptionStartsAt : currentDate,
        endsAt: newEndsAt,
      })
      const savedSub = await this.subscriptionRepo.save(sub)

      await this.tenantRepository.updateAndSave(tenant, {
        activeSubscriptionId: savedSub.id,
        activeSubscription: savedSub,
        status: TenantStatus.ACTIVE,
      })

      // Invalidate current subscription cache
      await this.cacheService.delCache(`subscription:${tenant.id}:current`, tenant.id)

      this.logger.log(
        `Tenant ${tenant.id} subscription updated: Plan ${plan.name}, startsAt: ${currentDate}, endsAt: ${newEndsAt}`,
      )

      // Trigger global notification for new purchase/upgrade
      try {
        await this.notificationService.createNotification(
          {
            title: 'Subscription Purchase',
            message: `Tenant '${tenant.storeName}' purchased/renewed the ${plan.name} plan for ${record.currency} ${record.amount}.`,
            type: 'SUCCESS',
            link: `/system/tenants/${tenant.id}`,
            userId: null as any,
          },
          null,
        )
      } catch (e) {
        this.logger.error(`Failed to trigger global billing notification: ${e.message}`)
      }
    }

    return record
  }

  async handleFailPayment(
    transactionId: string,
    gatewayResponse: any = {},
  ): Promise<SubscriptionInvoiceEntity | { success: boolean }> {
    this.logger.log(`Handling failed subscription payment for transaction: ${transactionId}`)
    const record = await this.planRecordRepository.findByTransactionId(transactionId)
    if (record) {
      const updated = await this.planRecordRepository.updateAndSave(record, {
        status: PaymentStatus.FAILED,
        gatewayResponse,
      })

      // Trigger global notification for payment failure
      try {
        await this.notificationService.createNotification(
          {
            title: 'Billing Payment Failed',
            message: `Subscription payment of ${record.currency} ${record.amount} failed for Tenant ID: ${record.tenantId}.`,
            type: 'DANGER',
            link: `/system/billing`,
            userId: null as any,
          },
          null,
        )
      } catch (e) {
        this.logger.error(`Failed to trigger global billing failure notification: ${e.message}`)
      }

      return updated
    }
    return { success: false }
  }

  async handleCancelPayment(
    transactionId: string,
    gatewayResponse: any = {},
  ): Promise<SubscriptionInvoiceEntity | { cancelled: boolean }> {
    this.logger.log(`Handling cancelled subscription payment for transaction: ${transactionId}`)
    const record = await this.planRecordRepository.findByTransactionId(transactionId)
    if (record) {
      return await this.planRecordRepository.updateAndSave(record, {
        status: PaymentStatus.PENDING,
        gatewayResponse,
      })
    }
    return { cancelled: true }
  }

  async getRedirectUrl(transactionId: string, gatewayResponse: any, defaultAppUrl: string) {
    const baseUrl = gatewayResponse?.value_a || defaultAppUrl
    let status = 'success'
    if (gatewayResponse.status === 'FAILED') status = 'fail'
    if (gatewayResponse.status === 'CANCELLED') status = 'cancel'

    return `${baseUrl}/billing/${status}?tran_id=${transactionId}`
  }

  async purchaseAddon(tenantId: string, addonSlug: string): Promise<void> {
    this.logger.log(`Purchasing addon: ${addonSlug} for tenant: ${tenantId}`)

    // Validate slug against DB catalog (supports suffixed stacked slugs)
    const isValid = await this.addonCatalogService.isValidAddonSlug(addonSlug)
    if (!isValid) {
      throw new BadRequestException(`Invalid addon slug: ${addonSlug}`)
    }

    const featureRepo = this.dataSource.getRepository(TenantFeatureEntity)
    let override = await featureRepo.findOne({ where: { tenantId, featureSlug: addonSlug } })
    if (override && !override.isEnabled) {
      override.isEnabled = true
      override.updatedAt = new Date()
      await featureRepo.save(override)
    } else if (override && override.isEnabled) {
      // Find the next available suffix
      let suffix = 1
      let newSlug = `${addonSlug}_${suffix}`
      while (await featureRepo.findOne({ where: { tenantId, featureSlug: newSlug } })) {
        suffix++
        newSlug = `${addonSlug}_${suffix}`
      }
      override = featureRepo.create({
        tenantId,
        featureSlug: newSlug,
        isEnabled: true,
        enabledAt: new Date(),
      })
      await featureRepo.save(override)
    } else {
      override = featureRepo.create({
        tenantId,
        featureSlug: addonSlug,
        isEnabled: true,
        enabledAt: new Date(),
      })
      await featureRepo.save(override)
    }

    // Invalidate current subscription cache
    await this.cacheService.delCache(`subscription:${tenantId}:current`, tenantId)

    // Trigger local notification
    try {
      await this.notificationService.createNotification(
        {
          title: 'Storage Addon Activated',
          message: `Storage addon '${addonSlug.replace('addon_storage_', '').toUpperCase()}' has been successfully purchased and activated.`,
          type: 'SUCCESS',
          link: `/admin/settings/billing`,
          userId: null as any,
        },
        tenantId,
      )
    } catch (e) {
      this.logger.error(`Failed to trigger billing notification for addon purchase: ${e.message}`)
    }
  }
}


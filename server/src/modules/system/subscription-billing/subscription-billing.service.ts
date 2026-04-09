import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { SubscriptionPlanRepository } from '@/modules/system/subscription-plan/subscription-plan.repository'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { ConfigService } from '@nestjs/config'
import { SslCommerzPaymentStrategy } from '@/common/strategies/payment/sslcommerz-payment.strategy'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionInvoiceRepository } from './subscription-invoice.repository'
import { CurrentSubscriptionResponseDto } from './dto/current-subscription-response.dto'
import { SubscriptionInvoiceEntity } from './entities/subscription-invoice.entity'
import { SubscriptionPlanEntity } from '../subscription-plan/entities/subscription-plan.entity'

@Injectable()
export class SubscriptionBillingService {
  private readonly logger = new Logger(SubscriptionBillingService.name)

  constructor(
    private readonly planRecordRepository: SubscriptionInvoiceRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly planRepository: SubscriptionPlanRepository,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) { }

  async getCurrentSubscription(tenantId: string): Promise<CurrentSubscriptionResponseDto> {
    this.logger.log(`${this.getCurrentSubscription.name} Called for tenant: ${tenantId}`)
    const cacheKey = `subscription:${tenantId}:current`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const tenant = await this.tenantRepository.findByIdWithRelations(tenantId)
        if (!tenant) throw new NotFoundException('Tenant not found')
        return {
          planName: tenant.subscriptionPlan?.name || 'No Plan',
          status: tenant.subscriptionStatus,
          startsAt: tenant.subscriptionStartsAt,
          endsAt: tenant.subscriptionEndsAt,
          billingCycle: tenant.subscriptionBillingCycle,
          isExpired: tenant.isExpired,
        }
      },
      3600, // 1 hour
      tenantId
    )
  }

  async getAvailablePlans(): Promise<SubscriptionPlanEntity[]> {
    return this.cacheService.rememberCache(
      'subscription:plans:active',
      () => this.planRepository.findActiveSortedByPrice(),
      86400 // 24 hours
    )
  }

  async getBillingHistory(tenantId: string): Promise<SubscriptionInvoiceEntity[]> {
    return await this.planRecordRepository.findAllByTenant(tenantId)
  }

  async initiateSubscriptionPayment(
    tenantId: string,
    planId: string,
    billingCycle: SubscriptionBillingCycle = SubscriptionBillingCycle.MONTHLY,
    frontendUrl?: string,
  ): Promise<{ gatewayUrl: string }> {
    this.logger.log(`Initiating subscription payment for tenant ${tenantId} and plan ${planId}`)
    const plan = await this.planRepository.findById(planId)
    if (!plan) throw new NotFoundException('Plan not found')

    const tenant = await this.tenantRepository.findByIdWithUser(tenantId)

    if (!tenant) throw new NotFoundException('Tenant not found')

    // RENEWAL RESTRICTION: Block if not expired and same plan
    const isSamePlan = tenant.subscriptionPlanId === planId;
    const isCurrentlyActive = tenant.subscriptionStatus !== SubscriptionStatus.TRIAL && !tenant.isExpired;

    if (isSamePlan && isCurrentlyActive) {
      throw new BadRequestException('Your current subscription is still active. You can only renew after it expires.');
    }

    const transactionId = `SUB-${Date.now()}`
    // Normalize cycle for robust comparison
    const isYearly = String(billingCycle).toLowerCase() === 'yearly';
    const cycle = isYearly ? SubscriptionBillingCycle.YEARLY : SubscriptionBillingCycle.MONTHLY;

    // Calculate base amount
    let amount = isYearly ? Number(plan.yearlyPrice || 0) : Number(plan.monthlyPrice || 0);

    // Fallback: if yearly is zero, use 12x monthly
    if (isYearly && amount > 0) {
      amount = Number(plan.yearlyPrice || 0) * 12;
    }

    this.logger.log(`Subscription initiation: ${cycle} calculation Result: ${amount}`);

    const invoiceNumber = `INV-${Date.now()}`
    const record = await this.planRecordRepository.createAndSave({
      invoiceNumber,
      tenantId,
      subscriptionPlanId: planId,
      amount,
      billingCycle: cycle,
      currency: 'BDT',
      status: PaymentStatus.PENDING,
      transactionId,
      billingDate: new Date(),
    })

    // Actual SSLCommerz Integration
    const strategy = new SslCommerzPaymentStrategy()

    const mockOrder = {
      id: record.id,
      transactionId: transactionId,
      totalAmount: amount,
      currency: 'BDT',
      customerName: tenant.user?.name || tenant.storeName || 'Store Owner',
      customerEmail: tenant.user?.email || 'billing@omnicart.com',
      address: tenant.user?.address || 'Dhaka, Bangladesh',
      customerPhone: tenant.user?.phone || '01700000000',
      items: [{ product: { name: `OmniCart Subscription: ${plan.name} Plan` } }],
    } as any as OrderEntity

    const mockSettings = {
      payment: {
        sslCommerzStoreId: this.configService.get('SUPER_ADMIN_STORE_ID'),
        sslCommerzStorePassword: this.configService.get('SUPER_ADMIN_STORE_PASS'),
        sslCommerzIsSandbox: true,
      },
    } as any as SiteSettingsEntity

    const callbackUrl = `${frontendUrl}/billing`

    const result = await strategy.initiate(mockOrder, mockSettings, {
      callbackUrl,
      tenantId: tenant.id,
      frontendUrl,
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
    const record = await this.planRecordRepository.findByTransactionId(transactionId)

    if (!record) throw new NotFoundException('Subscription record not found')
    if (record.status === PaymentStatus.COMPLETED) return record

    const strategy = new SslCommerzPaymentStrategy()
    const validation = await strategy.validateCallback(gatewayResponse, { tran_id: transactionId })

    if (!validation.success) {
      this.logger.warn(`Subscription payment validation failed for tran_id: ${transactionId}`)
      return this.handleFailPayment(transactionId, gatewayResponse)
    }

    await this.planRecordRepository.updateAndSave(record, {
      status: PaymentStatus.COMPLETED,
      gatewayResponse,
    })

    const tenant = await this.tenantRepository.findById(record.tenantId)
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

      await this.tenantRepository.updateAndSave(tenant, {
        subscriptionStartsAt: isCurrentlyActive ? tenant.subscriptionStartsAt : currentDate,
        subscriptionEndsAt: newEndsAt,
        subscriptionPlanId: record.subscriptionPlanId,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionBillingCycle: record.billingCycle,
        status: TenantStatus.ACTIVE,
      })

      // Invalidate current subscription cache
      await this.cacheService.delCache(`subscription:${tenant.id}:current`, tenant.id)

      this.logger.log(`Tenant ${tenant.id} subscription updated: Plan ${plan.name}, startsAt: ${currentDate}, endsAt: ${newEndsAt}`)
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
      return await this.planRecordRepository.updateAndSave(record, {
        status: PaymentStatus.FAILED,
        gatewayResponse,
      })
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
    const baseUrl = gatewayResponse?.value_a || defaultAppUrl;
    let status = 'success'
    if (gatewayResponse.status === 'FAILED') status = 'fail'
    if (gatewayResponse.status === 'CANCELLED') status = 'cancel'

    return `${baseUrl}/billing/${status}?tran_id=${transactionId}`
  }
}

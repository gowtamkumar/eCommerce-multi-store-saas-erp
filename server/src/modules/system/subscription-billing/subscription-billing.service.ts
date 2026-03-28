import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { SubscriptionInvoiceRepository } from './subscription-invoice.repository'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { SubscriptionPlanRepository } from '@/modules/system/subscription-plan/subscription-plan.repository'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { ConfigService } from '@nestjs/config'
import { SslCommerzPaymentStrategy } from '@/common/strategies/payment/sslcommerz-payment.strategy'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'

@Injectable()
export class SubscriptionBillingService {
  private readonly logger = new Logger(SubscriptionBillingService.name)

  constructor(
    private readonly invoiceRepository: SubscriptionInvoiceRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly planRepository: SubscriptionPlanRepository,
    private readonly configService: ConfigService,
  ) {}

  async getCurrentSubscription(tenantId: string) {
    this.logger.log(`${this.getCurrentSubscription.name} Called for tenant: ${tenantId}`)
    const tenant = await this.tenantRepository.findByIdWithRelations(tenantId)

    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }

    return {
      planName: tenant.subscriptionPlan?.name || 'No Plan',
      status: tenant.subscriptionStatus,
      startsAt: tenant.subscriptionStartsAt,
      endsAt: tenant.subscriptionEndsAt,
      billingCycle: tenant.subscriptionBillingCycle,
      isExpired: tenant.isExpired,
    }
  }

  async getAvailablePlans() {
    return await this.planRepository.findActiveSortedByPrice()
  }

  async getBillingHistory(tenantId: string) {
    return await this.invoiceRepository.findAllByTenant(tenantId)
  }

  async initiateSubscriptionPayment(tenantId: string, planId: string) {
    this.logger.log(`Initiating subscription payment for tenant ${tenantId} and plan ${planId}`)
    const plan = await this.planRepository.findById(planId)
    if (!plan) throw new NotFoundException('Plan not found')

    const tenant = await this.tenantRepository.findByIdWithUser(tenantId)
    if (!tenant) throw new NotFoundException('Tenant not found')

    const transactionId = `SUB-${Date.now()}`
    const invoiceNumber = `INV-${Date.now()}`
    const invoice = await this.invoiceRepository.createAndSave({
      invoiceNumber,
      tenantId,
      planId,
      amount: plan.price,
      currency: 'BDT',
      status: PaymentStatus.PENDING,
      transactionId,
      billingDate: new Date(),
    })

    // Actual SSLCommerz Integration
    const strategy = new SslCommerzPaymentStrategy()

    const mockOrder = {
      id: invoice.id,
      transactionId: transactionId,
      totalAmount: plan.price,
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

    const apiBaseUrl = this.configService.get('API_URL')
    const callbackUrl = `${apiBaseUrl}/billing/complete`

    const result = await strategy.initiate(mockOrder, mockSettings, {
      callbackUrl,
      tenantId: tenant.id,
    })

    if (result.success) {
      return { gatewayUrl: result.gatewayUrl }
    } else {
      throw new BadRequestException(result.error || 'Failed to initiate payment')
    }
  }

  async completeSubscriptionPayment(transactionId: string, gatewayResponse: any = {}) {
    return this.handleSuccessPayment(transactionId, gatewayResponse)
  }

  async handleSuccessPayment(transactionId: string, gatewayResponse: any = {}) {
    this.logger.log(`Handling success subscription payment for transaction: ${transactionId}`)
    const invoice = await this.invoiceRepository.findByTransactionId(transactionId)

    if (!invoice) throw new NotFoundException('Invoice not found')
    if (invoice.status === PaymentStatus.COMPLETED) return invoice

    const strategy = new SslCommerzPaymentStrategy()
    const validation = await strategy.validateCallback(gatewayResponse, { tran_id: transactionId })

    if (!validation.success) {
      this.logger.warn(`Subscription payment validation failed for tran_id: ${transactionId}`)
      return this.handleFailPayment(transactionId, gatewayResponse)
    }

    await this.invoiceRepository.updateAndSave(invoice, {
      status: PaymentStatus.COMPLETED,
      gatewayResponse,
    })

    const tenant = await this.tenantRepository.findById(invoice.tenantId)
    if (tenant) {
      const currentDate = new Date()
      const baseDate =
        tenant.subscriptionEndsAt && tenant.subscriptionEndsAt > currentDate
          ? tenant.subscriptionEndsAt
          : currentDate

      const newEndsAt = new Date(baseDate)
      newEndsAt.setDate(newEndsAt.getDate() + 30)

      await this.tenantRepository.updateAndSave(tenant, {
        subscriptionEndsAt: newEndsAt,
        subscriptionPlanId: invoice.planId,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        status: TenantStatus.ACTIVE,
      })
      this.logger.log(`Tenant ${tenant.id} subscription extended to ${newEndsAt}`)
    }

    return invoice
  }

  async handleFailPayment(transactionId: string, gatewayResponse: any = {}) {
    this.logger.log(`Handling failed subscription payment for transaction: ${transactionId}`)
    const invoice = await this.invoiceRepository.findByTransactionId(transactionId)
    if (invoice) {
      await this.invoiceRepository.updateAndSave(invoice, {
        status: PaymentStatus.FAILED,
        gatewayResponse,
      })
    }
    return { success: false }
  }

  async handleCancelPayment(transactionId: string, gatewayResponse: any = {}) {
    this.logger.log(`Handling cancelled subscription payment for transaction: ${transactionId}`)
    const invoice = await this.invoiceRepository.findByTransactionId(transactionId)
    if (invoice) {
      await this.invoiceRepository.updateAndSave(invoice, {
        status: PaymentStatus.PENDING,
        gatewayResponse,
      })
    }
    return { cancelled: true }
  }

  async getRedirectUrl(transactionId: string, gatewayResponse: any, defaultAppUrl: string) {
    const strategy = new SslCommerzPaymentStrategy()
    // SslCommerzStrategy expects value_a to contain the base redirect path
    // For subscriptions, we want to go back to /admin/settings/billing
    let status = 'success'
    if (gatewayResponse.status === 'FAILED') status = 'fail'
    if (gatewayResponse.status === 'CANCELLED') status = 'cancel'

    return `${defaultAppUrl}/admin/settings/billing/${status}?tran_id=${transactionId}`
  }
}

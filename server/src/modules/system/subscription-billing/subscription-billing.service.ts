import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubscriptionInvoiceEntity } from './entities/subscription-invoice.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { PaymentStatus } from '@/common/enums/payment-status.enum'

@Injectable()
export class SubscriptionBillingService {
  private readonly logger = new Logger(SubscriptionBillingService.name)

  constructor(
    @InjectRepository(SubscriptionInvoiceEntity)
    private readonly invoiceRepository: Repository<SubscriptionInvoiceEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    @InjectRepository(SubscriptionPlanEntity)
    private readonly planRepository: Repository<SubscriptionPlanEntity>,
  ) {}

  async getCurrentSubscription(tenantId: string) {
    this.logger.log(`${this.getCurrentSubscription.name} Called for tenant: ${tenantId}`)
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: ['subscriptionPlan'],
    })

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
    return await this.planRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    })
  }

  async getBillingHistory(tenantId: string) {
    return await this.invoiceRepository.find({
      where: { tenantId },
      relations: ['plan'],
      order: { billingDate: 'DESC' },
    })
  }

  async initiateSubscriptionPayment(tenantId: string, planId: string) {
    this.logger.log(`Initiating subscription payment for tenant ${tenantId} and plan ${planId}`)
    const plan = await this.planRepository.findOne({ where: { id: planId } })
    if (!plan) throw new NotFoundException('Plan not found')

    const transactionId = `TXN-${Date.now()}`
    const invoiceNumber = `SUB-${Date.now()}`
    const invoice = this.invoiceRepository.create({
      invoiceNumber,
      tenantId,
      planId,
      amount: plan.price,
      currency: 'USD',
      status: PaymentStatus.PENDING,
      transactionId,
      billingDate: new Date(),
    })

    await this.invoiceRepository.save(invoice)

    return {
      invoice,
      gatewayUrl: `/api/v1/billing/complete?txn=${transactionId}`, // Mock success callback
    }
  }

  async completeSubscriptionPayment(transactionId: string) {
    this.logger.log(`Completing subscription payment for transaction: ${transactionId}`)
    const invoice = await this.invoiceRepository.findOne({ 
      where: { transactionId },
      relations: ['plan']
    })

    if (!invoice) {
        throw new NotFoundException('Invoice not found')
    }

    if (invoice.status === PaymentStatus.COMPLETED) {
        return invoice
    }

    invoice.status = PaymentStatus.COMPLETED
    await this.invoiceRepository.save(invoice)

    // Update Tenant
    const tenant = await this.tenantRepository.findOne({ where: { id: invoice.tenantId } })
    if (tenant) {
        const currentDate = new Date()
        const baseDate = (tenant.subscriptionEndsAt && tenant.subscriptionEndsAt > currentDate) 
            ? tenant.subscriptionEndsAt 
            : currentDate
        
        const newEndsAt = new Date(baseDate)
        newEndsAt.setDate(newEndsAt.getDate() + 30) // Add 30 days
        
        tenant.subscriptionEndsAt = newEndsAt
        tenant.subscriptionPlanId = invoice.planId
        tenant.status = 'active' as any // Ensure it's active
        
        await this.tenantRepository.save(tenant)
    }

    return invoice
  }
}

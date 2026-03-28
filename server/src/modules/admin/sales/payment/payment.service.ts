import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InitPaymentDto } from './dto/payment.dto'
import { PaymentEntity } from './entities/payment.entity'
import { OrderRepository } from '@/modules/admin/sales/order/order.repository'
import { PaymentRepository } from './payment.repository'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { InvoiceService } from '@/modules/admin/operations/finance/invoice/invoice.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { PaymentStrategyFactory } from '@/common/strategies/payment/payment-strategy.factory'
import { PaymentMethod } from '@/common/enums/payment-method.enum'

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name)

  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private settingsService: SettingsService,
    private invoiceService: InvoiceService,
    private mailService: MailService,
  ) {}

  async initPayment(dto: InitPaymentDto, tenantId: string) {
    this.logger.log(`${this.initPayment.name} Service Called`)
    const { orderId, callbackUrl } = dto

    const order = await this.orderRepository.findOrderById(orderId, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    const settings = await this.settingsService.findByTenantSettings(tenantId)
    const strategy = PaymentStrategyFactory.create(order.paymentMethod)

    const result = await strategy.initiate(order, settings, {
      callbackUrl,
      tenantId,
    })

    if (result.success) {
      if (result.transactionId) {
        order.transactionId = result.transactionId
        await this.orderRepository.saveOrder(order)
      }
      return { gatewayUrl: result.gatewayUrl }
    } else {
      throw new BadRequestException(result.error || 'Failed to initiate payment')
    }
  }

  async getStrategyByTransactionId(tran_id: string) {
    const order = await this.orderRepository.findOne({ where: { transactionId: tran_id } })
    if (!order) throw new NotFoundException('Order not found')
    return {
      strategy: PaymentStrategyFactory.create(order.paymentMethod),
      order,
    }
  }

  async handleSuccessPayment(tran_id: string, gatewayResponse: any) {
    this.logger.log(`${this.handleSuccessPayment.name} Service Called`)
    const { strategy, order } = await this.getStrategyByTransactionId(tran_id)
    const validation = await strategy.validateCallback(gatewayResponse)

    if (!validation.success) {
      this.logger.warn(`Payment validation failed for tran_id: ${tran_id}`)
      return { success: false }
    }

    order.paymentStatus = PaymentStatus.PAID
    order.status = OrderStatus.PENDING
    await this.orderRepository.saveOrder(order)

    // Record payment
    const payment = await this.paymentRepository.createAndSave({
      orderId: order.id,
      transactionId: tran_id,
      amount: order.totalAmount,
      currency: order.currency,
      method: order.paymentMethod || PaymentMethod.SSLCOMMERZ,
      status: PaymentStatus.COMPLETED,
      gatewayResponse: validation.gatewayResponse,
      tenantId: order.tenantId,
    })

    // Sync Invoice Status
    await this.invoiceService.updateInvoiceStatusByOrderId(
      order.id,
      InvoiceStatus.PAID,
      order.tenantId,
    )

    // Notify Admin
    const orderWithRelations = await this.orderRepository.findOrderById(order.id, order.tenantId)
    if (orderWithRelations) {
      this.mailService.sendNewOrderNotification(orderWithRelations, order.tenantId)
    }

    return { success: true }
  }

  async handleFailPayment(tran_id: string, gatewayResponse: any) {
    this.logger.log(`${this.handleFailPayment.name} Service Called`)
    const { strategy, order } = await this.getStrategyByTransactionId(tran_id)
    const validation = await strategy.validateCallback(gatewayResponse)

    order.paymentStatus = PaymentStatus.FAILED
    await this.orderRepository.saveOrder(order)

    // Record payment failure
    const payment = await this.paymentRepository.createAndSave({
      orderId: order.id,
      transactionId: tran_id,
      amount: order.totalAmount,
      currency: order.currency,
      method: order.paymentMethod || PaymentMethod.SSLCOMMERZ,
      status: PaymentStatus.FAILED,
      gatewayResponse: validation.gatewayResponse,
      tenantId: order.tenantId,
    })

    return { success: false }
  }

  async handleCancelPayment(tran_id: string, gatewayResponse: any) {
    this.logger.log(`${this.handleCancelPayment.name} Service Called`)
    const { strategy, order } = await this.getStrategyByTransactionId(tran_id)
    const validation = await strategy.validateCallback(gatewayResponse)

    order.paymentStatus = PaymentStatus.PENDING // Or CANCELLED if you have that status
    await this.orderRepository.saveOrder(order)

    // Record payment cancellation
    const payment = await this.paymentRepository.createAndSave({
      orderId: order.id,
      transactionId: tran_id,
      amount: order.totalAmount,
      currency: order.currency,
      method: order.paymentMethod || PaymentMethod.SSLCOMMERZ,
      status: PaymentStatus.PENDING,
      gatewayResponse: validation.gatewayResponse,
      tenantId: order.tenantId,
    })

    return { cancelled: true }
  }

  async getRedirectUrl(tran_id: string, gatewayResponse: any, defaultAppUrl: string) {
    const { strategy } = await this.getStrategyByTransactionId(tran_id)
    return strategy.getRedirectUrl(gatewayResponse, defaultAppUrl)
  }

  async findAllPayments(tenantId: string) {
    this.logger.log(`${this.findAllPayments.name} Service Called`)
    return await this.paymentRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    })
  }

  async findAllPaymentsByCustomer(userId: string, tenantId: string) {
    this.logger.log(`${this.findAllPaymentsByCustomer.name} Service Called`)
    return await this.paymentRepository.find({
      where: {
        tenantId,
        order: { userId },
      },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    })
  }
}

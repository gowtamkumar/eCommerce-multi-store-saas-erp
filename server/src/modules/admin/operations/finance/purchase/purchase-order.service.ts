import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto'
import { RecordSupplierPaymentDto } from './dto/record-payment.dto'
import { PurchaseOrderEntity } from './entities/purchase-order.entity'
import { PurchaseOrderPaymentStatus } from './enums/purchase-order-payment-status.enum'
import { InventoryTransactionService } from '../../logistics/inventory-transaction/inventory-transaction.service'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { PurchaseOrderRepository } from './purchase-order.repository'
import { SupplierPaymentRepository } from './supplier-payment.repository'

@Injectable()
export class PurchaseOrderService {
  private readonly logger = new Logger(PurchaseOrderService.name)

  constructor(
    private readonly repository: PurchaseOrderRepository,
    private readonly paymentRepository: SupplierPaymentRepository,
    private readonly inventoryService: InventoryTransactionService,
    private readonly dataSource: DataSource,
  ) {}

  async createPurchaseOrder(dto: CreatePurchaseOrderDto, tenantId: string) {
    this.logger.log(`${this.createPurchaseOrder.name} Service Called`)
    const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    return await this.repository.createAndSave(
      { ...dto, totalAmount },
      tenantId,
      PurchaseOrderStatus.DRAFT,
    )
  }

  async findAllPurchaseOrders(tenantId: string) {
    this.logger.log(`${this.findAllPurchaseOrders.name} Service Called`)
    return await this.repository.findAllWithRelations(tenantId)
  }

  async findOnePurchaseOrder(id: string, tenantId: string) {
    this.logger.log(`${this.findOnePurchaseOrder.name} Service Called`)
    const order = await this.repository.findByIdWithRelations(id, tenantId)
    if (!order) {
      throw new NotFoundException('Purchase order not found')
    }
    return order
  }

  async updatePurchaseOrderStatus(id: string, dto: UpdatePurchaseOrderStatusDto, tenantId: string) {
    this.logger.log(`${this.updatePurchaseOrderStatus.name} Service Called`)
    const order = await this.findOnePurchaseOrder(id, tenantId)

    if (
      order.status === PurchaseOrderStatus.RECEIVED ||
      order.status === PurchaseOrderStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot change status of a ${order.status} order`)
    }

    if (dto.status === PurchaseOrderStatus.RECEIVED) {
      return await this.receivePurchaseOrder(order, tenantId)
    }

    order.status = dto.status
    return await this.repository.saveOrder(order)
  }

  private async receivePurchaseOrder(order: PurchaseOrderEntity, tenantId: string) {
    this.logger.log(`${this.receivePurchaseOrder.name} Service Called`)
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      order.status = PurchaseOrderStatus.RECEIVED
      const savedOrder = await this.repository.saveOrder(order, queryRunner.manager)

      for (const item of order.items) {
        const productId = item.productId || (item.product as any)?.id
        const variantId = item.variantId || (item.variant as any)?.id

        await this.inventoryService.createInventoryTransaction(
          {
            productId,
            variantId: variantId || null,
            quantity: item.quantity,
            type: InventoryTransactionType.IN,
            referenceType: InventoryTransactionReferenceType.PURCHASE,
            referenceId: order.id,
            supplierId: order.supplierId,
          },
          tenantId,
        )
      }

      await queryRunner.commitTransaction()
      return savedOrder
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  async recordSupplierPayment(id: string, dto: RecordSupplierPaymentDto, tenantId: string) {
    this.logger.log(`${this.recordSupplierPayment.name} Service Called`)
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const order = await this.repository.findByIdWithRelations(id, tenantId, queryRunner.manager)
      if (!order) throw new NotFoundException('Purchase order not found')

      const savedPayment = await this.paymentRepository.createAndSave(
        {
          ...dto,
          purchaseOrderId: order.id,
          supplierId: order.supplierId,
          tenantId,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        },
        queryRunner.manager,
      )

      order.paidAmount = Number(order.paidAmount || 0) + Number(dto.amount)

      if (order.paidAmount >= order.totalAmount) {
        order.paymentStatus = PurchaseOrderPaymentStatus.PAID
      } else if (order.paidAmount > 0) {
        order.paymentStatus = PurchaseOrderPaymentStatus.PARTIAL
      }

      if (order.payments) order.payments.push(savedPayment)
      else order.payments = [savedPayment]

      const savedOrder = await this.repository.saveOrder(order, queryRunner.manager)
      await queryRunner.commitTransaction()
      return savedOrder
    } catch (err) {
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  async findAllBySupplier(supplierId: string, tenantId: string) {
    this.logger.log(`${this.findAllBySupplier.name} Service Called`)
    return await this.repository.findAllBySupplier(supplierId, tenantId)
  }

  async findAllPaymentsBySupplier(supplierId: string, tenantId: string) {
    this.logger.log(`${this.findAllPaymentsBySupplier.name} Service Called`)
    return await this.paymentRepository.findAllBySupplier(supplierId, tenantId)
  }

  async findAllPaymentsByPurchaseOrder(tenantId: string) {
    this.logger.log(`${this.findAllPaymentsByPurchaseOrder.name} Service Called`)
    return await this.paymentRepository.findAllPayments(tenantId)
  }
}

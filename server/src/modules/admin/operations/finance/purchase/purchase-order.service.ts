import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto'
import { RecordSupplierPaymentDto } from './dto/record-payment.dto'
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity'
import { PurchaseOrderEntity } from './entities/purchase-order.entity'
import { SupplierPaymentEntity } from './entities/supplier-payment.entity'
import { PurchaseOrderPaymentStatus } from './enums/purchase-order-payment-status.enum'
import { InventoryTransactionService } from '../../logistics/inventory-transaction/inventory-transaction.service'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'

@Injectable()
export class PurchaseOrderService {
  private readonly logger = new Logger(PurchaseOrderService.name)

  constructor(
    @InjectRepository(PurchaseOrderEntity)
    private readonly repository: Repository<PurchaseOrderEntity>,
    @InjectRepository(PurchaseOrderItemEntity)
    private readonly itemRepository: Repository<PurchaseOrderItemEntity>,
    @InjectRepository(SupplierPaymentEntity)
    private readonly paymentRepository: Repository<SupplierPaymentEntity>,
    private readonly inventoryService: InventoryTransactionService,
    private readonly dataSource: DataSource,
  ) {}

  async createPurchaseOrder(dto: CreatePurchaseOrderDto, tenantId: string) {
    this.logger.log(`${this.createPurchaseOrder.name} Service Called`)
    const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const purchaseOrder = this.repository.create({
      ...dto,
      totalAmount,
      tenantId,
      status: PurchaseOrderStatus.DRAFT,
    })

    return await this.repository.save(purchaseOrder)
  }

  async findAllPurchaseOrders(tenantId: string) {
    this.logger.log(`${this.findAllPurchaseOrders.name} Service Called`)
    return await this.repository.find({
      where: { tenantId },
      relations: ['supplier'],
      order: { createdAt: 'DESC' },
    })
  }

  async findOnePurchaseOrder(id: string, tenantId: string) {
    this.logger.log(`${this.findOnePurchaseOrder.name} Service Called`)
    const order = await this.repository.findOne({
      where: { id, tenantId },
      relations: ['supplier', 'items', 'items.product', 'items.variant', 'payments'],
    })
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
    return await this.repository.save(order)
  }

  private async receivePurchaseOrder(order: PurchaseOrderEntity, tenantId: string) {
    this.logger.log(`${this.receivePurchaseOrder.name} Service Called`)
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      order.status = PurchaseOrderStatus.RECEIVED
      const savedOrder = await queryRunner.manager.save(order)

      for (const item of order.items) {
        // Use explicit column ID if present, else fallback to relation ID
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
      const order = await queryRunner.manager.findOne(PurchaseOrderEntity, {
        where: { id, tenantId },
        relations: ['payments'],
      })

      if (!order) {
        throw new NotFoundException('Purchase order not found')
      }

      const payment = queryRunner.manager.create(SupplierPaymentEntity, {
        ...dto,
        purchaseOrderId: order.id,
        supplierId: order.supplierId,
        tenantId,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
      })

      const savedPayment = await queryRunner.manager.save(payment)

      // Update PO paid amount and status
      order.paidAmount = Number(order.paidAmount || 0) + Number(dto.amount)

      if (order.paidAmount >= order.totalAmount) {
        order.paymentStatus = PurchaseOrderPaymentStatus.PAID
      } else if (order.paidAmount > 0) {
        order.paymentStatus = PurchaseOrderPaymentStatus.PARTIAL
      }

      // Important: Update the relation array to avoid TypeORM nullifying the FK
      if (order.payments) {
        order.payments.push(savedPayment)
      } else {
        order.payments = [savedPayment]
      }

      const savedOrder = await queryRunner.manager.save(order)
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
    return await this.repository.find({
      where: { supplierId, tenantId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    })
  }

  async findAllPaymentsBySupplier(supplierId: string, tenantId: string) {
    this.logger.log(`${this.findAllPaymentsBySupplier.name} Service Called`)
    return await this.paymentRepository.find({
      where: { supplierId, tenantId },
      order: { paymentDate: 'DESC' },
    })
  }

  async findAllPaymentsByPurchaseOrder(tenantId: string) {
    this.logger.log(`${this.findAllPaymentsByPurchaseOrder.name} Service Called`)
    return await this.paymentRepository.find({
      where: { tenantId },
      relations: ['supplier', 'purchaseOrder'],
      order: { paymentDate: 'DESC' },
    })
  }
}

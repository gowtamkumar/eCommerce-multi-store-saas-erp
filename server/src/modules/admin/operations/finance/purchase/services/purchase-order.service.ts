import { PaginationDto } from '@/common/dto/pagination.dto'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { DataSource } from 'typeorm'
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from '../dto/purchase-order.dto'
import { RecordSupplierPaymentDto } from '../dto/record-payment.dto'
import { PurchaseOrderEntity } from '../entities/purchase-order.entity'
import { SupplierPaymentEntity } from '../entities/supplier-payment.entity'
import { PurchaseOrderPaymentStatus } from '../enums/purchase-order-payment-status.enum'
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository'
import { SupplierPaymentRepository } from '../repositories/supplier-payment.repository'

@Injectable()
export class PurchaseOrderService {
  private readonly logger = new Logger(PurchaseOrderService.name)

  constructor(
    private readonly repository: PurchaseOrderRepository,
    private readonly paymentRepository: SupplierPaymentRepository,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
    @InjectQueue('product') private readonly productQueue: Queue,
  ) { }

  /**
   * Creates a purchase order in DRAFT status.
   * Invalidates list caches.
   */

  async createPurchaseOrder(dto: CreatePurchaseOrderDto, tenantId: string): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.createPurchaseOrder.name} Service Called`)
    const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const result = await this.repository.createAndSave(
      { ...dto, totalAmount, tenantId } as any,
    )
    await this.cacheService.delCache(`po:list`, tenantId)
    return result
  }

  /**
   * Returns paginated purchase orders with caching.
   */
  async findAllPurchaseOrders(
    tenantId: string,
    paginationDto: PaginationDto,
    status?: PurchaseOrderStatus,
    paymentStatus?: PurchaseOrderPaymentStatus,
  ): Promise<{ items: PurchaseOrderEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    this.logger.log(`${this.findAllPurchaseOrders.name} Service Called`)
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `po:list:p${page}:l${limit}:q${search || ''}:s${status || ''}:ps${paymentStatus || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.repository.findAllByTenant(
          tenantId,
          page,
          limit,
          search,
          status,
          paymentStatus,
        )
        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      },
      300, // 5 min cache
      tenantId,
    )
  }

  /**
   * Returns a single purchase order with detailed relations.
   */
  async findOnePurchaseOrder(id: string, tenantId: string): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.findOnePurchaseOrder.name} Service Called`)
    const cacheKey = `po:id:${id}`

    const order = await this.cacheService.rememberCache(
      cacheKey,
      () => this.repository.findByIdWithRelations(id, tenantId),
      600, // 10 min cache
      tenantId,
    )

    if (!order) {
      throw new NotFoundException('Purchase order not found')
    }
    return order
  }

  /**
   * Updates order status and handles inventory intake if RECEIVED.
   */
  async updatePurchaseOrderStatus(id: string, dto: UpdatePurchaseOrderStatusDto, tenantId: string): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.updatePurchaseOrderStatus.name} Service Called`)
    const order = await this.findOnePurchaseOrder(id, tenantId)

    if (
      order.status === PurchaseOrderStatus.RECEIVED ||
      order.status === PurchaseOrderStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot change status of a ${order.status} order`)
    }

    let result: PurchaseOrderEntity
    if (dto.status === PurchaseOrderStatus.RECEIVED) {
      result = await this.receivePurchaseOrder(order, tenantId)
    } else {
      order.status = dto.status
      result = await this.repository.savePurchaseOrder(order)
    }

    await this.cacheService.delCache(`po:list`, tenantId)
    await this.cacheService.delCache(`po:id:${id}`, tenantId)
    return result
  }

  private async receivePurchaseOrder(order: PurchaseOrderEntity, tenantId: string): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.receivePurchaseOrder.name} Service Called`)
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      order.status = PurchaseOrderStatus.RECEIVED
      const savedOrder = await this.repository.savePurchaseOrder(order, queryRunner.manager)

      for (const item of order.items) {
        const productId = item.productId || (item.product as any)?.id
        const variantId = item.variantId || (item.variant as any)?.id

        // Dispatch background job for each item's stock update
        await this.productQueue.add('update-stock', {
          productId,
          variantId: variantId || null,
          quantity: item.quantity,
          type: InventoryTransactionType.IN,
          referenceType: InventoryTransactionReferenceType.PURCHASE,
          referenceId: order.id,
          supplierId: order.supplierId,
          tenantId,
        })
      }

      await queryRunner.commitTransaction()
      return savedOrder
    } catch (err) {
      this.logger.error('Receive Purchase Order failed', err.stack)
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * Records a payment against the purchase order.
   * Updates paidAmount and paymentStatus.
   */
  async recordSupplierPayment(id: string, dto: RecordSupplierPaymentDto, tenantId: string): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.recordSupplierPayment.name} Service Called`)
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const order = await this.repository.findByIdWithRelations(id, tenantId, queryRunner.manager)
      if (!order) throw new NotFoundException('Purchase order not found')

      await this.paymentRepository.createAndSave(
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

      const savedOrder = await this.repository.savePurchaseOrder(order, queryRunner.manager)
      await queryRunner.commitTransaction()

      await this.cacheService.delCache(`po:list`, tenantId)
      await this.cacheService.delCache(`po:id:${id}`, tenantId)

      return savedOrder
    } catch (err) {
      this.logger.error('Record Payment failed', err.stack)
      await queryRunner.rollbackTransaction()
      throw err
    } finally {
      await queryRunner.release()
    }
  }

  async findAllPurchaseOrdersRaw(tenantId: string): Promise<PurchaseOrderEntity[]> {
    this.logger.log(`${this.findAllPurchaseOrdersRaw.name} Service Called`)
    const cacheKey = `po:list:raw`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items] = await this.repository.findAllByTenant(tenantId, 1, 9999)
        return items
      },
      300,
      tenantId,
    )
  }

  async findAllBySupplier(supplierId: string, tenantId: string): Promise<PurchaseOrderEntity[]> {
    this.logger.log(`${this.findAllBySupplier.name} Service Called`)
    return await this.repository.findAllBySupplier(supplierId, tenantId)
  }

  async findAllPaymentsBySupplier(supplierId: string, tenantId: string): Promise<SupplierPaymentEntity[]> {
    this.logger.log(`${this.findAllPaymentsBySupplier.name} Service Called`)
    return await this.paymentRepository.findAllBySupplier(supplierId, tenantId)
  }

  async findAllPaymentsByPurchaseOrder(tenantId: string): Promise<SupplierPaymentEntity[]> {
    this.logger.log(`${this.findAllPaymentsByPurchaseOrder.name} Service Called`)
    return await this.paymentRepository.findAllPayments(tenantId)
  }
}

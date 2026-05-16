import { PaginationDto } from '@/common/dto/pagination.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Queue } from 'bullmq'
import { DataSource } from 'typeorm'
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from '../dto/purchase-order.dto'
import { RecordSupplierPaymentDto } from '../dto/record-payment.dto'
import { PurchaseOrderEntity } from '../entities/purchase-order.entity'
import { SupplierPaymentEntity } from '../entities/supplier-payment.entity'
import { PurchaseOrderPaymentStatus } from '../enums/purchase-order-payment-status.enum'
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository'
import { SupplierPaymentRepository } from '../repositories/supplier-payment.repository'
import { GrnRepository } from '@/modules/admin/operations/logistics/grn/grn.repository'

@Injectable()
export class PurchaseOrderService {
  private readonly logger = new Logger(PurchaseOrderService.name)

  constructor(
    private readonly repository: PurchaseOrderRepository,
    private readonly paymentRepository: SupplierPaymentRepository,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
    @InjectQueue('product') private readonly productQueue: Queue,
    private readonly grnRepository?: GrnRepository,
  ) {}

  /**
   * Creates a purchase order in DRAFT status.
   * Invalidates list caches.
   */

  async createPurchaseOrder(
    dto: CreatePurchaseOrderDto,
    ctx: RequestContextDto,
  ): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.createPurchaseOrder.name} Service Called`)
    const tenantId = ctx.tenantId
    const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const result = await this.repository.createAndSave(
      { ...dto, totalAmount, tenantId } as any,
      ctx,
    )
    await this.cacheService.delCache(`po:list`, tenantId)
    return result
  }

  /**
   * Returns paginated purchase orders with caching.
   */
  async findAllPurchaseOrders(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    status?: PurchaseOrderStatus,
    paymentStatus?: PurchaseOrderPaymentStatus,
  ): Promise<{
    items: PurchaseOrderEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    this.logger.log(`${this.findAllPurchaseOrders.name} Service Called`)
    const tenantId = ctx.tenantId
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
  async findOnePurchaseOrder(id: string, ctx: RequestContextDto): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.findOnePurchaseOrder.name} Service Called`)
    const tenantId = ctx.tenantId
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
  async updatePurchaseOrderStatus(
    id: string,
    dto: UpdatePurchaseOrderStatusDto,
    ctx: RequestContextDto,
  ): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.updatePurchaseOrderStatus.name} Service Called`)
    const tenantId = ctx.tenantId
    const order = await this.findOnePurchaseOrder(id, ctx)

    if (
      order.status === PurchaseOrderStatus.RECEIVED ||
      order.status === PurchaseOrderStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot change status of a ${order.status} order`)
    }

    let result: PurchaseOrderEntity
    if (dto.status === PurchaseOrderStatus.RECEIVED) {
      result = await this.receivePurchaseOrder(order, dto, ctx)
    } else {
      order.status = dto.status
      result = await this.repository.savePurchaseOrder(order)
    }

    await this.cacheService.delCache(`po:list`, tenantId)
    await this.cacheService.delCache(`po:id:${id}`, tenantId)
    return result
  }

  private async receivePurchaseOrder(
    order: PurchaseOrderEntity,
    dto: UpdatePurchaseOrderStatusDto,
    ctx: RequestContextDto,
  ): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.receivePurchaseOrder.name} Service Called`)
    const tenantId = ctx.tenantId
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      order.status = PurchaseOrderStatus.RECEIVED
      const savedOrder = await this.repository.savePurchaseOrder(order, queryRunner.manager)

      // Create a DRAFT GRN instead of updating stock directly
      if (this.grnRepository) {
        const grnNumber = await this.grnRepository.generateGrnNumber(tenantId)
        
        // If warehouseId/branchId are missing from the DTO, the UI must provide them or they must be fetched
        // For robustness, we enforce their presence or use dummy if testing (but we should require them)
        if (!dto.warehouseId || !dto.branchId) {
            throw new BadRequestException('warehouseId and branchId are required to receive goods')
        }

        await this.grnRepository.createAndSave({
          poId: order.id,
          supplierId: order.supplierId,
          warehouseId: dto.warehouseId,
          branchId: dto.branchId,
          notes: `Auto-generated GRN from PO ${order.referenceNumber}`,
          items: order.items.map(item => ({
            productId: item.productId || (item.product as any)?.id,
            variantId: item.variantId || (item.variant as any)?.id,
            orderedQty: item.quantity,
            receivedQty: item.quantity, // Default to ordered quantity
            unitCost: item.unitPrice,
            condition: 'NEW',
          }))
        }, grnNumber, ctx, queryRunner.manager)
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
  async recordSupplierPayment(
    id: string,
    dto: RecordSupplierPaymentDto,
    ctx: RequestContextDto,
  ): Promise<PurchaseOrderEntity> {
    this.logger.log(`${this.recordSupplierPayment.name} Service Called`)
    const tenantId = ctx.tenantId
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const order = await this.repository.findById(id, tenantId, queryRunner.manager)
      if (!order) throw new NotFoundException('Purchase order not found')

      await this.paymentRepository.createAndSave(
        {
          ...dto,
          purchaseOrderId: order.id,
          supplierId: order.supplierId,
          tenantId,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
        },
        ctx,
        queryRunner.manager,
      )

      order.paidAmount = Number(order.paidAmount || 0) + Number(dto.amount)
      const totalAmount = Number(order.totalAmount)

      if (order.paidAmount >= totalAmount) {
        order.paymentStatus = PurchaseOrderPaymentStatus.PAID
      } else if (order.paidAmount > 0) {
        order.paymentStatus = PurchaseOrderPaymentStatus.PARTIAL
      } else {
        order.paymentStatus = PurchaseOrderPaymentStatus.PENDING
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

  async findAllPurchaseOrdersRaw(ctx: RequestContextDto): Promise<PurchaseOrderEntity[]> {
    this.logger.log(`${this.findAllPurchaseOrdersRaw.name} Service Called`)
    const tenantId = ctx.tenantId
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

  async findAllBySupplier(
    supplierId: string,
    ctx: RequestContextDto,
  ): Promise<PurchaseOrderEntity[]> {
    this.logger.log(`${this.findAllBySupplier.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.repository.findAllBySupplier(supplierId, tenantId)
  }

  async findAllPaymentsBySupplier(
    supplierId: string,
    ctx: RequestContextDto,
  ): Promise<SupplierPaymentEntity[]> {
    this.logger.log(`${this.findAllPaymentsBySupplier.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.paymentRepository.findAllBySupplier(supplierId, tenantId)
  }

  async findAllPaymentsByPurchaseOrder(ctx: RequestContextDto): Promise<SupplierPaymentEntity[]> {
    this.logger.log(`${this.findAllPaymentsByPurchaseOrder.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.paymentRepository.findAllPayments(tenantId)
  }
}

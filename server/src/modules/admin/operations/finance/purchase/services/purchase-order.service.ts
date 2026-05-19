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
import { GrnStatus } from '@/common/enums/grn-status.enum'
import { SupplierAPLedgerEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier-ap-ledger.entity'
import { SupplierAPReferenceType } from '@/modules/admin/operations/finance/supplier/enums/supplier-ap-Refernce-type.enum'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

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
    private readonly notificationService?: NotificationService,
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
      // 1. Re-fetch the order WITH items inside the transaction
      const orderWithItems = await queryRunner.manager.findOne(PurchaseOrderEntity, {
        where: { id: order.id, tenantId },
        relations: ['items', 'items.product', 'items.variant'],
      })

      if (!orderWithItems) throw new BadRequestException('Purchase order not found')
      if (!orderWithItems.items?.length)
        throw new BadRequestException('Purchase order has no items to receive')

      orderWithItems.status = PurchaseOrderStatus.RECEIVED
      const savedOrder = await this.repository.savePurchaseOrder(
        orderWithItems,
        queryRunner.manager,
      )

      // 2. Build item DTOs from the PO items
      const itemDtos = orderWithItems.items.map((item) => ({
        productId: item.productId || (item.product as any)?.id,
        variantId: item.variantId || (item.variant as any)?.id || null,
        orderedQty: item.quantity,
        receivedQty: item.quantity,
        unitCost: Number(item.unitPrice),
        condition: 'NEW',
      }))

      // 3. Strictly require warehouse / branch
      if (this.grnRepository) {
        const grnNumber = await this.grnRepository.generateGrnNumber(tenantId)

        const warehouseId = dto.warehouseId
        const branchId = dto.branchId

        if (!warehouseId || !branchId) {
          throw new BadRequestException(
            'Destination warehouse and branch must be selected to receive goods.',
          )
        }

        // 4. Create GRN
        await this.grnRepository.createAndSave(
          {
            poId: orderWithItems.id,
            supplierId: orderWithItems.supplierId,
            warehouseId,
            branchId,
            notes: `Auto GRN from PO ${orderWithItems.referenceNumber}`,
            items: itemDtos,
          },
          grnNumber,
          ctx,
          queryRunner.manager,
        )

        let totalGrnCost = 0

        // 5. Dispatch stock update jobs using itemDtos (not grn.items which may be unloaded)
        for (const item of itemDtos) {
          totalGrnCost += item.receivedQty * item.unitCost
          if (item.receivedQty > 0 && item.productId) {
            await this.productQueue.add('update-stock', {
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.receivedQty,
              type: InventoryTransactionType.PURCHASE,
              referenceType: InventoryTransactionReferenceType.GOODS_RECEIVED_NOTE,
              referenceId: grnNumber, // use grnNumber as reference until id available
              supplierId: orderWithItems.supplierId,
              tenantId,
              unitCost: item.unitCost,
              warehouseId,
              branchId,
            })
          }
        }

        // 6. Update Supplier Accounts Payable Ledger
        if (totalGrnCost > 0) {
          const lastEntry = await queryRunner.manager
            .createQueryBuilder(SupplierAPLedgerEntity, 'ap')
            .setLock('pessimistic_write')
            .where('ap.supplierId = :supplierId', { supplierId: orderWithItems.supplierId })
            .andWhere('ap.tenantId = :tenantId', { tenantId })
            .orderBy('ap.createdAt', 'DESC')
            .getOne()

          const balanceAfter = (lastEntry ? Number(lastEntry.balanceAfter) : 0) + totalGrnCost

          const entry = queryRunner.manager.create(SupplierAPLedgerEntity, {
            supplierId: orderWithItems.supplierId,
            tenantId,
            referenceType: SupplierAPReferenceType.GRN,
            debit: 0,
            credit: totalGrnCost,
            balanceAfter,
            remarks: `Auto GRN: PO ${orderWithItems.referenceNumber}`,
          })
          await queryRunner.manager.save(entry)
        }
      }

      await queryRunner.commitTransaction()

      // Trigger Notification for Supplier Invoice Due
      try {
        await this.notificationService.createNotification({
          title: 'Supplier Invoice Due soon',
          message: `Invoice for PO ${savedOrder.referenceNumber} is generated and will be due.`,
          type: 'WARNING',
          link: `/admin/finance/purchases/orders/${savedOrder.id}`,
          userId: null as any,
        }, tenantId);
      } catch (e) {
        this.logger.error(`Failed to trigger supplier invoice notification: ${e.message}`);
      }

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

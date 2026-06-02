import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { FulfillmentRepository } from './fulfillment.repository'
import { FulfillmentTaskEntity } from './entities/fulfillment-task.entity'
import { FulfillmentStatus } from './enums/fulfillment-status.enum'
import { FulfillmentItemStatus } from './entities/fulfillment-item.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager, DataSource } from 'typeorm'
import { InventoryLedgerService } from '../inventory-transaction/inventory-ledger.service'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { StockReservationService } from '../inventory-transaction/stock-reservation.service'
import { StockReservationEntity } from '../inventory-transaction/entities/stock-reservation.entity'
import { ReservationStatus } from '@/common/enums/reservation-status.enum'
import { ProductBatchService } from '../inventory-transaction/product-batch.service'

@Injectable()
export class FulfillmentService {
  private readonly logger = new Logger(FulfillmentService.name)

  constructor(
    private readonly repository: FulfillmentRepository,
    private readonly inventoryService: InventoryLedgerService,
    private readonly dataSource: DataSource,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly reservationService: StockReservationService,
    private readonly batchService: ProductBatchService,
  ) {}

  async createFromOrder(
    orderId: string,
    ctx: RequestContextDto,
  ): Promise<FulfillmentTaskEntity | null> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, tenantId: ctx.tenantId },
      relations: ['items', 'items.product', 'items.variant'],
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    const physicalItems = order.items.filter((item) => item.product?.productType !== 'SERVICE')

    if (physicalItems.length === 0) {
      // If there are no physical items to fulfill, we mark order as SHIPPED immediately
      await this.orderRepository.update(orderId, { status: OrderStatus.SHIPPED })
      return null
    }

    // Route to the best warehouse. Heuristic order:
    //   1. If the request context already specifies a warehouseId (e.g. POS), use it.
    //   2. Pick the active warehouse that holds enough live stock for the entire
    //      order. Prefer the one with the highest minimum-coverage across items.
    //   3. Fall back to the first active warehouse.
    const warehouses = await this.dataSource.getRepository(WarehouseEntity).find({
      where: { tenantId: ctx.tenantId, isActive: true },
    })

    let warehouseId: string | null = (ctx as any).warehouseId || null

    if (!warehouseId && warehouses.length > 0) {
      let bestId: string | null = null
      let bestScore = -Infinity
      for (const wh of warehouses) {
        // Score = lowest coverage ratio across items in this warehouse.
        // 1.0 means the warehouse can fully cover every line.
        let minRatio = Infinity
        for (const item of physicalItems) {
          const live = await this.inventoryService
            .getLiveStock(item.productId, item.variantId || null, ctx.tenantId, wh.id)
            .catch(() => 0)
          const needed = Number(item.quantity)
          const ratio = needed > 0 ? Number(live) / needed : 1
          if (ratio < minRatio) minRatio = ratio
        }
        if (minRatio > bestScore) {
          bestScore = minRatio
          bestId = wh.id
        }
      }
      warehouseId = bestId ?? warehouses[0].id
    }

    const task = await this.repository.createTask({
      orderId: order.id,
      tenantId: ctx.tenantId,
      status: FulfillmentStatus.PENDING,
      warehouseId: warehouseId,
      items: physicalItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        status: FulfillmentItemStatus.PENDING,
      })) as any,
    })

    return task
  }

  async startPicking(
    taskId: string,
    userId: string,
    ctx: RequestContextDto,
  ): Promise<FulfillmentTaskEntity> {
    const task = await this.repository.findTaskById(taskId, ctx.tenantId)
    if (!task) throw new NotFoundException('Fulfillment task not found')

    if (task.status !== FulfillmentStatus.PENDING) {
      throw new BadRequestException('Task is already in progress or completed')
    }

    await this.repository.updateTask(taskId, {
      status: FulfillmentStatus.PICKING,
      assignedToUserId: userId,
      startedAt: new Date(),
    })

    return this.repository.findTaskById(taskId, ctx.tenantId) as Promise<FulfillmentTaskEntity>
  }

  async pickItem(
    taskId: string,
    itemId: string,
    quantity: number,
    binId: string | undefined,
    ctx: RequestContextDto,
  ): Promise<void> {
    const task = await this.repository.findTaskById(taskId, ctx.tenantId)
    if (!task) throw new NotFoundException('Fulfillment task not found')

    const item = task.items.find((i) => i.id === itemId)
    if (!item) throw new NotFoundException('Fulfillment item not found')

    const newPickedQty = Number(item.pickedQuantity) + quantity
    if (newPickedQty > item.quantity) {
      throw new BadRequestException('Picked quantity exceeds ordered quantity')
    }

    await this.repository.updateItem(itemId, {
      pickedQuantity: newPickedQty,
      binId: binId,
      status:
        newPickedQty === item.quantity
          ? FulfillmentItemStatus.PICKED
          : FulfillmentItemStatus.PENDING,
    })
  }

  /**
   * Batch pick: validates the entire payload first, then applies every update
   * inside a single DB transaction. If any line fails (over-pick, missing item),
   * no row is mutated — eliminating the partial-state bug from the per-item loop.
   */
  async pickItemsBatch(
    taskId: string,
    lines: { itemId: string; quantity: number; binId?: string }[],
    ctx: RequestContextDto,
  ): Promise<FulfillmentTaskEntity> {
    const task = await this.repository.findTaskById(taskId, ctx.tenantId)
    if (!task) throw new NotFoundException('Fulfillment task not found')

    // Pre-validate the whole batch up-front.
    const itemById = new Map(task.items.map((it) => [it.id, it]))
    const intent: Array<{
      itemId: string
      pickedQuantity: number
      binId?: string
      status: FulfillmentItemStatus
    }> = []

    for (const line of lines) {
      const item = itemById.get(line.itemId)
      if (!item) throw new NotFoundException(`Fulfillment item ${line.itemId} not found`)

      const newPickedQty = Number(item.pickedQuantity) + line.quantity
      if (newPickedQty > item.quantity) {
        throw new BadRequestException(
          `Picked quantity (${newPickedQty}) exceeds ordered quantity (${item.quantity}) for item ${item.id}`,
        )
      }

      intent.push({
        itemId: line.itemId,
        pickedQuantity: newPickedQty,
        binId: line.binId,
        status:
          newPickedQty === item.quantity
            ? FulfillmentItemStatus.PICKED
            : FulfillmentItemStatus.PENDING,
      })
    }

    // Single transaction — all or nothing.
    await this.dataSource.transaction(async (manager) => {
      for (const u of intent) {
        await manager.update('fulfillment_items', { id: u.itemId }, {
          picked_quantity: u.pickedQuantity,
          bin_id: u.binId ?? null,
          status: u.status,
        } as any)
      }
    })

    return (await this.repository.findTaskById(taskId, ctx.tenantId))!
  }

  async completePacking(taskId: string, ctx: RequestContextDto): Promise<FulfillmentTaskEntity> {
    const task = await this.repository.findTaskById(taskId, ctx.tenantId)
    if (!task) throw new NotFoundException('Fulfillment task not found')

    // Check if all items are picked
    const allPicked = task.items.every((i) => i.status === FulfillmentItemStatus.PICKED)
    if (!allPicked) {
      throw new BadRequestException('Not all items have been picked')
    }

    await this.repository.updateTask(taskId, {
      status: FulfillmentStatus.PACKED,
    })

    return this.repository.findTaskById(taskId, ctx.tenantId) as Promise<FulfillmentTaskEntity>
  }

  async shipOrder(taskId: string, ctx: RequestContextDto): Promise<FulfillmentTaskEntity> {
    const task = await this.repository.findTaskById(taskId, ctx.tenantId)
    if (!task) throw new NotFoundException('Fulfillment task not found')

    if (task.status !== FulfillmentStatus.PACKED) {
      throw new BadRequestException('Task must be PACKED before shipping')
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1. Record Inventory Movement (SALE) and Reconcile active Stock Reservations
      for (const item of task.items) {
        // Find corresponding reservation for this order / product / variant
        const reservation = await manager.findOne(StockReservationEntity, {
          where: {
            orderId: task.orderId,
            productId: item.productId,
            variantId: item.variantId ?? null,
            tenantId: ctx.tenantId,
          },
        })

        if (reservation && reservation.status === ReservationStatus.ACTIVE) {
          // Consume the reservation (fulfill it)
          await this.reservationService.fulfill(
            reservation.id,
            item.quantity,
            ctx,
            manager,
            task.warehouseId,
          )

          // Reconcile ledger: Write RESERVATION_CANCEL to reverse the reservation decrement,
          // so that the SALE decrement doesn't double-deduct.
          await this.inventoryService.createLedgerEntry(
            {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              type: InventoryTransactionType.RESERVATION_CANCEL,
              referenceType: InventoryTransactionReferenceType.ORDER,
              referenceId: task.orderId,
              warehouseId: task.warehouseId,
            },
            ctx,
            manager,
          )
        }

        // Record the actual sale decrement using FEFO allocation
        let allocations: { batchId: string; quantity: number }[] = []
        try {
          allocations = await this.batchService.allocateFEFOStock(
            ctx.tenantId,
            item.productId,
            item.variantId ?? null,
            item.quantity,
            manager,
          )
        } catch (batchErr) {
          this.logger.warn(
            `FEFO Batch allocation failed for item ${item.productId}: ${batchErr.message}. Falling back to default inventory deduction.`,
          )
        }

        if (allocations.length > 0) {
          for (const alloc of allocations) {
            await this.inventoryService.createLedgerEntry(
              {
                productId: item.productId,
                variantId: item.variantId,
                quantity: alloc.quantity,
                type: InventoryTransactionType.SALE,
                referenceType: InventoryTransactionReferenceType.ORDER,
                referenceId: task.orderId,
                warehouseId: task.warehouseId,
                batchId: alloc.batchId,
              },
              ctx,
              manager,
            )
          }
        } else {
          // Fallback to non-batch ledger entry if no active batches are configured
          await this.inventoryService.createLedgerEntry(
            {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              type: InventoryTransactionType.SALE,
              referenceType: InventoryTransactionReferenceType.ORDER,
              referenceId: task.orderId,
              warehouseId: task.warehouseId,
            },
            ctx,
            manager,
          )
        }
      }

      // 2. Update Task Status
      await manager.update(FulfillmentTaskEntity, taskId, {
        status: FulfillmentStatus.SHIPPED,
        completedAt: new Date(),
      })

      // 3. Update Order Status
      await manager.update(OrderEntity, task.orderId, {
        status: OrderStatus.SHIPPED,
      })

      return this.repository.findTaskById(taskId, ctx.tenantId) as Promise<FulfillmentTaskEntity>
    })
  }

  async findAllTasks(ctx: RequestContextDto, status?: string): Promise<FulfillmentTaskEntity[]> {
    return this.repository.findAllTasksByTenant(ctx.tenantId, status)
  }

  async getTask(taskId: string, ctx: RequestContextDto): Promise<FulfillmentTaskEntity> {
    const task = await this.repository.findTaskById(taskId, ctx.tenantId)
    if (!task) throw new NotFoundException('Fulfillment task not found')
    return task
  }
}

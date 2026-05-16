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

@Injectable()
export class FulfillmentService {
  private readonly logger = new Logger(FulfillmentService.name)

  constructor(
    private readonly repository: FulfillmentRepository,
    private readonly inventoryService: InventoryLedgerService,
    private readonly dataSource: DataSource,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async createFromOrder(orderId: string, ctx: RequestContextDto): Promise<FulfillmentTaskEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, tenantId: ctx.tenantId },
      relations: ['items', 'items.product', 'items.variant'],
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    // Try to find a default warehouse for the tenant
    let warehouseId = null
    const warehouses = await this.dataSource.getRepository(WarehouseEntity).find({
      where: { tenantId: ctx.tenantId, isActive: true },
      take: 1,
    })
    if (warehouses.length > 0) {
      warehouseId = warehouses[0].id
    }

    const task = await this.repository.createTask({
      orderId: order.id,
      tenantId: ctx.tenantId,
      status: FulfillmentStatus.PENDING,
      warehouseId: warehouseId,
      items: order.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        status: FulfillmentItemStatus.PENDING,
      })) as any,
    })

    return task
  }

  async startPicking(taskId: string, userId: string, ctx: RequestContextDto): Promise<FulfillmentTaskEntity> {
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

  async pickItem(taskId: string, itemId: string, quantity: number, binId: string | undefined, ctx: RequestContextDto): Promise<void> {
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
      status: newPickedQty === item.quantity ? FulfillmentItemStatus.PICKED : FulfillmentItemStatus.PENDING,
    })
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
      // 1. Record Inventory Movement (SALE)
      // This is where physical stock is actually deducted in the ledger
      for (const item of task.items) {
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

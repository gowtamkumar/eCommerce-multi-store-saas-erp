import { RequestContextDto } from '@/common/dto/request-context.dto'
import { StockTransferStatus } from '@/common/enums/stock-transfer-status.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { StockTransferEntity } from './entities/stock-transfer.entity'
import { StockTransferItemEntity } from './entities/stock-transfer-item.entity'
import { InventoryLedgerService } from './inventory-ledger.service'
import { CreateStockTransferDocDto } from './dto/create-stock-transfer-doc.dto'
import { UpdateStockTransferDocDto } from './dto/update-stock-transfer-doc.dto'
import { ReceiveStockTransferDto } from './dto/receive-stock-transfer.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Injectable()
export class StockTransferService {
  private readonly logger = new Logger(StockTransferService.name)

  constructor(
    @InjectRepository(StockTransferEntity)
    private readonly repo: Repository<StockTransferEntity>,
    @InjectRepository(StockTransferItemEntity)
    private readonly itemRepo: Repository<StockTransferItemEntity>,
    private readonly inventoryLedgerService: InventoryLedgerService,
    private readonly notificationService: NotificationService,
  ) {}

  private r(manager?: EntityManager): Repository<StockTransferEntity> {
    return manager ? manager.getRepository(StockTransferEntity) : this.repo
  }

  private ri(manager?: EntityManager): Repository<StockTransferItemEntity> {
    return manager ? manager.getRepository(StockTransferItemEntity) : this.itemRepo
  }

  private generateTransferNumber(): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const rand = Math.floor(1000 + Math.random() * 9000)
    return `ST-${today}-${rand}`
  }

  async create(
    dto: CreateStockTransferDocDto,
    ctx: RequestContextDto,
  ): Promise<StockTransferEntity> {
    this.logger.log(`Creating Stock Transfer document for tenant: ${ctx.tenantId}`)

    if (dto.sourceWarehouseId === dto.destinationWarehouseId) {
      throw new BadRequestException('Source and Destination warehouse must be different')
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one item line must be provided')
    }

    const transfer = this.repo.create({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      transferNumber: this.generateTransferNumber(),
      sourceWarehouseId: dto.sourceWarehouseId,
      destinationWarehouseId: dto.destinationWarehouseId,
      remarks: dto.remarks || null,
      status: StockTransferStatus.DRAFT,
    })

    const savedTransfer = await this.repo.save(transfer)

    const items = dto.items.map((line) => {
      return this.itemRepo.create({
        transferId: savedTransfer.id,
        productId: line.productId,
        variantId: line.variantId || null,
        quantityRequested: line.quantityRequested,
        quantityReceived: 0,
      })
    })

    savedTransfer.items = await this.itemRepo.save(items)
    return savedTransfer
  }

  async findAll(
    ctx: RequestContextDto,
    paginationDto: PaginationDto & { status?: StockTransferStatus; q?: string },
  ): Promise<{
    items: StockTransferEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 20, status, q } = paginationDto

    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.sourceWarehouse', 'sourceWarehouse')
      .leftJoinAndSelect('t.destinationWarehouse', 'destinationWarehouse')
      .leftJoinAndSelect('t.user', 'user')
      .where('t.tenantId = :tenantId', { tenantId: ctx.tenantId })
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (status) {
      qb.andWhere('t.status = :status', { status })
    }
    if (q) {
      qb.andWhere('(LOWER(t.transferNumber) LIKE :q OR LOWER(t.remarks) LIKE :q)', {
        q: `%${q.toLowerCase()}%`,
      })
    }

    const [items, total] = await qb.getManyAndCount()

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<StockTransferEntity> {
    const transfer = await this.repo.findOne({
      where: { id, tenantId: ctx.tenantId },
      relations: {
        sourceWarehouse: true,
        destinationWarehouse: true,
        user: true,
        items: {
          product: true,
          variant: true,
        },
      },
    })

    if (!transfer) {
      throw new NotFoundException(`Stock transfer document ${id} not found`)
    }

    return transfer
  }

  async update(
    id: string,
    dto: UpdateStockTransferDocDto,
    ctx: RequestContextDto,
  ): Promise<StockTransferEntity> {
    const transfer = await this.findOne(id, ctx)

    if (transfer.status !== StockTransferStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update stock transfer document in status: ${transfer.status}`,
      )
    }

    if (dto.sourceWarehouseId) {
      transfer.sourceWarehouseId = dto.sourceWarehouseId
    }
    if (dto.destinationWarehouseId) {
      transfer.destinationWarehouseId = dto.destinationWarehouseId
    }
    if (transfer.sourceWarehouseId === transfer.destinationWarehouseId) {
      throw new BadRequestException('Source and Destination warehouse must be different')
    }

    if (dto.remarks !== undefined) {
      transfer.remarks = dto.remarks
    }

    await this.repo.save(transfer)

    if (dto.items) {
      if (dto.items.length === 0) {
        throw new BadRequestException('At least one item line must be provided')
      }

      // Diff-based update: only touch rows that actually changed.
      // Keeps stable IDs so any downstream reference (ledger, fulfillment) survives.
      const existingItems = await this.itemRepo.find({ where: { transferId: transfer.id } })
      const existingById = new Map(existingItems.map((it) => [it.id, it]))
      const incomingIds = new Set<string>()

      for (const line of dto.items) {
        const incomingId = (line as any).id as string | undefined
        if (incomingId && existingById.has(incomingId)) {
          // Update existing line in place.
          const row = existingById.get(incomingId)!
          row.productId = line.productId
          row.variantId = line.variantId || null
          row.quantityRequested = line.quantityRequested
          await this.itemRepo.save(row)
          incomingIds.add(incomingId)
        } else {
          // Insert new line.
          const created = await this.itemRepo.save(
            this.itemRepo.create({
              transferId: transfer.id,
              productId: line.productId,
              variantId: line.variantId || null,
              quantityRequested: line.quantityRequested,
              quantityReceived: 0,
            }),
          )
          incomingIds.add(created.id)
        }
      }

      // Soft-delete the items that the caller removed.
      const removed = existingItems.filter((it) => !incomingIds.has(it.id))
      if (removed.length > 0) {
        await this.itemRepo.softRemove(removed)
      }
    }

    return this.findOne(id, ctx)
  }

  async approve(id: string, ctx: RequestContextDto): Promise<StockTransferEntity> {
    const transfer = await this.findOne(id, ctx)
    if (transfer.status !== StockTransferStatus.DRAFT) {
      throw new BadRequestException(`Cannot approve transfer in status: ${transfer.status}`)
    }

    transfer.status = StockTransferStatus.APPROVED
    const saved = await this.repo.save(transfer)
    await this.notifyStockTransfer(saved, 'Stock Transfer Approved', 'SUCCESS')
    return saved
  }

  async ship(id: string, ctx: RequestContextDto): Promise<StockTransferEntity> {
    const transfer = await this.findOne(id, ctx)

    if (
      transfer.status !== StockTransferStatus.APPROVED &&
      transfer.status !== StockTransferStatus.DRAFT
    ) {
      throw new BadRequestException(`Cannot ship transfer in status: ${transfer.status}`)
    }

    // 1. Verify stock availability at source warehouse
    for (const item of transfer.items) {
      const stock = await this.inventoryLedgerService.getLiveStock(
        item.productId,
        item.variantId,
        ctx.tenantId,
        transfer.sourceWarehouseId,
      )
      if (stock < item.quantityRequested) {
        throw new BadRequestException(
          `Insufficient stock for product "${item.product.name}" in source warehouse. ` +
            `Available: ${stock}, Requested: ${item.quantityRequested}`,
        )
      }
    }

    // 2. Perform database updates in transaction
    const connection = this.repo.manager.connection
    await connection.transaction(async (manager) => {
      const activeRepo = this.r(manager)

      // Update document status
      transfer.status = StockTransferStatus.IN_TRANSIT
      await activeRepo.save(transfer)

      // Deduct stock from source warehouse
      for (const item of transfer.items) {
        await this.inventoryLedgerService.createLedgerEntry(
          {
            productId: item.productId,
            variantId: item.variantId || undefined,
            warehouseId: transfer.sourceWarehouseId,
            type: InventoryTransactionType.TRANSFER_OUT,
            quantity: item.quantityRequested,
            referenceType: InventoryTransactionReferenceType.STOCK_TRANSFER,
            referenceId: transfer.transferNumber,
            remarks: `Transfer ${transfer.transferNumber} in-transit to ${transfer.destinationWarehouseId}`,
          },
          ctx,
          manager,
        )
      }
    })

    const shipped = await this.findOne(id, ctx)
    await this.notifyStockTransfer(shipped, 'Stock Transfer Shipped', 'INFO')
    return shipped
  }

  async receive(
    id: string,
    dto: ReceiveStockTransferDto,
    ctx: RequestContextDto,
  ): Promise<StockTransferEntity> {
    const transfer = await this.findOne(id, ctx)

    if (transfer.status !== StockTransferStatus.IN_TRANSIT) {
      throw new BadRequestException(`Cannot receive transfer in status: ${transfer.status}`)
    }

    const connection = this.repo.manager.connection
    await connection.transaction(async (manager) => {
      const activeRepo = this.r(manager)
      const activeItemRepo = this.ri(manager)

      transfer.status = StockTransferStatus.RECEIVED
      await activeRepo.save(transfer)

      for (const item of transfer.items) {
        // Find if this specific item has custom quantity received
        const receivedLine = dto.items?.find((r) => r.itemId === item.id)
        const qtyReceived = receivedLine ? receivedLine.quantityReceived : item.quantityRequested

        item.quantityReceived = qtyReceived
        await activeItemRepo.save(item)

        // Increment stock in destination warehouse
        await this.inventoryLedgerService.createLedgerEntry(
          {
            productId: item.productId,
            variantId: item.variantId || undefined,
            warehouseId: transfer.destinationWarehouseId,
            type: InventoryTransactionType.TRANSFER_IN,
            quantity: qtyReceived,
            referenceType: InventoryTransactionReferenceType.STOCK_TRANSFER,
            referenceId: transfer.transferNumber,
            remarks: `Transfer ${transfer.transferNumber} received from ${transfer.sourceWarehouseId}`,
          },
          ctx,
          manager,
        )
      }
    })

    const received = await this.findOne(id, ctx)
    await this.notifyStockTransfer(received, 'Stock Transfer Received', 'SUCCESS')
    return received
  }

  async cancel(id: string, ctx: RequestContextDto): Promise<StockTransferEntity> {
    const transfer = await this.findOne(id, ctx)

    if (
      transfer.status === StockTransferStatus.RECEIVED ||
      transfer.status === StockTransferStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot cancel transfer in status: ${transfer.status}`)
    }

    const connection = this.repo.manager.connection
    await connection.transaction(async (manager) => {
      const activeRepo = this.r(manager)

      // If IN_TRANSIT, reverse the deduction from the source warehouse
      if (transfer.status === StockTransferStatus.IN_TRANSIT) {
        for (const item of transfer.items) {
          await this.inventoryLedgerService.createLedgerEntry(
            {
              productId: item.productId,
              variantId: item.variantId || undefined,
              warehouseId: transfer.sourceWarehouseId,
              type: InventoryTransactionType.TRANSFER_IN,
              quantity: item.quantityRequested,
              referenceType: InventoryTransactionReferenceType.STOCK_TRANSFER,
              referenceId: transfer.transferNumber,
              remarks: `Reversal of cancelled transfer ${transfer.transferNumber}`,
            },
            ctx,
            manager,
          )
        }
      }

      transfer.status = StockTransferStatus.CANCELLED
      await activeRepo.save(transfer)
    })

    const cancelled = await this.findOne(id, ctx)
    await this.notifyStockTransfer(cancelled, 'Stock Transfer Cancelled', 'WARNING')
    return cancelled
  }

  private async notifyStockTransfer(
    transfer: StockTransferEntity,
    title: string,
    type: string,
  ): Promise<void> {
    try {
      await this.notificationService.createNotification(
        {
          title,
          message: `Stock Transfer #${transfer.transferNumber} is now ${transfer.status}.`,
          type,
          link: `/admin/stock-transfers`,
          userId: null as any,
        },
        transfer.tenantId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger stock transfer notification: ${e.message}`)
    }
  }
}

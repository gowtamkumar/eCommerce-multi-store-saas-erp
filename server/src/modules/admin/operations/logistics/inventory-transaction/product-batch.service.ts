import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { createHash } from 'crypto'
import { IsNull, MoreThan, LessThanOrEqual, EntityManager, DataSource, Repository } from 'typeorm'
import { ProductBatchEntity } from './entities/product-batch.entity'
import { ProductBatchRepository } from './repositories/product-batch.repository'
import { BatchStatus } from '@/common/enums/batch-status.enum'
import { CreateProductBatchDto } from './dto/create-product-batch.dto'
import { UpdateProductBatchDto } from './dto/update-product-batch.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { InventoryLedgerService } from './inventory-ledger.service'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'

@Injectable()
export class ProductBatchService {
  private readonly logger = new Logger(ProductBatchService.name)

  constructor(
    private readonly repo: ProductBatchRepository,
    private readonly ledgerService: InventoryLedgerService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProductBatchDto, ctx: RequestContextDto): Promise<ProductBatchEntity> {
    this.logger.log(`Creating product batch: ${dto.batchNumber}`)

    // Create the batch record
    const batch = this.repo.create({
      ...dto,
      storeId: ctx.storeId,
      manufactureDate: dto.manufactureDate ? new Date(dto.manufactureDate) : null,
      expiryDate: new Date(dto.expiryDate),
      currentQuantity: dto.initialQuantity,
      status: BatchStatus.ACTIVE,
    })

    const savedBatch = await this.repo.save(batch)

    // Write to ledger if initial quantity > 0
    if (dto.initialQuantity > 0) {
      await this.ledgerService.createLedgerEntry(
        {
          productId: dto.productId,
          variantId: dto.variantId,
          type: InventoryTransactionType.INITIAL_BALANCE,
          quantity: dto.initialQuantity,
          referenceType: InventoryTransactionReferenceType.BATCH_INTAKE,
          referenceId: `BATCH-${savedBatch.batchNumber}`,
          batchId: savedBatch.id,
          remarks: `Initial stock for batch ${savedBatch.batchNumber}`,
        },
        ctx,
      )
    }

    return savedBatch
  }

  async findAll(
    ctx: RequestContextDto,
    pagination: PaginationDto & {
      productId?: string
      variantId?: string
      status?: string
      expiringSoon?: boolean
    },
  ): Promise<{
    items: ProductBatchEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const {
      page = 1,
      limit = 20,
      q: search,
      productId,
      variantId,
      status,
      expiringSoon,
    } = pagination
    const storeId = ctx.storeId

    const qb = this.repo
      .txRepo()
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.product', 'product')
      .leftJoinAndSelect('b.variant', 'variant')
      .where('b.storeId = :storeId', { storeId })
      .orderBy('b.expiryDate', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)

    if (productId) {
      qb.andWhere('b.productId = :productId', { productId })
    }

    if (variantId) {
      qb.andWhere('b.variantId = :variantId', { variantId })
    }

    if (status) {
      qb.andWhere('b.status = :status', { status })
    }

    if (expiringSoon) {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      qb.andWhere(
        'b.expiryDate <= :thirtyDaysFromNow AND b.expiryDate > :now AND b.status = :activeStatus',
        {
          thirtyDaysFromNow,
          now: new Date(),
          activeStatus: BatchStatus.ACTIVE,
        },
      )
    }

    if (search) {
      qb.andWhere('(b.batchNumber ILIKE :search OR product.name ILIKE :search)', {
        search: `%${search}%`,
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

  async findOne(id: string, ctx: RequestContextDto): Promise<ProductBatchEntity> {
    const batch = await this.repo.findOne({
      where: { id, storeId: ctx.storeId },
      relations: {
        product: true,
        variant: true,
      },
    })

    if (!batch) {
      throw new NotFoundException('Product batch not found')
    }

    return batch
  }

  async update(
    id: string,
    dto: UpdateProductBatchDto,
    ctx: RequestContextDto,
  ): Promise<ProductBatchEntity> {
    const batch = await this.findOne(id, ctx)

    if (dto.batchNumber !== undefined) batch.batchNumber = dto.batchNumber
    if (dto.manufactureDate !== undefined)
      batch.manufactureDate = dto.manufactureDate ? new Date(dto.manufactureDate) : null
    if (dto.expiryDate !== undefined) batch.expiryDate = new Date(dto.expiryDate)
    if (dto.status !== undefined) batch.status = dto.status

    return await this.repo.save(batch)
  }

  /**
   * FEFO (First Expired, First Out) stock allocation logic.
   * Decrements currentQuantity of active batches chronologically.
   *
   * Concurrency safety:
   *   1. Acquires a transaction-scoped advisory lock on (store, product, variant)
   *      so two concurrent shipments can't both read the same `currentQuantity`.
   *   2. Reads candidate batches with `pessimistic_write` to row-lock them.
   */
  async allocateFEFOStock(
    storeId: string,
    productId: string,
    variantId: string | null,
    quantityRequested: number,
    manager: EntityManager,
  ): Promise<{ batchId: string; quantity: number }[]> {
    // Acquire FEFO lock (separate namespace from inventory_ledger).
    const composite = `fefo:${storeId}:${productId}:${variantId ?? 'null'}`
    const hash = createHash('sha256').update(composite).digest()
    const lockId = hash.readBigInt64BE(0).toString()
    await manager.query('SELECT pg_advisory_xact_lock($1::bigint)', [lockId])

    const repo = manager.getRepository(ProductBatchEntity)

    // Query active, non-expired batches with stock, sorted by expiry date ascending.
    // pessimistic_write blocks other transactions from picking the same rows until
    // this transaction commits.
    const query = repo
      .createQueryBuilder('b')
      .setLock('pessimistic_write')
      .where('b.storeId = :storeId', { storeId })
      .andWhere('b.productId = :productId', { productId })
      .andWhere('b.status = :status', { status: BatchStatus.ACTIVE })
      .andWhere('b.expiryDate > :now', { now: new Date() })
      .andWhere('b.currentQuantity > 0')
      .orderBy('b.expiryDate', 'ASC')

    if (variantId) {
      query.andWhere('b.variantId = :variantId', { variantId })
    } else {
      query.andWhere('b.variantId IS NULL')
    }

    const batches = await query.getMany()

    let remainingToAllocate = quantityRequested
    const allocations: { batchId: string; quantity: number }[] = []

    for (const batch of batches) {
      if (remainingToAllocate <= 0) break

      const currentQty = Number(batch.currentQuantity)
      const allocQty = Math.min(currentQty, remainingToAllocate)

      batch.currentQuantity = currentQty - allocQty
      remainingToAllocate -= allocQty

      await repo.save(batch)
      allocations.push({ batchId: batch.id, quantity: allocQty })
    }

    if (remainingToAllocate > 0) {
      throw new BadRequestException(
        `Insufficient unexpired batch stock for product ID ${productId}`,
      )
    }

    return allocations
  }

  /**
   * Marks expired batches and writes off any positive residual stock as a
   * DAMAGE ledger entry so the inventory ledger stays consistent with the
   * batch reality.
   *
   * Called by a BullMQ repeatable job (see InventoryLedgerModule) and also
   * exposed manually via the controller.
   */
  async markExpiredBatches(storeId: string): Promise<number> {
    // Find expired-but-still-active batches, locking them so we don't double-process.
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ProductBatchEntity)
      const expired = await repo
        .createQueryBuilder('b')
        .setLock('pessimistic_write')
        .where('b.storeId = :storeId', { storeId })
        .andWhere('b.expiryDate < :now', { now: new Date() })
        .andWhere('b.status = :activeStatus', { activeStatus: BatchStatus.ACTIVE })
        .getMany()

      if (expired.length === 0) return 0

      for (const batch of expired) {
        const residual = Number(batch.currentQuantity)

        // Auto write-off residual quantity to keep ledger consistent.
        if (residual > 0) {
          try {
            await this.ledgerService.createLedgerEntry(
              {
                productId: batch.productId,
                variantId: batch.variantId || undefined,
                quantity: residual,
                type: InventoryTransactionType.DAMAGE,
                referenceType: InventoryTransactionReferenceType.BATCH_EXPIRY_WRITEOFF,
                referenceId: `BATCH-EXPIRY-${batch.batchNumber}`,
                batchId: batch.id,
                remarks: `Auto write-off of expired batch ${batch.batchNumber} (${residual} units)`,
              },
              { storeId, userId: 'system', user: { id: 'system', role: 'SYSTEM' } as any },
              manager,
            )
          } catch (err: any) {
            this.logger.warn(
              `Auto write-off for expired batch ${batch.batchNumber} failed: ${err.message}`,
            )
          }
        }

        batch.status = BatchStatus.EXPIRED
        batch.currentQuantity = 0
        await repo.save(batch)
      }

      return expired.length
    })
  }
}

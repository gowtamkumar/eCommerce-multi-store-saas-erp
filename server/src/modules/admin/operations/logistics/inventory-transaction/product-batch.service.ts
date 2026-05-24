import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull, MoreThan, LessThanOrEqual, EntityManager } from 'typeorm'
import { ProductBatchEntity } from './entities/product-batch.entity'
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
    @InjectRepository(ProductBatchEntity)
    private readonly repo: Repository<ProductBatchEntity>,
    private readonly ledgerService: InventoryLedgerService,
  ) {}

  async create(dto: CreateProductBatchDto, ctx: RequestContextDto): Promise<ProductBatchEntity> {
    this.logger.log(`Creating product batch: ${dto.batchNumber}`)

    // Create the batch record
    const batch = this.repo.create({
      ...dto,
      tenantId: ctx.tenantId,
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
          referenceType: InventoryTransactionReferenceType.CYCLE_COUNT, // Fallback reference type
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
    pagination: PaginationDto & { productId?: string; variantId?: string; status?: string; expiringSoon?: boolean },
  ): Promise<{
    items: ProductBatchEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const { page = 1, limit = 20, q: search, productId, variantId, status, expiringSoon } = pagination
    const tenantId = ctx.tenantId

    const qb = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.product', 'product')
      .leftJoinAndSelect('b.variant', 'variant')
      .where('b.tenantId = :tenantId', { tenantId })
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
      qb.andWhere('b.expiryDate <= :thirtyDaysFromNow AND b.expiryDate > :now AND b.status = :activeStatus', {
        thirtyDaysFromNow,
        now: new Date(),
        activeStatus: BatchStatus.ACTIVE,
      })
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
      where: { id, tenantId: ctx.tenantId },
      relations: ['product', 'variant'],
    })

    if (!batch) {
      throw new NotFoundException('Product batch not found')
    }

    return batch
  }

  async update(id: string, dto: UpdateProductBatchDto, ctx: RequestContextDto): Promise<ProductBatchEntity> {
    const batch = await this.findOne(id, ctx)

    if (dto.batchNumber !== undefined) batch.batchNumber = dto.batchNumber
    if (dto.manufactureDate !== undefined) batch.manufactureDate = dto.manufactureDate ? new Date(dto.manufactureDate) : null
    if (dto.expiryDate !== undefined) batch.expiryDate = new Date(dto.expiryDate)
    if (dto.status !== undefined) batch.status = dto.status

    return await this.repo.save(batch)
  }

  /**
   * FEFO (First Expired, First Out) stock allocation logic.
   * Decrements currentQuantity of active batches chronologically.
   */
  async allocateFEFOStock(
    tenantId: string,
    productId: string,
    variantId: string | null,
    quantityRequested: number,
    manager: EntityManager,
  ): Promise<{ batchId: string; quantity: number }[]> {
    const repo = manager.getRepository(ProductBatchEntity)

    // Query active, non-expired batches with stock, sorted by expiry date ascending
    const query = repo
      .createQueryBuilder('b')
      .where('b.tenantId = :tenantId', { tenantId })
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
      throw new BadRequestException(`Insufficient unexpired batch stock for product ID ${productId}`)
    }

    return allocations
  }

  /**
   * Run nightly via cron or manually to mark expired batches
   */
  async markExpiredBatches(tenantId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder()
      .update(ProductBatchEntity)
      .set({ status: BatchStatus.EXPIRED })
      .where('tenantId = :tenantId', { tenantId })
      .andWhere('expiryDate < :now', { now: new Date() })
      .andWhere('status = :activeStatus', { activeStatus: BatchStatus.ACTIVE })
      .execute()

    return result.affected || 0
  }
}

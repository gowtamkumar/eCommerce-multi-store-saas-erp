import { getTransactionalRepo } from '@/common/utils/repository.util'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ReservationStatus } from '@/common/enums/reservation-status.enum'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { StockReservationEntity } from './entities/stock-reservation.entity'
import { InventoryLedgerService } from './inventory-ledger.service'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'

export interface ReserveDto {
  productId: string
  variantId?: string | null
  warehouseId?: string | null
  orderId?: string | null
  reservedQty: number
  expiresAt?: Date | null
  notes?: string | null
}

@Injectable()
export class StockReservationService {
  private readonly logger = new Logger(StockReservationService.name)

  constructor(
    @InjectRepository(StockReservationEntity)
    private readonly repo: Repository<StockReservationEntity>,
    private readonly inventoryLedgerService: InventoryLedgerService,
  ) {}

  // ── Private helper to pick the right repo (supports EntityManager transactions) ──
  private r(manager?: EntityManager): Repository<StockReservationEntity> {
    return getTransactionalRepo(StockReservationEntity, this.repo, manager)
  }

  // ============================================================================
  // RESERVE
  // ============================================================================

  /**
   * Creates an ACTIVE stock reservation row.
   * Also called alongside a RESERVATION inventory_ledger entry; both are written
   * within the same parent EntityManager transaction.
   */
  async reserve(
    dto: ReserveDto,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<StockReservationEntity> {
    const repo = this.r(manager)

    const reservation = repo.create({
      storeId: ctx.storeId,
      userId: ctx.userId,
      productId: dto.productId,
      variantId: dto.variantId ?? null,
      warehouseId: dto.warehouseId ?? null,
      orderId: dto.orderId ?? null,
      reservedQty: dto.reservedQty,
      fulfilledQty: 0,
      releasedQty: 0,
      status: ReservationStatus.ACTIVE,
      expiresAt: dto.expiresAt ?? null,
      reservedAt: new Date(),
      releasedAt: null,
      notes: dto.notes ?? null,
    })

    return repo.save(reservation)
  }

  // ============================================================================
  // FULFILL
  // ============================================================================

  /**
   * Records that `qty` units of this reservation have been physically shipped.
   * When fulfilledQty + releasedQty reaches reservedQty the row moves to FULFILLED.
   */
  async fulfill(
    reservationId: string,
    qty: number,
    ctx: RequestContextDto,
    manager?: EntityManager,
    warehouseId?: string | null,
  ): Promise<StockReservationEntity> {
    const repo = this.r(manager)
    const reservation = await repo.findOne({
      where: { id: reservationId, storeId: ctx.storeId },
    })

    if (!reservation) {
      throw new NotFoundException(`Stock reservation ${reservationId} not found`)
    }
    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot fulfill reservation ${reservationId} — status is ${reservation.status}`,
      )
    }

    const newFulfilled = Number(reservation.fulfilledQty) + qty
    const total = Number(reservation.reservedQty)

    if (newFulfilled > total) {
      throw new BadRequestException(
        `Fulfill qty (${qty}) would exceed reserved qty (${total}) for reservation ${reservationId}`,
      )
    }

    reservation.fulfilledQty = newFulfilled
    if (warehouseId) {
      reservation.warehouseId = warehouseId
    }
    const consumed = newFulfilled + Number(reservation.releasedQty)
    if (consumed >= total) {
      reservation.status = ReservationStatus.FULFILLED
    }

    return repo.save(reservation)
  }

  // ============================================================================
  // RELEASE
  // ============================================================================

  /**
   * Explicitly releases `qty` units back to available stock (e.g. order cancellation).
   * Pass qty = null to release the entire remaining unreleased / unfulfilled amount.
   */
  async release(
    reservationId: string,
    qty: number | null,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<StockReservationEntity> {
    const repo = this.r(manager)
    const reservation = await repo.findOne({
      where: { id: reservationId, storeId: ctx.storeId },
    })

    if (!reservation) {
      throw new NotFoundException(`Stock reservation ${reservationId} not found`)
    }
    if (reservation.status !== ReservationStatus.ACTIVE) {
      this.logger.warn(
        `Release called on non-ACTIVE reservation ${reservationId} (status=${reservation.status}) — skipping`,
      )
      return reservation
    }

    const remaining =
      Number(reservation.reservedQty) -
      Number(reservation.fulfilledQty) -
      Number(reservation.releasedQty)

    const releaseAmt = qty !== null ? Math.min(qty, remaining) : remaining

    reservation.releasedQty = Number(reservation.releasedQty) + releaseAmt
    reservation.releasedAt = new Date()

    const consumed = Number(reservation.fulfilledQty) + Number(reservation.releasedQty)
    if (consumed >= Number(reservation.reservedQty)) {
      reservation.status = ReservationStatus.RELEASED
    }

    return repo.save(reservation)
  }

  // ============================================================================
  // EXPIRE (batch — called by a scheduled job)
  // ============================================================================

  /**
   * Marks ACTIVE reservations whose expiresAt has passed as EXPIRED.
   * Should be called by a BullMQ cron or Nest scheduled task.
   * Optionally scoped to a single store for targeted sweeps.
   */
  async expireStale(storeId?: string): Promise<number> {
    const qb = this.repo
      .createQueryBuilder('sr')
      .where('sr.status = :status', { status: ReservationStatus.ACTIVE })
      .andWhere('sr.expires_at IS NOT NULL')
      .andWhere('sr.expires_at < NOW()')

    if (storeId) {
      qb.andWhere('sr.store_id = :storeId', { storeId })
    }

    const expiredReservations = await qb.getMany()
    if (expiredReservations.length === 0) {
      return 0
    }

    let count = 0
    const connection = this.repo.manager.connection

    for (const reservation of expiredReservations) {
      try {
        await connection.transaction(async (manager) => {
          const freshRes = await manager.findOne(StockReservationEntity, {
            where: { id: reservation.id },
            lock: { mode: 'pessimistic_write' },
          })

          if (!freshRes || freshRes.status !== ReservationStatus.ACTIVE) {
            return
          }

          const remaining =
            Number(freshRes.reservedQty) -
            Number(freshRes.fulfilledQty) -
            Number(freshRes.releasedQty)

          if (remaining > 0) {
            const ctx: RequestContextDto = {
              storeId: freshRes.storeId,
              userId: freshRes.userId || 'system',
              user: { id: freshRes.userId || 'system', role: 'SYSTEM' } as any,
            }

            // Create ledger entry to release the hold (RESERVATION_CANCEL)
            await this.inventoryLedgerService.createLedgerEntry(
              {
                productId: freshRes.productId,
                variantId: freshRes.variantId || undefined,
                quantity: remaining,
                type: InventoryTransactionType.RESERVATION_CANCEL,
                referenceType: InventoryTransactionReferenceType.ORDER,
                referenceId: freshRes.orderId || undefined,
                remarks: `System auto-expiry of reservation ${freshRes.id}`,
              },
              ctx,
              manager,
            )

            freshRes.releasedQty = Number(freshRes.releasedQty) + remaining
            freshRes.releasedAt = new Date()
            freshRes.status = ReservationStatus.EXPIRED
            await manager.save(StockReservationEntity, freshRes)
            count++
          } else {
            freshRes.status = ReservationStatus.EXPIRED
            freshRes.releasedAt = new Date()
            await manager.save(StockReservationEntity, freshRes)
            count++
          }
        })
      } catch (error: any) {
        this.logger.error(
          `Failed to auto-expire reservation ${reservation.id} (storeId=${reservation.storeId}): ${error.message}`,
          error.stack,
        )
      }
    }

    if (count > 0) {
      this.logger.log(
        `Expired ${count} stale stock reservations${storeId ? ` for store ${storeId}` : ''}`,
      )
    }
    return count
  }

  // ============================================================================
  // QUERY HELPERS
  // ============================================================================

  /**
   * Returns the total ACTIVE reserved quantity for a product/variant across
   * all warehouses for a given store.
   * Use this to compute ATP: ATP = physicalStock − getOpenReservedQty(...)
   */
  async getOpenReservedQty(
    productId: string,
    variantId: string | null,
    storeId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = this.r(manager)

    const qb = repo
      .createQueryBuilder('sr')
      .select('COALESCE(SUM(sr.reserved_qty - sr.fulfilled_qty - sr.released_qty), 0)', 'openQty')
      .where('sr.product_id = :productId', { productId })
      .andWhere('sr.store_id = :storeId', { storeId })
      .andWhere('sr.status = :status', { status: ReservationStatus.ACTIVE })

    if (variantId) {
      qb.andWhere('sr.variant_id = :variantId', { variantId })
    } else {
      qb.andWhere('sr.variant_id IS NULL')
    }

    const result = await qb.getRawOne()
    return Number(result?.openQty ?? 0)
  }

  /** Returns the Available-to-Promise qty: physicalBalance − openReservations. */
  async getAtp(
    productId: string,
    variantId: string | null,
    physicalBalance: number,
    storeId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const openReserved = await this.getOpenReservedQty(productId, variantId, storeId, manager)
    return Math.max(0, physicalBalance - openReserved)
  }

  /** List all reservations for a given order. */
  async findByOrder(orderId: string, storeId: string): Promise<StockReservationEntity[]> {
    return this.repo.find({
      where: { orderId, storeId },
      order: { reservedAt: 'DESC' },
      relations: {
        product: true,
        variant: true,
        warehouse: true,
      },
    })
  }

  /** Paginated list of reservations with optional filters. */
  async findAll(
    storeId: string,
    opts: {
      productId?: string
      status?: ReservationStatus
      page?: number
      limit?: number
    } = {},
  ): Promise<{ items: StockReservationEntity[]; total: number }> {
    const { productId, status, page = 1, limit = 20 } = opts

    const qb = this.repo
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.product', 'product')
      .leftJoinAndSelect('sr.variant', 'variant')
      .leftJoinAndSelect('sr.warehouse', 'warehouse')
      .where('sr.storeId = :storeId', { storeId })
      .orderBy('sr.reservedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (productId) qb.andWhere('sr.productId = :productId', { productId })
    if (status) qb.andWhere('sr.status = :status', { status })

    const [items, total] = await qb.getManyAndCount()
    return { items, total }
  }
}

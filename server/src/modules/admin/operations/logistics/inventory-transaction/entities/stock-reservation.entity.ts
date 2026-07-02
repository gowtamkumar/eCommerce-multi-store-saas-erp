import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { ReservationStatus } from '@/common/enums/reservation-status.enum'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'

/**
 * Tracks the full lifecycle of a stock reservation:
 *  ACTIVE → FULFILLED  (shipment consumed the stock)
 *  ACTIVE → RELEASED   (order cancelled; stock returned to available)
 *  ACTIVE → EXPIRED    (expiresAt passed without fulfilment)
 *
 * This table sits alongside the inventory_ledger; it does NOT replace the
 * RESERVATION / RESERVATION_CANCEL ledger entries — those remain for the
 * immutable audit stream. This table exists so that:
 *  - Open reservations can be queried in O(1) without scanning the ledger
 *  - Reservations can carry expiry, release, and fulfilment amounts
 *  - Available-to-Promise (ATP) can be computed cleanly
 */
@Entity('stock_reservations')
@Unique('UQ_stock_res_order_product_variant', ['storeId', 'orderId', 'productId', 'variantId'])
@Index('IDX_stock_res_store_status', ['storeId', 'status'])
@Index('IDX_stock_res_product_store_status', ['productId', 'variantId', 'storeId', 'status'])
@Index('IDX_stock_res_expires_at', ['expiresAt'])
export class StockReservationEntity extends BaseEntity {
  // ── Product ────────────────────────────────────────────────────────────────
  @Column({ type: 'uuid', name: 'product_id' })
  @Index()
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  @Index()
  variantId: string | null

  @ManyToOne(() => ProductVariantEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity | null

  // ── Location ───────────────────────────────────────────────────────────────
  @Column({ type: 'uuid', name: 'warehouse_id', nullable: true })
  warehouseId: string | null

  @ManyToOne(() => WarehouseEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity | null

  // ── Source document ────────────────────────────────────────────────────────
  @Column({ type: 'uuid', name: 'order_id', nullable: true })
  @Index()
  orderId: string | null

  @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity | null

  // ── Quantities ─────────────────────────────────────────────────────────────
  /** Original quantity reserved. Never mutated after creation. */
  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'reserved_qty' })
  reservedQty: number

  /** Quantity consumed by a shipment/fulfilment. Grows from 0 → reservedQty. */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'fulfilled_qty' })
  fulfilledQty: number

  /** Quantity explicitly released (e.g. partial or full cancellation). */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'released_qty' })
  releasedQty: number

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  @Index()
  status: ReservationStatus

  /**
   * Optional wall-clock expiry. Null means the reservation never auto-expires.
   * A background job can sweep rows where expiresAt < now() and status = ACTIVE.
   */
  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt: Date | null

  @Column({ type: 'timestamptz', name: 'reserved_at', default: () => 'now()' })
  reservedAt: Date

  @Column({ type: 'timestamptz', name: 'released_at', nullable: true })
  releasedAt: Date | null

  @Column({ type: 'text', nullable: true })
  notes: string | null

  // ── Store ─────────────────────────────────────────────────────────────────
  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

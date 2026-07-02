import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { RefundMethod, ReturnType } from '@/common/enums/refund-method.enum'
import { ReturnStatus } from '@/common/enums/return-status.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { OrderEntity } from './order.entity'

@Entity('order_returns')
@Index(['storeId', 'status'])
export class OrderReturnEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'order_id' })
  @Index()
  orderId: string

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.PENDING,
  })
  status: ReturnStatus

  /**
   * Distinguishes a refund request from an exchange request.
   * Defaults to REFUND for backwards compatibility.
   */
  @Column({
    type: 'enum',
    enum: ReturnType,
    name: 'return_type',
    default: ReturnType.REFUND,
  })
  returnType: ReturnType

  /**
   * How the refund should be/was issued.
   * Defaults to STORE_CREDIT (wallet) for backwards compatibility.
   */
  @Column({
    type: 'enum',
    enum: RefundMethod,
    name: 'refund_method',
    default: RefundMethod.STORE_CREDIT,
  })
  refundMethod: RefundMethod

  @Column({ type: 'text' })
  reason: string

  @Column({ type: 'text', name: 'admin_comment', nullable: true })
  adminComment: string

  @Column({ type: 'decimal', name: 'refund_amount', precision: 10, scale: 2, nullable: true })
  refundAmount: number

  // Stores which items are returned: [{ productId, variantId, quantity }]
  @Column({ type: 'jsonb' })
  items: any[]

  /**
   * When returnType=EXCHANGE, stores the ID of the new sale order created for the exchange.
   * Allows finance reports to reconcile exchanges end-to-end.
   */
  @Column({ type: 'uuid', name: 'exchange_order_id', nullable: true })
  exchangeOrderId: string | null

  @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'exchange_order_id' })
  exchangeOrder: OrderEntity

  /** Timestamp when returned items were physically received back in the store/warehouse. */
  @Column({ type: 'timestamp', name: 'received_at', nullable: true })
  receivedAt: Date | null

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

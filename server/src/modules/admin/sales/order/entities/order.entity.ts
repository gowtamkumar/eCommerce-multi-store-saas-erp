import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { OrderSource } from '@/common/enums/order-source.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { ShippingAddressEntity } from '@/modules/store/shipping-address/entities/shipping-address.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { OrderItemEntity } from './order-item.entity'
import { OrderReturnEntity } from './order-return.entity'

@Entity('orders')
@Index(['storeId', 'createdAt'])
@Index(['storeId', 'status'])
export class OrderEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'customer_name', length: 255 })
  customerName: string

  @Column({ type: 'varchar', name: 'customer_email', length: 255 })
  customerEmail: string

  @Column({ type: 'varchar', name: 'customer_phone', length: 50 })
  customerPhone: string

  @Column({ type: 'text' })
  address: string

  @Column({ type: 'uuid', name: 'shipping_address_id', nullable: true })
  shippingAddressId: string

  @ManyToOne(() => ShippingAddressEntity, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: ShippingAddressEntity

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items: OrderItemEntity[]

  @OneToMany(() => OrderReturnEntity, (returnRequest) => returnRequest.order)
  returns: OrderReturnEntity[]

  @Column({ type: 'decimal', name: 'total_amount', precision: 10, scale: 2 })
  totalAmount: number

  @Column({ type: 'decimal', name: 'shipping_fee', precision: 10, scale: 2, default: 0 })
  shippingFee: number

  /**
   * Resolved order currency.
   * Resolution chain: createOrderDto.currency → store SiteSettings.currency → 'USD'
   * Default 'USD' kept in sync with the service-level fallback to avoid schema conflicts.
   */
  @Column({ type: 'varchar', name: 'currency', length: 10, default: 'USD' })
  currency: string

  @Column({ type: 'decimal', name: 'currency_rate', precision: 10, scale: 4, default: 1 })
  currencyRate: number

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus

  @Column({
    type: 'enum',
    name: 'order_source',
    enum: OrderSource,
    default: OrderSource.WEBSITE,
  })
  orderSource: OrderSource

  @Column({ type: 'varchar', name: 'payment_method', length: 50, nullable: true })
  paymentMethod: PaymentMethod

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus

  @Column({ type: 'varchar', name: 'transaction_id', length: 255, nullable: true })
  transactionId: string

  @Column({ type: 'text', name: 'order_notes', nullable: true })
  orderNotes: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'varchar', name: 'tracking_id', length: 255, nullable: true })
  trackingId: string

  @Column({ type: 'varchar', name: 'courier_status', length: 255, nullable: true })
  courierStatus: string

  @Column({ type: 'varchar', name: 'applied_coupon', length: 50, nullable: true })
  appliedCoupon: string

  @Column({ type: 'decimal', name: 'coupon_discount_amount', precision: 10, scale: 2, default: 0 })
  couponDiscountAmount: number

  @Column({ type: 'decimal', name: 'tax_amount', precision: 10, scale: 2, default: 0 })
  taxAmount: number

  @Column({ type: 'varchar', name: 'delivery_zone', length: 50, nullable: true })
  deliveryZone: string

  /** Amount deducted from the customer's wallet balance at checkout. */
  @Column({ type: 'decimal', name: 'wallet_deduction_amount', precision: 10, scale: 2, default: 0 })
  walletDeductionAmount: number

  @Column({ type: 'uuid', name: 'offline_sale_id', nullable: true, unique: true })
  offlineSaleId: string | null

  @Column({ type: 'jsonb', name: 'payments', nullable: true })
  payments: Array<{ method: string; amount: number; transactionId?: string }> | null
}

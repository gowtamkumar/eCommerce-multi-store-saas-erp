import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('payments')
@Index(['storeId', 'createdAt'])
@Index(['storeId', 'status', 'createdAt'])
export class PaymentEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity

  // TODO: Add user entity and relation
  // @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'user_id' })
  // user: UserEntity;

  @Column({ type: 'varchar', name: 'transaction_id', length: 255 })
  @Index()
  transactionId: string

  @Column({ type: 'decimal', name: 'amount', precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'varchar', name: 'currency', length: 10, default: 'BDT' })
  currency: string

  @Column({ type: 'enum', enum: PaymentMethod, name: 'method' })
  method: PaymentMethod

  @Column({ type: 'enum', enum: PaymentStatus, name: 'status', default: PaymentStatus.PENDING })
  status: PaymentStatus

  @Column({ type: 'jsonb', name: 'gateway_response', nullable: true })
  gatewayResponse: any

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

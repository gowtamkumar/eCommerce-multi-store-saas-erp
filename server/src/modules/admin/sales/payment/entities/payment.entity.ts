import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'

@Entity('payments')
@Index(['tenantId', 'createdAt'])
export class PaymentEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity

  // TODO: Add user entity and relation
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string

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

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}

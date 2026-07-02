import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('invoices')
@Index(['storeId', 'createdAt'])
export class InvoiceEntity extends BaseEntity {
  @Column({ type: 'varchar', name: 'invoice_number', unique: true, length: 100 })
  invoiceNumber: string

  @Column({ type: 'uuid', name: 'order_id' })
  @Index()
  orderId: string

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity

  @Column({ type: 'date', name: 'issue_date' })
  issueDate: Date

  @Column({ type: 'date', name: 'due_date', nullable: true })
  dueDate: Date

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  @Index()
  status: InvoiceStatus

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}

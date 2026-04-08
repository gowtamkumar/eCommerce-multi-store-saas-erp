import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('invoices')
@Index(['tenantId', 'createdAt'])
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

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  @Index()
  userId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}

import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { PurchaseOrderEntity } from './purchase-order.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('supplier_payments')
export class SupplierPaymentEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'purchase_order_id' })
  purchaseOrderId: string

  @ManyToOne(() => PurchaseOrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrderEntity

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'timestamp', name: 'payment_date', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date

  @Column({ type: 'varchar', name: 'payment_method', length: 50 })
  paymentMethod: string

  @Column({ type: 'varchar', name: 'transaction_id', length: 255, nullable: true })
  transactionId: string

  @Column({ type: 'text', nullable: true })
  note: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}

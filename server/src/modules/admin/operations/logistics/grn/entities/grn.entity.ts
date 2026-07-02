import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Index } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { PurchaseOrderEntity } from '@/modules/admin/operations/finance/purchase/entities/purchase-order.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { GrnStatus } from '@/common/enums/grn-status.enum'
import { GrnItemEntity } from './grn-item.entity'

@Entity('goods_received_notes')
@Index(['storeId', 'status'])
export class GoodsReceivedNoteEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  grnNumber: string

  @Column({ type: 'uuid', name: 'po_id' })
  @Index()
  poId: string

  @ManyToOne(() => PurchaseOrderEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'po_id' })
  purchaseOrder: PurchaseOrderEntity

  @Column({ type: 'uuid', name: 'supplier_id' })
  @Index()
  supplierId: string

  @ManyToOne(() => SupplierEntity, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({ type: 'timestamp' })
  receivedDate: Date

  @Column({ type: 'uuid', name: 'received_by_user_id' })
  receivedByUserId: string

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'received_by_user_id' })
  receivedByUser: UserEntity

  @Column({ type: 'uuid', name: 'warehouse_id' })
  warehouseId: string

  @ManyToOne(() => WarehouseEntity, { nullable: false })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity

  @Column({ type: 'uuid', name: 'branch_id' })
  branchId: string

  @ManyToOne(() => BranchEntity, { nullable: false })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({
    type: 'enum',
    enum: GrnStatus,
    default: GrnStatus.DRAFT,
  })
  status: GrnStatus

  @Column({ type: 'text', nullable: true })
  notes: string

  @OneToMany(() => GrnItemEntity, (item) => item.grn, {
    cascade: true,
  })
  items: GrnItemEntity[]

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

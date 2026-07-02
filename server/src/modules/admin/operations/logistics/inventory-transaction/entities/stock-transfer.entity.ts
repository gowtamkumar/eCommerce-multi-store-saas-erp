import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StockTransferStatus } from '@/common/enums/stock-transfer-status.enum'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { StockTransferItemEntity } from './stock-transfer-item.entity'

@Entity('stock_transfers')
@Index(['storeId', 'createdAt'])
@Index(['storeId', 'status'])
export class StockTransferEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, name: 'transfer_number' })
  @Index()
  transferNumber: string

  @Column({ type: 'uuid', name: 'source_warehouse_id' })
  @Index()
  sourceWarehouseId: string

  @ManyToOne(() => WarehouseEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'source_warehouse_id' })
  sourceWarehouse: WarehouseEntity

  @Column({ type: 'uuid', name: 'destination_warehouse_id' })
  @Index()
  destinationWarehouseId: string

  @ManyToOne(() => WarehouseEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'destination_warehouse_id' })
  destinationWarehouse: WarehouseEntity

  @Column({
    type: 'enum',
    enum: StockTransferStatus,
    default: StockTransferStatus.DRAFT,
  })
  @Index()
  status: StockTransferStatus

  @Column({ type: 'text', nullable: true })
  remarks: string | null

  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @OneToMany(() => StockTransferItemEntity, (item) => item.transfer, { cascade: true })
  items: StockTransferItemEntity[]
}

import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { WarehouseType } from '@/common/enums/warehouse-type.enum'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BranchEntity } from './branch.entity'
import { WarehouseBinEntity } from './warehouse-bin.entity'

@Entity('warehouses')
export class WarehouseEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ unique: true })
  @Index()
  code: string

  @Column({
    type: 'enum',
    enum: WarehouseType,
    default: WarehouseType.CENTRAL,
    name: 'location_type',
  })
  locationType: WarehouseType

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'text', name: 'ip_whitelist', nullable: true })
  ipWhitelist: string

  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  @Index()
  branchId: string

  @ManyToOne(() => BranchEntity, (branch) => branch.warehouses, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @OneToMany(() => WarehouseBinEntity, (bin) => bin.warehouse)
  bins: WarehouseBinEntity[]
}

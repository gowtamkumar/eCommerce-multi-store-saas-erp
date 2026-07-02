import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { WarehouseEntity } from './warehouse.entity'

@Entity('branches')
export class BranchEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ unique: true })
  @Index()
  code: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'text', name: 'ip_whitelist', nullable: true })
  ipWhitelist: string

  @Column({ type: 'numeric', name: 'latitude', precision: 10, scale: 7, nullable: true })
  latitude: number | null

  @Column({ type: 'numeric', name: 'longitude', precision: 10, scale: 7, nullable: true })
  longitude: number | null

  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @OneToMany(() => WarehouseEntity, (warehouse) => warehouse.branch)
  warehouses: WarehouseEntity[]
}

import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { WarehouseEntity } from './warehouse.entity'

@Entity('warehouse_bins')
@Index(['warehouseId', 'binCode'], { unique: true })
export class WarehouseBinEntity extends BaseEntity {
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string

  @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.bins, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity

  @Column()
  zone: string // e.g., "Zone-A"

  @Column({ name: 'bin_code' })
  binCode: string // e.g., "A-01-05"

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean
}

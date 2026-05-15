import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { WarehouseType } from '@/common/enums/warehouse-type.enum'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
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

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

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

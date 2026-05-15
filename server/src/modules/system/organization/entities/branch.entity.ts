import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
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

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @OneToMany(() => WarehouseEntity, (warehouse) => warehouse.branch)
  warehouses: WarehouseEntity[]
}

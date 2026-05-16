import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('departments')
export class DepartmentEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}

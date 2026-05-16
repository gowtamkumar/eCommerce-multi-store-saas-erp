import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Entity('departments')
export class DepartmentEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}

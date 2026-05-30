import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'

/**
 * Per-tenant monotonically increasing sequence used to mint human-readable
 * employee codes such as `EMP-000123`. The repository uses an atomic UPDATE
 * with `RETURNING` to avoid the random-collision behaviour of the previous
 * `EMP-${1000-9999}` generator.
 */
@Entity('hrm_employee_id_sequences')
@Unique(['tenantId'])
export class EmployeeIdSequenceEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'varchar', default: 'EMP-' })
  prefix: string

  @Column({ type: 'int', name: 'pad_length', default: 6 })
  padLength: number

  @Column({ type: 'bigint', name: 'last_value', default: 0 })
  lastValue: number
}

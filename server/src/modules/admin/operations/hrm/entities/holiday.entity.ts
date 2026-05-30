import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, BeforeInsert, BeforeUpdate, Index } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'

@Entity('holidays')
@Index(['tenantId', 'year'])
@Index(['tenantId', 'date'])
export class HolidayEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  /**
   * Optional branch scope. NULL means the holiday applies to all branches
   * within the tenant.
   */
  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string | null

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity | null

  @Column({ type: 'date' })
  date: Date

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'int' })
  year: number

  @Column({ type: 'boolean', name: 'is_optional', default: false })
  isOptional: boolean

  @Column({ type: 'text', nullable: true })
  description: string

  @BeforeInsert()
  @BeforeUpdate()
  setYear() {
    if (this.date) {
      this.year = new Date(this.date).getFullYear()
    }
  }
}

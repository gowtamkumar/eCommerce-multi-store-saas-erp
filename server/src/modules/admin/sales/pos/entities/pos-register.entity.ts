import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

export enum PosRegisterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('pos_registers')
@Index(['branchId'])
@Index(['tenantId'])
export class PosRegisterEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'uuid', name: 'branch_id' })
  branchId: string

  @ManyToOne(() => BranchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({
    type: 'enum',
    enum: PosRegisterStatus,
    default: PosRegisterStatus.ACTIVE,
  })
  status: PosRegisterStatus

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}

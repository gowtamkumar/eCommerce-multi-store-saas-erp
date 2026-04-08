import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { LeadStatus } from '@/common/enums/lead-status.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

/** Database Index: Optimizes default chronological sorts */
@Index(['tenantId', 'createdAt'])
/** Database Index: Optimizes dashboard status filtering */
@Index(['tenantId', 'status', 'createdAt'])
@Entity('leads')
export class LeadEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string

  @Column({ type: 'varchar', length: 255 })
  email: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string

  @Column({ type: 'text', nullable: true })
  message: string

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}

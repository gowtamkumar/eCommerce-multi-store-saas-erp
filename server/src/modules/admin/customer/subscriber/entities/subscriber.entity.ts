import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'

/** 
 * Database Index: Optimizes chronological and tenant-based lookups
 * Unique Constraint: Ensures an email is only subscribed once per tenant
 */
@Index(['createdAt'])
@Index(['tenantId'])
@Unique(['tenantId', 'email'])
@Entity('subscribers')
export class SubscriberEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  email: string

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}

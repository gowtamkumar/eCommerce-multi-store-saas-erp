import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Unique, ManyToOne, JoinColumn } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('tenant_traffic')
@Unique(['tenantId', 'date'])
export class TenantTrafficEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @Column({ type: 'date' })
  date: Date

  @Column({ type: 'int', name: 'request_count', default: 0 })
  requestCount: number

  @Column({ type: 'timestamptz', name: 'last_updated', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}

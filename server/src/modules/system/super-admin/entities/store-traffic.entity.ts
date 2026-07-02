import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Unique, ManyToOne, JoinColumn } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('store_traffic')
@Unique(['storeId', 'date'])
export class StoreTrafficEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

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

import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

/** Database Index: Optimizes default chronological lookups */
@Index(['createdAt'])
@Entity('subscribers')
export class SubscriberEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}

import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { LeadStatus } from '@/common/enums/lead-status.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

/** Database Index: Optimizes default chronological sorts */
@Index(['storeId', 'createdAt'])
/** Database Index: Optimizes dashboard status filtering */
@Index(['storeId', 'status', 'createdAt'])
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

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}

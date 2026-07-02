import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('system_notifications')
@Index(['storeId', 'userId'])
export class NotificationEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id', nullable: true })
  storeId: string | null

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text' })
  message: string

  @Column({ type: 'varchar', length: 50, default: 'SYSTEM' })
  type: string // e.g., ORDER, SYSTEM, INVENTORY, ALERT

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string | null // e.g., URL to the order details

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity | null
}

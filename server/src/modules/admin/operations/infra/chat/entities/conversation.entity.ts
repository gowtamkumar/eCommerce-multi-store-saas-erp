import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { ChatMessageEntity } from './chat-message.entity'

@Entity('chat_conversations')
@Index(['storeId', 'visitorId'])
export class ConversationEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id', nullable: true })
  storeId: string | null

  @Column({ type: 'varchar', length: 255, name: 'visitor_id' })
  visitorId: string

  @Column({ type: 'uuid', name: 'customer_id', nullable: true })
  customerId: string | null

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string // e.g., ACTIVE, CLOSED

  @Column({ type: 'integer', name: 'unread_count_admin', default: 0 })
  unreadCountAdmin: number

  @Column({ type: 'integer', name: 'unread_count_visitor', default: 0 })
  unreadCountVisitor: number

  @Column({ type: 'timestamp', name: 'last_message_at', default: () => 'CURRENT_TIMESTAMP' })
  lastMessageAt: Date

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: UserEntity | null

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity | null

  @OneToMany(() => ChatMessageEntity, (message) => message.conversation)
  messages: ChatMessageEntity[]
}

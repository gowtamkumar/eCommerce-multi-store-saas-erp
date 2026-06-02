import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { ConversationEntity } from './conversation.entity'

@Entity('chat_messages')
export class ChatMessageEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'conversation_id' })
  conversationId: string

  @Column({ type: 'varchar', length: 50, name: 'sender_type' })
  senderType: string // 'VISITOR' or 'AGENT'

  @Column({ type: 'uuid', name: 'sender_id', nullable: true })
  senderId: string | null // User ID of agent (if agent) or User ID of customer (if customer)

  @Column({ type: 'varchar', length: 255, name: 'sender_name', nullable: true })
  senderName: string | null

  @Column({ type: 'text' })
  message: string

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity
}

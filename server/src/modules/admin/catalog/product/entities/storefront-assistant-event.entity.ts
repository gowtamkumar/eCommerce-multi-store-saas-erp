import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

export type StorefrontAssistantEventType = 'chat' | 'qa'

@Entity('storefront_assistant_events')
@Index(['tenantId', 'createdAt'])
export class StorefrontAssistantEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string

  @Column({ type: 'varchar', length: 32 })
  type: StorefrontAssistantEventType

  @Column({ name: 'live_chat_handoff', type: 'boolean', default: false })
  liveChatHandoff: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date
}

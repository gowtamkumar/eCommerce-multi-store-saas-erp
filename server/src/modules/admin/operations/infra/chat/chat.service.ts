import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConversationEntity } from './entities/conversation.entity'
import { ChatMessageEntity } from './entities/chat-message.entity'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepo: Repository<ChatMessageEntity>,
  ) {}

  /**
   * Get or create a conversation for a visitor
   */
  async getOrCreateConversation(
    tenantId: string | null,
    visitorId: string,
    customerId?: string | null,
  ): Promise<ConversationEntity> {
    let conversation = await this.conversationRepo.findOne({
      where: { tenantId, visitorId },
      relations: {
        customer: true,
      },
    })

    if (!conversation) {
      conversation = this.conversationRepo.create({
        tenantId,
        visitorId,
        customerId: customerId || null,
        status: 'ACTIVE',
        unreadCountAdmin: 0,
        unreadCountVisitor: 0,
      })
      conversation = await this.conversationRepo.save(conversation)
    } else if (customerId && !conversation.customerId) {
      // Upgrade anonymous session to customer
      conversation.customerId = customerId
      conversation = await this.conversationRepo.save(conversation)
    }

    return conversation
  }

  /**
   * Save a new chat message
   */
  async saveMessage(
    conversationId: string,
    senderType: 'VISITOR' | 'AGENT',
    senderId: string | null,
    senderName: string | null,
    message: string,
  ): Promise<ChatMessageEntity> {
    return await this.messageRepo.manager.transaction(async (em) => {
      const conversation = await em.findOne(ConversationEntity, {
        where: { id: conversationId },
      })

      if (!conversation) {
        throw new NotFoundException('Conversation not found')
      }

      const chatMessage = em.create(ChatMessageEntity, {
        conversationId,
        senderType,
        senderId,
        senderName,
        message,
        isRead: false,
      })

      const savedMessage = await em.save(ChatMessageEntity, chatMessage)

      // Update conversation metadata atomically using TypeORM expression update
      const updateData: any = { lastMessageAt: new Date() }
      if (senderType === 'VISITOR') {
        updateData.unreadCountAdmin = () => '"unread_count_admin" + 1'
      } else {
        updateData.unreadCountVisitor = () => '"unread_count_visitor" + 1'
      }

      await em.createQueryBuilder()
        .update(ConversationEntity)
        .set(updateData)
        .where('id = :conversationId', { conversationId })
        .execute()

      return savedMessage
    })
  }

  /**
   * Verifies a conversation exists and (when a tenant is supplied) belongs to
   * that tenant. Returns the conversation. Throws otherwise. Pass `undefined`
   * to skip the tenant check (e.g. public visitor flows already scoped by
   * tenant + visitorId).
   */
  async assertConversation(
    conversationId: string,
    tenantId?: string | null,
  ): Promise<ConversationEntity> {
    const where: any = { id: conversationId }
    if (tenantId !== undefined) {
      where.tenantId = tenantId
    }
    const conversation = await this.conversationRepo.findOne({ where })
    if (!conversation) {
      throw new NotFoundException('Conversation not found')
    }
    return conversation
  }

  /**
   * Get messages for a specific conversation. When `tenantId` is provided the
   * conversation must belong to that tenant, preventing cross-tenant reads.
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
    tenantId?: string | null,
  ): Promise<[ChatMessageEntity[], number]> {
    await this.assertConversation(conversationId, tenantId)
    return await this.messageRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    })
  }

  /**
   * Get all active conversations for a tenant (dashboard agents)
   */
  async getConversations(
    tenantId: string | null,
    status?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<[ConversationEntity[], number]> {
    const where: any = { tenantId }
    if (status) {
      where.status = status
    }

    return await this.conversationRepo.findAndCount({
      where,
      relations: {
        customer: true,
      },
      order: { lastMessageAt: 'DESC' },
      take: limit,
      skip: offset,
    })
  }

  /**
   * Mark messages in a conversation as read
   */
  async markAsRead(
    conversationId: string,
    readerType: 'VISITOR' | 'AGENT',
    tenantId?: string | null,
  ): Promise<void> {
    const where: any = { id: conversationId }
    if (tenantId !== undefined) {
      where.tenantId = tenantId
    }
    const conversation = await this.conversationRepo.findOne({ where })

    if (!conversation) return

    if (readerType === 'AGENT') {
      conversation.unreadCountAdmin = 0
      await this.conversationRepo.save(conversation)
      await this.messageRepo.update(
        { conversationId, senderType: 'VISITOR', isRead: false },
        { isRead: true },
      )
    } else {
      conversation.unreadCountVisitor = 0
      await this.conversationRepo.save(conversation)
      await this.messageRepo.update(
        { conversationId, senderType: 'AGENT', isRead: false },
        { isRead: true },
      )
    }
  }
}

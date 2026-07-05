import { Injectable, NotFoundException } from '@nestjs/common'
import { ConversationEntity } from './entities/conversation.entity'
import { ChatMessageEntity } from './entities/chat-message.entity'
import { ConversationRepository } from './repositories/conversation.repository'
import { ChatMessageRepository } from './repositories/chat-message.repository'

@Injectable()
export class ChatService {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: ChatMessageRepository,
  ) {}

  /**
   * Get or create a conversation for a visitor
   */
  async getOrCreateConversation(
    storeId: string | null,
    visitorId: string,
    customerId?: string | null,
  ): Promise<ConversationEntity> {
    let conversation = await this.conversationRepo.findOne({
      where: { storeId, visitorId },
      relations: {
        customer: true,
      },
    })

    if (!conversation) {
      conversation = this.conversationRepo.create({
        storeId,
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
    return await this.messageRepo.txRepo().manager.transaction(async (em) => {
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
   * Verifies a conversation exists and (when a store is supplied) belongs to
   * that store. Returns the conversation. Throws otherwise. Pass `undefined`
   * to skip the store check (e.g. public visitor flows already scoped by
   * store + visitorId).
   */
  async assertConversation(
    conversationId: string,
    storeId?: string | null,
  ): Promise<ConversationEntity> {
    const where: any = { id: conversationId }
    if (storeId !== undefined) {
      where.storeId = storeId
    }
    const conversation = await this.conversationRepo.findOne({ where })
    if (!conversation) {
      throw new NotFoundException('Conversation not found')
    }
    return conversation
  }

  /**
   * Get messages for a specific conversation. When `storeId` is provided the
   * conversation must belong to that store, preventing cross-store reads.
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
    storeId?: string | null,
  ): Promise<[ChatMessageEntity[], number]> {
    await this.assertConversation(conversationId, storeId)
    return await this.messageRepo.txRepo().findAndCount({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    })
  }

  /**
   * Get all active conversations for a store (dashboard agents)
   */
  async getConversations(
    storeId: string | null,
    status?: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<[ConversationEntity[], number]> {
    const where: any = { storeId }
    if (status) {
      where.status = status
    }

    return await this.conversationRepo.txRepo().findAndCount({
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
    storeId?: string | null,
  ): Promise<void> {
    const where: any = { id: conversationId }
    if (storeId !== undefined) {
      where.storeId = storeId
    }
    const conversation = await this.conversationRepo.findOne({ where })

    if (!conversation) return

    if (readerType === 'AGENT') {
      conversation.unreadCountAdmin = 0
      await this.conversationRepo.save(conversation)
      await this.messageRepo.txRepo().update(
        { conversationId, senderType: 'VISITOR', isRead: false },
        { isRead: true },
      )
    } else {
      conversation.unreadCountVisitor = 0
      await this.conversationRepo.save(conversation)
      await this.messageRepo.txRepo().update(
        { conversationId, senderType: 'AGENT', isRead: false },
        { isRead: true },
      )
    }
  }
}

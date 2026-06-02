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
      relations: ['customer'],
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
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversation not found')
    }

    const chatMessage = this.messageRepo.create({
      conversationId,
      senderType,
      senderId,
      senderName,
      message,
      isRead: false,
    })

    const savedMessage = await this.messageRepo.save(chatMessage)

    // Update conversation metadata
    conversation.lastMessageAt = new Date()
    if (senderType === 'VISITOR') {
      conversation.unreadCountAdmin += 1
    } else {
      conversation.unreadCountVisitor += 1
    }
    await this.conversationRepo.save(conversation)

    return savedMessage
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[ChatMessageEntity[], number]> {
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
      relations: ['customer'],
      order: { lastMessageAt: 'DESC' },
      take: limit,
      skip: offset,
    })
  }

  /**
   * Mark messages in a conversation as read
   */
  async markAsRead(conversationId: string, readerType: 'VISITOR' | 'AGENT'): Promise<void> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    })

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

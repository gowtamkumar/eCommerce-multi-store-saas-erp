import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RequestContext } from '@/common/decorators/request-context.decorator';
import { RequestContextDto } from '@/common/dto/request-context.dto';
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('Chat Support')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Load history for public storefront visitor (Public)
   */
  @Get('history')
  @Public()
  @ApiOperation({ summary: 'Get or create conversation and load history for public visitor' })
  async getVisitorHistory(
    @RequestContext() ctx: RequestContextDto,
    @Query('visitorId') visitorId: string,
    @Query('customerId') customerId?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const tenantId = ctx.tenantId || null;
    const conversation = await this.chatService.getOrCreateConversation(tenantId, visitorId, customerId);
    const [messages] = await this.chatService.getMessages(conversation.id);

    return {
      success: true,
      statusCode: 200,
      message: 'Visitor chat history loaded',
      data: {
        conversation,
        messages,
      },
    };
  }

  /**
   * Mark conversation messages as read by Visitor (Public)
   */
  @Post('conversations/:id/read/visitor')
  @Public()
  @ApiOperation({ summary: 'Mark conversation as read by Visitor' })
  async markAsReadByVisitor(
    @Param('id') conversationId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.chatService.markAsRead(conversationId, 'VISITOR');

    return {
      success: true,
      statusCode: 200,
      message: 'Conversation marked as read by visitor',
      data: null,
    };
  }

  /**
   * Get all active conversations (Authenticated Admin)
   */
  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of conversations for tenant dashboard' })
  async getConversations(
    @RequestContext() ctx: RequestContextDto,
    @Query('status') status?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<BaseApiSuccessResponse<any>> {
    const tenantId = ctx.tenantId || null;
    const [conversations, total] = await this.chatService.getConversations(
      tenantId,
      status,
      limit,
      offset,
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Conversations retrieved successfully',
      data: {
        conversations,
        total,
      },
    };
  }

  /**
   * Get messages of a specific conversation (Authenticated Admin)
   */
  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get messages for a conversation' })
  async getConversationMessages(
    @Param('id') conversationId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<BaseApiSuccessResponse<any>> {
    const [messages, total] = await this.chatService.getMessages(conversationId, limit, offset);

    return {
      success: true,
      statusCode: 200,
      message: 'Messages loaded successfully',
      data: {
        messages,
        total,
      },
    };
  }

  /**
   * Mark conversation messages as read (Authenticated Admin)
   */
  @Post('conversations/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark conversation as read by Agent' })
  async markAsReadByAgent(
    @Param('id') conversationId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    await this.chatService.markAsRead(conversationId, 'AGENT');

    return {
      success: true,
      statusCode: 200,
      message: 'Conversation marked as read by agent',
      data: null,
    };
  }
}

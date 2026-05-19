import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'chat',
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth || {};
      let token = auth.token || client.handshake.headers?.authorization;
      const visitorId = auth.visitorId || client.handshake.query?.visitorId;
      const tenantId = auth.tenantId || client.handshake.query?.tenantId || null;

      // 1. Authenticate if the client is an Agent (dashboard)
      if (token) {
        if (token.startsWith('Bearer ')) {
          token = token.substring(7);
        }

        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET_KEY || 'myUnsecureJwtSecret',
        });

        client.data = {
          isAgent: true,
          userId: payload.sub || payload.id,
          tenantId: payload.tenantId || null,
          role: payload.role,
        };

        // Join tenant-wide agent room
        const agentRoom = `room:tenant_${client.data.tenantId}_agents`;
        client.join(agentRoom);

        this.logger.log(`Agent ${client.id} connected for tenant: ${client.data.tenantId}`);
      } else if (visitorId) {
        // 2. Identify client as Storefront Visitor
        client.data = {
          isAgent: false,
          visitorId,
          tenantId,
        };

        // Join personal visitor room
        const visitorRoom = `room:visitor_${visitorId}`;
        client.join(visitorRoom);

        this.logger.log(`Visitor ${client.id} connected for tenant: ${tenantId}, visitorId: ${visitorId}`);
      } else {
        this.logger.warn(`Disconnecting client ${client.id}: No agent token or visitorId provided.`);
        client.disconnect(true);
      }
    } catch (error) {
      this.logger.error(`Disconnecting client ${client.id}: Authentication failed.`, error.stack);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat Client disconnected: ${client.id}`);
  }

  /**
   * Listen for user/agent joining a specific conversation room
   */
  @SubscribeMessage('room.join')
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; senderType: 'VISITOR' | 'AGENT' },
  ) {
    const room = `room:chat_${data.conversationId}`;
    client.join(room);

    // Automatically mark previous messages as read
    await this.chatService.markAsRead(data.conversationId, data.senderType);

    // Notify others in the room
    client.to(room).emit('room.user_joined', {
      senderType: data.senderType,
      agentId: client.data.isAgent ? client.data.userId : null,
    });

    this.logger.log(`Client ${client.id} joined conversation room: ${data.conversationId}`);
  }

  /**
   * Listen for message exchange
   */
  @SubscribeMessage('message.send')
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      message: string;
      senderType: 'VISITOR' | 'AGENT';
      senderName: string;
    },
  ) {
    const senderId = client.data.isAgent ? client.data.userId : null;
    
    // Save to database
    const savedMessage = await this.chatService.saveMessage(
      data.conversationId,
      data.senderType,
      senderId,
      data.senderName,
      data.message,
    );

    const room = `room:chat_${data.conversationId}`;
    
    // Broadcast message to everyone in the conversation room
    this.server.to(room).emit('message.receive', savedMessage);

    // If sent by visitor, alert all tenant agents so they see the badge updates
    if (data.senderType === 'VISITOR') {
      const agentRoom = `room:tenant_${client.data.tenantId}_agents`;
      this.server.to(agentRoom).emit('agent.conversation_updated', {
        conversationId: data.conversationId,
        visitorId: client.data.visitorId,
        lastMessage: data.message,
      });
    }

    this.logger.log(`Message in ${data.conversationId} from ${data.senderType}: ${data.message.substring(0, 30)}`);
  }
}

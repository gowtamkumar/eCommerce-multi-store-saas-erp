import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'notifications',
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth?.token || client.handshake.headers?.authorization;

      if (!token) {
        this.logger.warn(`Disconnecting client ${client.id}: No authentication token provided.`);
        client.disconnect(true);
        return;
      }

      // Handle standard bearer scheme
      if (token.startsWith('Bearer ')) {
        token = token.substring(7);
      }

      // Verify the JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY || 'myUnsecureJwtSecret',
      });

      // Extract user metadata
      const userId = payload.sub || payload.id;
      const tenantId = payload.tenantId || null;
      const role = payload.role;

      // Store in client socket instance data
      client.data = {
        userId,
        tenantId,
        role,
      };

      // Join tenant room for isolation
      const tenantRoom = tenantId ? `tenant:${tenantId}` : 'tenant:global';
      client.join(tenantRoom);

      // Join user specific room
      client.join(`user:${userId}`);

      // Join role specific room (e.g. for global alerts to all Admins or Super Admins)
      if (role) {
        client.join(`role:${role}`);
      }

      this.logger.log(
        `Client ${client.id} authenticated. User: ${userId}, Tenant: ${tenantId || 'global'}, Role: ${role || 'user'}`,
      );
    } catch (error) {
      this.logger.error(`Disconnecting client ${client.id}: Authentication failed.`, error.stack);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Send notification to a specific tenant room
   */
  sendToTenant(tenantId: string | null, event: string, payload: any) {
    const room = tenantId ? `tenant:${tenantId}` : 'tenant:global';
    this.server.to(room).emit(event, payload);
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /**
   * Send notification to a specific role (e.g. SUPER_ADMIN)
   */
  sendToRole(role: string, event: string, payload: any) {
    this.server.to(`role:${role}`).emit(event, payload);
  }
}

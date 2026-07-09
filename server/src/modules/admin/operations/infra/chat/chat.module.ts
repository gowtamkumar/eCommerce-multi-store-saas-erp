import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ConversationEntity } from './entities/conversation.entity'
import { ChatMessageEntity } from './entities/chat-message.entity'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { ChatController } from './chat.controller'
import { getJwtSecret } from '@/common/utils/jwt-secret.util'
import { ConversationRepository } from './repositories/conversation.repository'
import { ChatMessageRepository } from './repositories/chat-message.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, ChatMessageEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES') || '15m' },
      }),
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ConversationRepository, ChatMessageRepository],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}

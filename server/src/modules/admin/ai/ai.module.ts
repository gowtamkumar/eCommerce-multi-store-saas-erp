import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiController } from './controllers/ai.controller'
import { AiAssistantService } from './services/ai-assistant.service'
import { TenantAiClientService } from './services/tenant-ai-client.service'

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [AiController],
  providers: [TenantAiClientService, AiAssistantService],
  exports: [TenantAiClientService, AiAssistantService],
})
export class AiModule {}

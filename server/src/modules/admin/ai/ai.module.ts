import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiController } from './controllers/ai.controller'
import { AiJobEntity } from './entities/ai-job.entity'
import { AiUsageLogEntity } from './entities/ai-usage-log.entity'
import { AiAssistantService } from './services/ai-assistant.service'
import { AiFeatureBootstrapService } from './services/ai-feature-bootstrap.service'
import { AiJobService } from './services/ai-job.service'
import { AiUsageLogService } from './services/ai-usage-log.service'
import { TenantAiClientService } from './services/tenant-ai-client.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantEntity, RoleEntity, AiJobEntity, AiUsageLogEntity]),
    BullModule.registerQueue({ name: 'ai' }),
  ],
  controllers: [AiController],
  providers: [
    TenantAiClientService,
    AiAssistantService,
    AiFeatureBootstrapService,
    AiUsageLogService,
    AiJobService,
  ],
  exports: [TenantAiClientService, AiAssistantService, AiUsageLogService, AiJobService],
})
export class AiModule {}

import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiController } from './controllers/ai.controller'
import { AiAssistantService } from './services/ai-assistant.service'
import { AiFeatureBootstrapService } from './services/ai-feature-bootstrap.service'
import { TenantAiClientService } from './services/tenant-ai-client.service'

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, RoleEntity])],
  controllers: [AiController],
  providers: [TenantAiClientService, AiAssistantService, AiFeatureBootstrapService],
  exports: [TenantAiClientService, AiAssistantService],
})
export class AiModule {}

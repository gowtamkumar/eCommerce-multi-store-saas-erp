import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { CartEntity } from '@/modules/store/cart/entities/cart.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { BullModule } from '@nestjs/bullmq'
import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AiController } from './controllers/ai.controller'
import { AiJobEntity } from './entities/ai-job.entity'
import { AiUsageLogEntity } from './entities/ai-usage-log.entity'
import { AiAutomationScheduler } from './schedulers/ai-automation.scheduler'
import { AdminCopilotService } from './services/admin-copilot.service'
import { AdminCopilotToolService } from './services/admin-copilot-tool.service'
import { AiAssistantService } from './services/ai-assistant.service'
import { AiAutomationService } from './services/ai-automation.service'
import { AiFeatureBootstrapService } from './services/ai-feature-bootstrap.service'
import { AiJobService } from './services/ai-job.service'
import { AiUsageLogService } from './services/ai-usage-log.service'
import { TenantAiClientService } from './services/tenant-ai-client.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      RoleEntity,
      AiJobEntity,
      AiUsageLogEntity,
      CartEntity,
    ]),
    BullModule.registerQueue({ name: 'ai' }),
    forwardRef(() => require('../catalog/product/product.module').ProductModule),
    forwardRef(() => require('../sales/order/order.module').OrderModule),
    forwardRef(() => require('../operations/finance/report/report.module').ReportModule),
  ],
  controllers: [AiController],
  providers: [
    TenantAiClientService,
    AiAssistantService,
    AiAutomationService,
    AdminCopilotService,
    AdminCopilotToolService,
    AiFeatureBootstrapService,
    AiUsageLogService,
    AiJobService,
    AiAutomationScheduler,
  ],
  exports: [
    TenantAiClientService,
    AiAssistantService,
    AiUsageLogService,
    AiJobService,
    AiAutomationService,
    AdminCopilotService,
  ],
})
export class AiModule {}

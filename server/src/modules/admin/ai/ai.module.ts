import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { CartEntity } from '@/modules/store/cart/entities/cart.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { BullModule } from '@nestjs/bullmq'
import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductModule } from '../catalog/product/product.module'
import { ReportModule } from '../operations/finance/report/report.module'
import { OrderModule } from '../sales/order/order.module'
import { AiController } from './controllers/ai.controller'
import { AiJobEntity } from './entities/ai-job.entity'
import { AiUsageLogEntity } from './entities/ai-usage-log.entity'
import { AiAutomationScheduler } from './schedulers/ai-automation.scheduler'
import { AdminCopilotToolService } from './services/admin-copilot-tool.service'
import { AdminCopilotService } from './services/admin-copilot.service'
import { AiAssistantBaseService } from './services/ai-assistant-base.service'
import { AiAutomationService } from './services/ai-automation.service'
import { AiFeatureBootstrapService } from './services/ai-feature-bootstrap.service'
import { AiJobService } from './services/ai-job.service'
import { AiRateLimiterService } from './services/ai-rate-limiter.service'
import { AiUsageLogService } from './services/ai-usage-log.service'
import { AiCatalogAssistantService } from './services/domains/ai-catalog-assistant.service'
import { AiContentAssistantService } from './services/domains/ai-content-assistant.service'
import { AiCoreAssistantService } from './services/domains/ai-core-assistant.service'
import { AiCrmAssistantService } from './services/domains/ai-crm-assistant.service'
import { AiFinanceAssistantService } from './services/domains/ai-finance-assistant.service'
import { AiHrmAssistantService } from './services/domains/ai-hrm-assistant.service'
import { AiInventoryAssistantService } from './services/domains/ai-inventory-assistant.service'
import { AiProcurementAssistantService } from './services/domains/ai-procurement-assistant.service'
import { AiSalesAssistantService } from './services/domains/ai-sales-assistant.service'
import { AiSupportAssistantService } from './services/domains/ai-support-assistant.service'
import { StoreAiClientService } from './services/store-ai-client.service'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { PurchaseModule } from '../operations/finance/purchase/purchase.module'
import { McpController } from './controllers/mcp.controller'
import { McpService } from './services/mcp.service'
import { McpAuthGuard } from './guards/mcp-auth.guard'
import { AiJobRepository } from './repositories/ai-job.repository'
import { AiUsageLogRepository } from './repositories/ai-usage-log.repository'
import { CartRepository } from '@/modules/store/cart/cart.repository'
import { RoleRepository } from '@/modules/admin/core/user/repositories/role.repository'
import { StoreRepository } from '@/modules/system/store/store.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity, RoleEntity, AiJobEntity, AiUsageLogEntity, CartEntity]),
    BullModule.registerQueue({ name: 'ai' }),
    forwardRef(() => ProductModule),
    forwardRef(() => OrderModule),
    forwardRef(() => ReportModule),
    UserModule,
    forwardRef(() => PurchaseModule),
  ],
  controllers: [AiController, McpController],
  providers: [
    StoreAiClientService,
    AiAssistantBaseService,
    AiCoreAssistantService,
    AiCatalogAssistantService,
    AiContentAssistantService,
    AiCrmAssistantService,
    AiSalesAssistantService,
    AiSupportAssistantService,
    AiInventoryAssistantService,
    AiProcurementAssistantService,
    AiFinanceAssistantService,
    AiHrmAssistantService,
    AiAutomationService,
    AdminCopilotService,
    AdminCopilotToolService,
    AiFeatureBootstrapService,
    AiRateLimiterService,
    AiUsageLogService,
    AiJobService,
    AiJobRepository,
    AiUsageLogRepository,
    CartRepository,
    RoleRepository,
    StoreRepository,
    AiAutomationScheduler,
    McpService,
    McpAuthGuard,
  ],
  exports: [
    StoreAiClientService,
    AiAssistantBaseService,
    AiCoreAssistantService,
    AiCatalogAssistantService,
    AiContentAssistantService,
    AiCrmAssistantService,
    AiSalesAssistantService,
    AiSupportAssistantService,
    AiInventoryAssistantService,
    AiProcurementAssistantService,
    AiFinanceAssistantService,
    AiHrmAssistantService,
    AiUsageLogService,
    AiJobService,
    AiAutomationService,
    AdminCopilotService,
    McpService,
  ],
})
export class AiModule {}

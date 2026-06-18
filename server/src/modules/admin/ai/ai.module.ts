import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TenantAiClientService } from './services/tenant-ai-client.service'

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantAiClientService],
  exports: [TenantAiClientService],
})
export class AiModule {}

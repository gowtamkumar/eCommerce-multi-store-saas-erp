import { LeadController } from '@/modules/admin/customer/lead/lead.controller'
import { LeadService } from '@/modules/admin/customer/lead/lead.service'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeadEntity } from './entities/lead.entity'
import { LeadRepository } from './lead.repository'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity]), CacheModule, TenantModule],
  controllers: [LeadController],
  providers: [LeadService, LeadRepository],
  exports: [LeadService],
})
export class LeadModule {}

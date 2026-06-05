import { LeadController } from '@/modules/admin/customer/lead/lead.controller'
import { LeadService } from '@/modules/admin/customer/lead/lead.service'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeadEntity } from './entities/lead.entity'
import { LeadRepository } from './lead.repository'

import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity]), CacheModule, TenantModule, NotificationModule],
  controllers: [LeadController],
  providers: [LeadService, LeadRepository],
  exports: [LeadService, LeadRepository],
})
export class LeadModule {}

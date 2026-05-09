import { Module } from '@nestjs/common'
import { FaqController } from './faq.controller'
import { FaqService } from './faq.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TenantModule],
  controllers: [FaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}

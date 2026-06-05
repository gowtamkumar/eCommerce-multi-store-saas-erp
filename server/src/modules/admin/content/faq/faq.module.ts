import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FaqEntity } from './entities/faq.entity'
import { FaqRepository } from './faq.repository'
import { FaqController } from './faq.controller'
import { FaqService } from './faq.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TypeOrmModule.forFeature([FaqEntity]), TenantModule],
  controllers: [FaqController],
  providers: [FaqService, FaqRepository],
  exports: [FaqService, FaqRepository],
})
export class FaqModule {}

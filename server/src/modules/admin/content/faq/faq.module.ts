import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FaqEntity } from './entities/faq.entity'
import { FaqRepository } from './faq.repository'
import { FaqController } from './faq.controller'
import { FaqService } from './faq.service'

import { StoreModule } from '@/modules/system/store/store.module'

@Module({
  imports: [TypeOrmModule.forFeature([FaqEntity]), StoreModule],
  controllers: [FaqController],
  providers: [FaqService, FaqRepository],
  exports: [FaqService, FaqRepository],
})
export class FaqModule {}

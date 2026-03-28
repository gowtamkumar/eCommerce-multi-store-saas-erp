import { Module } from '@nestjs/common'
import { FaqController } from './faq.controller'
import { FaqRepository } from './faq.repository'
import { FaqService } from './faq.service'

@Module({
  imports: [],
  controllers: [FaqController],
  providers: [FaqService, FaqRepository],
  exports: [FaqService, FaqRepository],
})
export class FaqModule {}

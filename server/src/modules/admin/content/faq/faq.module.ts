import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FaqController } from './faq.controller'
import { FaqService } from './faq.service'
import { FaqEntity } from './entities/faq.entity'
import { FaqRepository } from './faq.repository'

@Module({
  imports: [TypeOrmModule.forFeature([FaqEntity])],
  controllers: [FaqController],
  providers: [FaqService, FaqRepository],
  exports: [FaqService, FaqRepository],
})
export class FaqModule {}

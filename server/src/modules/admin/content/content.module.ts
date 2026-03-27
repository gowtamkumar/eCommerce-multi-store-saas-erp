import { Module } from '@nestjs/common'
import { FaqModule } from './faq/faq.module'
import { PageModule } from './page/page.module'

@Module({
  imports: [FaqModule, PageModule],
  exports: [FaqModule, PageModule],
})
export class ContentModule {}

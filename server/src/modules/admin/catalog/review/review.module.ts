import { Module } from '@nestjs/common'
import { ReviewController } from './controllers/review.controller'
import { ReviewService } from './services/review.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TenantModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}

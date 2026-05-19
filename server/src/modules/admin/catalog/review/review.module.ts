import { Module } from '@nestjs/common'
import { ReviewController } from './controllers/review.controller'
import { ReviewService } from './services/review.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [TenantModule, NotificationModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}

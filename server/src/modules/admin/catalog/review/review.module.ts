import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReviewEntity } from './entities/review.entity'
import { ReviewRepository } from './repositories/review.repository'
import { ReviewController } from './controllers/review.controller'
import { ReviewService } from './services/review.service'

import { StoreModule } from '@/modules/system/store/store.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Module({
  imports: [TypeOrmModule.forFeature([ReviewEntity]), StoreModule, NotificationModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}

import { Module } from '@nestjs/common'
import { ReviewController } from './review.controller'
import { ReviewRepository } from './review.repository'
import { ReviewService } from './review.service'

@Module({
  imports: [],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReviewEntity } from './entities/review.entity'
import { ReviewController } from './review.controller'
import { ReviewService } from './review.service'
import { ReviewRepository } from './review.repository'

@Module({
  imports: [],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
  exports: [ReviewService, ReviewRepository],
})
export class ReviewModule {}

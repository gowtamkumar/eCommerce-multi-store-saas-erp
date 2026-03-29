import { Expose } from 'class-transformer'
import { IsDate } from 'class-validator'
import { ReviewStatus } from '@/common/enums/review-status.enum'

export class ReviewResponseDto {
  @Expose()
  id: string

  @Expose()
  productId: string

  @Expose()
  customerName: string

  @Expose()
  customerEmail: string

  @Expose()
  rating: number

  @Expose()
  comment: string

  @Expose()
  status: ReviewStatus

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

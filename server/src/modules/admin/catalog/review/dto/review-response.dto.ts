import { ReviewStatus } from '@/common/enums/review-status.enum'
import { UserResponseDto } from '@/modules/admin/core/user/dtos/user-response.dto'
import { Expose } from 'class-transformer'
import { IsDate } from 'class-validator'

export class ReviewResponseDto {
  @Expose()
  id: string

  @Expose()
  productId: string

  @Expose()
  userId?: string | null

  @Expose()
  user?: UserResponseDto | null

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

import { Expose } from 'class-transformer'
import { IsDate } from 'class-validator'
import { FaqStatus } from '@/common/enums/faq-status.enum'

export class FaqResponseDto {
  @Expose()
  id: string

  @Expose()
  question: string

  @Expose()
  answer: string

  @Expose()
  category: string

  @Expose()
  order: number

  @Expose()
  status: FaqStatus

  @Expose()
  productId: string

  @Expose()
  pageId: string

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

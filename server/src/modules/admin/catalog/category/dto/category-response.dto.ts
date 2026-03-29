import { Expose } from 'class-transformer'
import { IsDate } from 'class-validator'

export class CategoryResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  slug: string

  @Expose()
  description?: string

  @Expose()
  image?: string

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

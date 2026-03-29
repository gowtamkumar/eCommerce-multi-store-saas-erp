import { Expose } from 'class-transformer'
import { IsDate } from 'class-validator'

export class BrandResponseDto {
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
  website?: string

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

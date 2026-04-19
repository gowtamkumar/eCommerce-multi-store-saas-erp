import { Expose } from 'class-transformer'

export class SubscriberResponseDto {
  @Expose()
  id: string

  @Expose()
  email: string

  @Expose()
  isActive: boolean

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

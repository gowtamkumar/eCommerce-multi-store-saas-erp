import { Expose } from 'class-transformer'

export class SubscriberResponseDto {
  @Expose()
  id: string

  @Expose()
  email: string

  @Expose()
  isActive: boolean

  @Expose()
  userId: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

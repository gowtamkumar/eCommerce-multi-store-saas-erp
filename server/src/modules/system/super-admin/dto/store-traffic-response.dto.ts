import { Expose } from 'class-transformer'

export class StoreTrafficResponseDto {
  @Expose()
  id: string

  @Expose()
  storeId: string

  @Expose()
  date: Date

  @Expose()
  requestCount: number

  @Expose()
  lastUpdated: Date

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

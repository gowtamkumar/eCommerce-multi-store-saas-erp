import { Expose } from 'class-transformer'

export class TenantTrafficResponseDto {
  @Expose()
  id: string

  @Expose()
  tenantId: string

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

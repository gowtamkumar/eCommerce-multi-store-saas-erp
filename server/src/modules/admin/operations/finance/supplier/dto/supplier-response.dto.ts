import { Expose } from 'class-transformer'

export class SupplierResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  contactName: string

  @Expose()
  email: string

  @Expose()
  phone: string

  @Expose()
  address: string

  @Expose()
  tenantId: string

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

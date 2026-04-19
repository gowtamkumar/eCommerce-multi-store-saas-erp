import { LeadStatus } from '@/common/enums/lead-status.enum'
import { Expose } from 'class-transformer'

export class LeadResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  email: string

  @Expose()
  phone: string

  @Expose()
  address: string

  @Expose()
  subject: string

  @Expose()
  message: string

  @Expose()
  status: LeadStatus

  @Expose()
  tenantId: string

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

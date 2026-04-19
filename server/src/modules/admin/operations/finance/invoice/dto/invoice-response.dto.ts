import { Expose } from 'class-transformer'
import { InvoiceStatus } from '@/common/enums/invoice-status.enum'

export class InvoiceResponseDto {
  @Expose()
  id: string

  @Expose()
  invoiceNumber: string

  @Expose()
  orderId: string

  @Expose()
  issueDate: Date

  @Expose()
  dueDate: Date

  @Expose()
  status: InvoiceStatus

  @Expose()
  tenantId: string

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

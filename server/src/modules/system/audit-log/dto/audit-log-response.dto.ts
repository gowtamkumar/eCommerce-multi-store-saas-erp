import { Expose } from 'class-transformer'

export class AuditLogResponseDto {
  @Expose()
  id: string

  @Expose()
  tenantId: string

  @Expose()
  userId?: string | null

  @Expose()
  action: string

  @Expose()
  entity: string

  @Expose()
  entityId: string | null

  @Expose()
  oldValue: Record<string, any> | null

  @Expose()
  newValue: Record<string, any> | null

  @Expose()
  ipAddress: string | null

  @Expose()
  userAgent: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

import { Type } from 'class-transformer'
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

export class QueryAuditLogDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20

  /** Filter by userId */
  @IsOptional()
  @IsUUID()
  userId?: string

  /** Filter by action (e.g. CREATE, UPDATE, DELETE, LOGIN) */
  @IsOptional()
  @IsString()
  action?: string

  /** Filter by entity name (e.g. Product, Order) */
  @IsOptional()
  @IsString()
  entity?: string

  /** Filter by entity ID */
  @IsOptional()
  @IsString()
  entityId?: string

  /** From date (ISO 8601) */
  @IsOptional()
  @IsDateString()
  from?: string

  /** To date (ISO 8601) */
  @IsOptional()
  @IsDateString()
  to?: string
}

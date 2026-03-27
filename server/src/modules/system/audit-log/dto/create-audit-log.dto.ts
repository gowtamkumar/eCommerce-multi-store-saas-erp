import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateAuditLogDto {
  @IsOptional()
  @IsUUID()
  userId?: string

  @IsNotEmpty()
  @IsString()
  action: string

  @IsNotEmpty()
  @IsString()
  entity: string

  @IsOptional()
  @IsString()
  entityId?: string

  @IsOptional()
  oldValue?: Record<string, any>

  @IsOptional()
  newValue?: Record<string, any>

  @IsOptional()
  @IsString()
  ipAddress?: string

  @IsOptional()
  @IsString()
  userAgent?: string
}

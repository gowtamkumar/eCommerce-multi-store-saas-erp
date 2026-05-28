import { Transform } from 'class-transformer'
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @Transform(({ value }) => value || null)
  @IsEmail()
  @IsOptional()
  email: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  image?: string

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus

  @IsUUID()
  @IsOptional()
  branchId?: string

  @IsUUID()
  @IsOptional()
  warehouseId?: string

  @IsString()
  @IsOptional()
  companyName?: string

  @IsString()
  @IsOptional()
  customerCode?: string

  @IsString()
  @IsOptional()
  taxId?: string

  @IsNumber()
  @IsOptional()
  creditLimit?: number

  @IsBoolean()
  @IsOptional()
  creditHold?: boolean

  @IsString()
  @IsOptional()
  priceBookCode?: string | null
}

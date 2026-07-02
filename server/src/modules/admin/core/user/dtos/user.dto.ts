import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'

export class UserDto {
  @IsString()
  id: string
  @IsString()
  name: string
  @IsString()
  email: string
  @IsString()
  username: string
  @IsString()
  phone?: string
  @IsString()
  address?: string
  @IsString()
  image?: string
  @IsBoolean()
  isAdmin: boolean
  @IsBoolean()
  isEmailVerified: boolean
  @IsEnum(UserRole)
  role: UserRole
  @IsEnum(UserStatus)
  status: UserStatus
  @IsString()
  storeId: string
  @IsDate()
  createdAt: Date
  @IsDate()
  updatedAt: Date

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

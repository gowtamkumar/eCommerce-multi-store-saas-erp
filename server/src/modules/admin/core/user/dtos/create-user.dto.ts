import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator'
import { UserRole } from '@/common/enums/user/user-role.enum'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  name: string

  @Transform(({ value }) => value || null)
  @IsEmail()
  @IsOptional()
  email: string

  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  @IsDefined()
  username: string

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @IsDefined()
  password: string

  @IsNotEmpty()
  role: UserRole

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isAdmin?: boolean

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  emailVerificationToken: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  address?: string

  @IsString()
  @IsOptional()
  image?: string

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

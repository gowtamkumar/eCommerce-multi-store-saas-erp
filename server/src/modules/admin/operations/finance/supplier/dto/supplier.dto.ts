import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
  IsUUID,
} from 'class-validator'

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  contactName?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  address?: string

  @IsUUID()
  @IsOptional()
  categoryId?: string

  @IsUUID()
  @IsOptional()
  category?: string

  @IsNumber()
  @IsOptional()
  rating?: number

  @IsInt()
  @IsOptional()
  leadTimeDays?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  contactPerson?: string

  @IsString()
  @IsOptional()
  taxId?: string
}

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  contactName?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsString()
  @IsOptional()
  address?: string

  @IsUUID()
  @IsOptional()
  categoryId?: string

  @IsUUID()
  @IsOptional()
  category?: string

  @IsNumber()
  @IsOptional()
  rating?: number

  @IsInt()
  @IsOptional()
  leadTimeDays?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  contactPerson?: string

  @IsString()
  @IsOptional()
  taxId?: string
}

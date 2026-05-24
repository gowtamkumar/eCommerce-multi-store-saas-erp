import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
} from 'class-validator'
import { SupplierCategory } from '../enums/supplier-category.enum'

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

  @IsEnum(SupplierCategory)
  @IsOptional()
  category?: SupplierCategory

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

  @IsEnum(SupplierCategory)
  @IsOptional()
  category?: SupplierCategory

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

import { IsDefined, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateTenantDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  storeName: string

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  subdomain: string

  @IsString()
  @IsOptional()
  planId?: string

  // Admin user details for the new tenant
  @IsString()
  @IsNotEmpty()
  adminName: string

  @IsString()
  @IsNotEmpty()
  adminUsername: string

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string

  @IsString()
  @MinLength(6)
  adminPassword: string
}

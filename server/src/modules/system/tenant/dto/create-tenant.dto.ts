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
  name: string

  @IsString()
  @IsNotEmpty()
  username: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @MinLength(6)
  password: string
}

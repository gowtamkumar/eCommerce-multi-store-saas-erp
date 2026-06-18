import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  slug: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  metaTitle?: string

  @IsString()
  @IsOptional()
  metaDescription?: string

  @IsString()
  @IsOptional()
  image?: string

  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string
}

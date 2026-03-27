import { IsOptional, IsString } from 'class-validator'

export class SocialLinkDto {
  @IsString()
  @IsOptional()
  facebook?: string

  @IsString()
  @IsOptional()
  twitter?: string

  @IsString()
  @IsOptional()
  instagram?: string

  @IsString()
  @IsOptional()
  linkedin?: string
}

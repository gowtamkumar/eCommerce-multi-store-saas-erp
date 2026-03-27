import { IsOptional, IsString } from 'class-validator'

export class SteadfastCourierDto {
  @IsString()
  @IsOptional()
  apiKey?: string

  @IsString()
  @IsOptional()
  secretKey?: string
}

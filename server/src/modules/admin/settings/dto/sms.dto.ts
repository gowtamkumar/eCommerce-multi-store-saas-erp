import { IsOptional, IsString } from 'class-validator'

export class SmsDto {
  @IsString()
  @IsOptional()
  apiKey?: string

  @IsString()
  @IsOptional()
  senderId?: string
}

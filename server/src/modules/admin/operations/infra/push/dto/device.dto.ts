import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class RegisterDeviceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string

  @ApiProperty({ required: false, default: 'web' })
  @IsOptional()
  @IsString()
  platform?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userAgent?: string
}

export class UnregisterDeviceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string
}

import { IsString, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class StoreLookupDto {
  @ApiProperty({
    example: 'mystore',
    description: 'Subdomain to lookup',
    required: false,
  })
  @IsString()
  @IsOptional()
  subdomain?: string

  @ApiProperty({
    example: 'mystore.example.com',
    description: 'Custom domain to lookup',
    required: false,
  })
  @IsString()
  @IsOptional()
  customDomain?: string
}

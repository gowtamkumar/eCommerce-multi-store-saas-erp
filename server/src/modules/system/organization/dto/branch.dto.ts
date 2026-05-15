import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateBranchDto {
  @ApiProperty({ example: 'Main Street Branch' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'MSB-001' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ example: '123 Main St, City', required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string

  @ApiProperty({ example: 'branch@example.com', required: false })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}

import { WarehouseType } from '@/common/enums/warehouse-type.enum'
import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Central Warehouse' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'WH-001' })
  @IsString()
  @IsNotEmpty()
  code: string

  @ApiProperty({ enum: WarehouseType, default: WarehouseType.CENTRAL })
  @IsEnum(WarehouseType)
  @IsOptional()
  locationType?: WarehouseType

  @ApiProperty({ example: '456 Warehouse Ave, Industrial Zone', required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ example: 'uuid-of-branch', required: false })
  @IsUUID()
  @IsOptional()
  branchId?: string

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}

export class CreateWarehouseBinDto {
  @ApiProperty({ example: 'Zone-A' })
  @IsString()
  @IsNotEmpty()
  zone: string

  @ApiProperty({ example: 'A-01-05' })
  @IsString()
  @IsNotEmpty()
  binCode: string

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class UpdateWarehouseBinDto extends PartialType(CreateWarehouseBinDto) {}

import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'

export class CreateInventoryTransactionDto {
  @IsUUID()
  productId: string

  @IsEnum(InventoryTransactionType)
  type: InventoryTransactionType

  @IsNumber()
  quantity: number

  @IsNumber()
  @IsOptional()
  unitCost?: number

  @IsEnum(InventoryTransactionReferenceType)
  referenceType: InventoryTransactionReferenceType

  @IsString()
  @IsOptional()
  referenceId?: string

  @IsUUID()
  @IsOptional()
  variantId?: string

  @IsUUID()
  @IsOptional()
  supplierId?: string

  @IsUUID()
  @IsOptional()
  branchId?: string

  @IsUUID()
  @IsOptional()
  warehouseId?: string

  @IsUUID()
  @IsOptional()
  binId?: string

  @IsUUID()
  @IsOptional()
  batchId?: string

  @IsString()
  @IsOptional()
  remarks?: string
}

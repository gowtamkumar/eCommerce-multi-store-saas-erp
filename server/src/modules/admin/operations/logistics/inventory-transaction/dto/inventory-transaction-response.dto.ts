import { Expose } from 'class-transformer'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'

export class InventoryTransactionResponseDto {
  @Expose()
  id: string

  @Expose()
  productId: string

  @Expose()
  variantId: string

  @Expose()
  supplierId: string

  @Expose()
  type: InventoryTransactionType

  @Expose()
  quantity: number

  @Expose()
  referenceType: InventoryTransactionReferenceType

  @Expose()
  referenceId: string

  @Expose()
  tenantId: string

  @Expose()
  userId: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

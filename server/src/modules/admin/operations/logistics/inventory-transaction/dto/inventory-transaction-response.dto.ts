import { Expose } from 'class-transformer'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'

export class InventoryLedgerResponseDto {
  @Expose()
  id: string

  @Expose()
  productId: string

  @Expose()
  variantId: string

  @Expose()
  branchId: string

  @Expose()
  warehouseId: string

  @Expose()
  binId: string

  @Expose()
  supplierId: string

  @Expose()
  type: InventoryTransactionType

  @Expose()
  quantity: number

  @Expose()
  balanceAfter: number

  @Expose()
  referenceType: InventoryTransactionReferenceType

  @Expose()
  referenceId: string

  @Expose()
  storeId: string

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

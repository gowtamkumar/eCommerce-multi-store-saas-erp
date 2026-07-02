import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { PurchaseOrderService } from '@/modules/admin/operations/finance/purchase/services/purchase-order.service'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { Logger } from '@nestjs/common'

@Processor('product')
export class ProductProcessor extends WorkerHost {
  private readonly logger = new Logger(ProductProcessor.name)

  constructor(
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly inventoryService: InventoryLedgerService,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
    try {
      switch (job.name) {
        case 'create-purchase-order':
          return await this.handleCreatePO(job.data)
        case 'update-stock':
          return await this.handleUpdateStock(job.data)
        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
  }

  async handleCreatePO(data: any) {
    const { storeId, ...rest } = data
    this.logger.log(`Creating Purchase Order for store ${storeId}`)

    const po = await this.purchaseOrderService.createPurchaseOrder(rest, storeId)

    await this.purchaseOrderService.updatePurchaseOrderStatus(
      po.id,
      { status: PurchaseOrderStatus.RECEIVED },
      storeId,
    )

    this.logger.log(`PO ${po.id} Created and Received Successfully`)
  }

  async handleUpdateStock(data: any) {
    const {
      productId,
      variantId,
      quantity,
      type,
      referenceType,
      referenceId,
      supplierId,
      storeId,
      unitCost,
      warehouseId,
      branchId,
    } = data
    this.logger.log(
      `Updating stock for product ${productId} (variant: ${variantId || 'none'}) for store ${storeId}`,
    )

    await this.inventoryService.createLedgerEntry(
      {
        productId,
        variantId,
        quantity,
        type,
        referenceType: referenceType || InventoryTransactionReferenceType.ORDER,
        referenceId,
        supplierId,
        unitCost,
        warehouseId,
        branchId,
      },
      { storeId } as any,
    )

    this.logger.log(`Stock Updated Successfully for product ${productId}`)
  }
}

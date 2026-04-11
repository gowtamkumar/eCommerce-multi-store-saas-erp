import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PurchaseOrderService } from '@/modules/admin/operations/finance/purchase/purchase-order.service';
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service';
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum';
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum';
import { Logger } from '@nestjs/common';

@Processor('product')
export class ProductProcessor extends WorkerHost {
    private readonly logger = new Logger(ProductProcessor.name);

    constructor(
        private readonly purchaseOrderService: PurchaseOrderService,
        private readonly inventoryService: InventoryTransactionService,
    ) {
        super();
    }

    async process(job: Job) {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);
        try {
            switch (job.name) {
                case 'create-purchase-order':
                    return await this.handleCreatePO(job.data);
                case 'update-stock':
                    return await this.handleUpdateStock(job.data);
                default:
                    this.logger.warn(`Unknown job name: ${job.name}`);
            }
        } catch (error) {
            this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack);
            throw error;
        }
    }

    async handleCreatePO(data: any) {
        const { tenantId, ...rest } = data;
        this.logger.log(`Creating Purchase Order for tenant ${tenantId}`);

        const po = await this.purchaseOrderService.createPurchaseOrder(
            rest,
            tenantId,
        )

        await this.purchaseOrderService.updatePurchaseOrderStatus(
            po.id,
            { status: PurchaseOrderStatus.RECEIVED },
            tenantId,
        )

        this.logger.log(`PO ${po.id} Created and Received Successfully`);
    }

    async handleUpdateStock(data: any) {
        const { productId, variantId, quantity, type, referenceType, referenceId, supplierId, tenantId } = data;
        this.logger.log(`Updating stock for product ${productId} (variant: ${variantId || 'none'}) for tenant ${tenantId}`);

        await this.inventoryService.createInventoryTransaction({
            productId,
            variantId,
            quantity,
            type,
            referenceType: referenceType || InventoryTransactionReferenceType.ORDER,
            referenceId,
            supplierId
        }, tenantId);

        this.logger.log(`Stock Updated Successfully for product ${productId}`);
    }
}
import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ProductProcessor } from '@/modules/admin/catalog/product/queue/product.processor';
import { ProductQueue } from '@/modules/admin/catalog/product/queue/product.queue';
import { PurchaseModule } from '@/modules/admin/operations/finance/purchase/purchase.module';
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module';

@Global()
@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT) || 6379,
            },
        }),
        BullModule.registerQueue({
            name: 'product',
        }),
        PurchaseModule,
        InventoryTransactionModule,
    ],
    providers: [ProductQueue, ProductProcessor],
    exports: [ProductQueue],
})
export class QueueModule { }
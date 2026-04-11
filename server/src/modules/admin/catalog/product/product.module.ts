import { PurchaseModule } from '@/modules/admin/operations/finance/purchase/purchase.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { Module } from '@nestjs/common'
import { ReviewModule } from '../review/review.module'
import { ProductController } from './controllers/product.controller'
import { ProductService } from './services/product.service'
import { BullModule } from '@nestjs/bullmq'
import { QueueModule } from '@/modules/admin/operations/infra/queue/queue.module'
import { ProductProcessor } from './queue/product.processor'
import { ProductQueue } from './queue/product.queue'

@Module({
  imports: [
    QueueModule, // 👈 for queue
    BullModule.registerQueue({ name: 'product' }), // 👈 register queue
    ReviewModule, CacheModule, InventoryTransactionModule, PurchaseModule, PromotionModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductProcessor,
    ProductQueue
  ],
  exports: [
    ProductService,
  ],
})
export class ProductModule { }

import { PurchaseModule } from '@/modules/admin/operations/finance/purchase/purchase.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { Module } from '@nestjs/common'
import { ReviewModule } from '../review/review.module'
import { ProductController } from './controllers/product.controller'
import { ProductService } from './services/product.service'
import { BullModule } from '@nestjs/bullmq'
import { ProductProcessor } from './queue/product.processor'

@Module({
  imports: [
    BullModule.registerQueue({ name: 'product' }), // 👈 register queue
    ReviewModule, CacheModule, InventoryTransactionModule, PurchaseModule, PromotionModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductProcessor,
  ],
  exports: [
    ProductService,
  ],
})
export class ProductModule { }

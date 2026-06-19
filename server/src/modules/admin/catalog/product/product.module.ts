import { PurchaseModule } from '@/modules/admin/operations/finance/purchase/purchase.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { InventoryLedgerModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductEntity } from './entities/product.entity'
import { ProductVariantEntity } from './entities/variant.entity'
import { ProductAttributeEntity } from './entities/attribute.entity'
import { ProductRepository } from './repositories/product.repository'
import { ProductVariantRepository } from './repositories/variant.repository'
import { ProductAttributeRepository } from './repositories/attribute.repository'
import { ReviewModule } from '../review/review.module'
import { ProductController } from './controllers/product.controller'
import { ProductService } from './services/product.service'
import { BullModule } from '@nestjs/bullmq'
import { ProductProcessor } from './queue/product.processor'
import { AddonCatalogModule } from '@/modules/system/addon-catalog/addon-catalog.module'
import { SuperAdminCrossTenantRepository } from '@/modules/system/super-admin/repositories/super-admin-cross-tenant.repository'
import { FaqModule } from '@/modules/admin/content/faq/faq.module'
import { BrandModule } from '../brand/brand.module'
import { AiModule } from '@/modules/admin/ai/ai.module'
import { RbacModule } from '@/modules/admin/core/rbac/rbac.module'
import { ProductEmbeddingEntity } from './entities/product-embedding.entity'
import { ProductEmbeddingService } from './services/product-embedding.service'
import { ProductQaService } from './services/product-qa.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      ProductVariantEntity,
      ProductAttributeEntity,
      ProductEmbeddingEntity,
    ]),
    BullModule.registerQueue({ name: 'product' }),
    ReviewModule,
    CacheModule,
    InventoryLedgerModule,
    PurchaseModule,
    PromotionModule,
    TenantModule,
    AddonCatalogModule,
    FaqModule,
    BrandModule,
    AiModule,
    RbacModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductProcessor,
    ProductRepository,
    ProductVariantRepository,
    ProductAttributeRepository,
    SuperAdminCrossTenantRepository,
    ProductEmbeddingService,
    ProductQaService,
  ],
  exports: [
    ProductService,
    ProductRepository,
    ProductVariantRepository,
    ProductAttributeRepository,
    ProductEmbeddingService,
    ProductQaService,
  ],
})
export class ProductModule {}

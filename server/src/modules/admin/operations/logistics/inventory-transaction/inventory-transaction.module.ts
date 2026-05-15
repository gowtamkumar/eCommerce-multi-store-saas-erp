import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { InventoryLedgerController } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.controller'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { CategoryEntity } from '@/modules/admin/catalog/category/entities/category.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { InventoryLedgerRepository } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/repositories/variant.repository'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { AccountingModule } from '@/modules/admin/operations/finance/accounting/accounting.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryLedgerEntity,
      ProductEntity,
      ProductVariantEntity,
      CategoryEntity,
      SupplierEntity,
    ]),
    TenantModule,
    AccountingModule,
    CacheModule,
  ],
  controllers: [InventoryLedgerController],
  providers: [
    InventoryLedgerService,
    InventoryLedgerRepository,
    ProductRepository,
    ProductVariantRepository,
  ],
  exports: [InventoryLedgerService, InventoryLedgerRepository],
})
export class InventoryLedgerModule {}

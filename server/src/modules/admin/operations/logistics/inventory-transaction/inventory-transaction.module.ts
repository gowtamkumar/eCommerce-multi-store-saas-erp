import { Module, Global } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'
import { StockReservationEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-reservation.entity'
import { StockTransferEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-transfer.entity'
import { StockTransferItemEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-transfer-item.entity'
import { ProductBatchEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/product-batch.entity'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { InventoryLedgerController } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.controller'
import { StockReservationService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-reservation.service'
import { StockReservationController } from '@/modules/admin/operations/logistics/inventory-transaction/stock-reservation.controller'
import { StockTransferService } from '@/modules/admin/operations/logistics/inventory-transaction/stock-transfer.service'
import { StockTransferController } from '@/modules/admin/operations/logistics/inventory-transaction/stock-transfer.controller'
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
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { BullModule } from '@nestjs/bullmq'
import { StockReservationSchedulerService } from './stock-reservation-scheduler.service'

import { ProductBatchService } from './product-batch.service'
import { ProductBatchController } from './product-batch.controller'
import { InventoryProcessor } from './inventory.processor'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryLedgerEntity,
      StockReservationEntity,
      StockTransferEntity,
      StockTransferItemEntity,
      ProductBatchEntity,
      ProductEntity,
      ProductVariantEntity,
      CategoryEntity,
      SupplierEntity,
    ]),
    TenantModule,
    AccountingModule,
    CacheModule,
    NotificationModule,
    BullModule.registerQueue({
      name: 'inventory',
    }),
  ],
  controllers: [
    InventoryLedgerController,
    StockReservationController,
    StockTransferController,
    ProductBatchController,
  ],
  providers: [
    InventoryLedgerService,
    InventoryLedgerRepository,
    ProductRepository,
    ProductVariantRepository,
    StockReservationService,
    StockReservationSchedulerService,
    StockTransferService,
    ProductBatchService,
    InventoryProcessor,
  ],
  exports: [
    InventoryLedgerService,
    InventoryLedgerRepository,
    StockReservationService,
    StockTransferService,
    ProductBatchService,
  ],
})
export class InventoryLedgerModule {}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InventoryTransactionEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-transaction.entity'
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service'
import { InventoryTransactionController } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.controller'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { CategoryEntity } from '@/modules/admin/catalog/category/entities/category.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { InventoryTransactionRepository } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.repository'

@Module({
  imports: [],
  controllers: [InventoryTransactionController],
  providers: [InventoryTransactionService, InventoryTransactionRepository],
  exports: [InventoryTransactionService, InventoryTransactionRepository],
})
export class InventoryTransactionModule {}

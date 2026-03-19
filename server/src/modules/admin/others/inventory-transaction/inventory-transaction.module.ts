import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransactionEntity } from '@/modules/admin/others/inventory-transaction/entities/inventory-transaction.entity';
import { InventoryTransactionService } from '@/modules/admin/others/inventory-transaction/inventory-transaction.service';
import { InventoryTransactionController } from '@/modules/admin/others/inventory-transaction/inventory-transaction.controller';
import { ProductEntity } from '@/modules/admin/product/entities/product.entity';
import { ProductVariantEntity } from '@/modules/admin/product/entities/variant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([InventoryTransactionEntity, ProductEntity, ProductVariantEntity])],
    controllers: [InventoryTransactionController],
    providers: [InventoryTransactionService],
    exports: [InventoryTransactionService],
})
export class InventoryTransactionModule { }

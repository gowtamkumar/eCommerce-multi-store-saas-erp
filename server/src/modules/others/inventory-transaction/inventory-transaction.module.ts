import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity';
import { InventoryTransactionService } from './inventory-transaction.service';
import { InventoryTransactionController } from './inventory-transaction.controller';
import { ProductEntity } from '../../product/entities/product.entity';
import { ProductVariantEntity } from '../../product/entities/variant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([InventoryTransactionEntity, ProductEntity, ProductVariantEntity])],
    controllers: [InventoryTransactionController],
    providers: [InventoryTransactionService],
    exports: [InventoryTransactionService],
})
export class InventoryTransactionModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity';
import { InventoryTransactionService } from './inventory-transaction.service';
import { InventoryTransactionController } from './inventory-transaction.controller';
import { ProductEntity } from '../../product/entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([InventoryTransactionEntity, ProductEntity])],
    controllers: [InventoryTransactionController],
    providers: [InventoryTransactionService],
    exports: [InventoryTransactionService],
})
export class InventoryTransactionModule { }

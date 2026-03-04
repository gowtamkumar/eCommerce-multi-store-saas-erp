import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { InventoryTransactionModule } from '../inventory-transaction/inventory-transaction.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PurchaseOrderEntity, PurchaseOrderItemEntity]),
        InventoryTransactionModule,
    ],
    controllers: [PurchaseOrderController],
    providers: [PurchaseOrderService],
    exports: [PurchaseOrderService],
})
export class PurchaseModule { }

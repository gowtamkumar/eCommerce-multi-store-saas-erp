import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SupplierEntity } from './entities/supplier.entity'
import { PurchaseOrderEntity } from './entities/purchase-order.entity'
import { GoodsReceivedNoteEntity } from './entities/goods-received-note.entity'
import { ProcurementService } from './procurement.service'
import { ProcurementController } from './procurement.controller'
import { ProcurementRepository } from './procurement.repository'
import { AccountingModule } from '@/modules/admin/operations/finance/accounting/accounting.module'
import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'

@Module({
  imports: [
    AccountingModule,
    AuditLogModule,
    TypeOrmModule.forFeature([
      SupplierEntity,
      PurchaseOrderEntity,
      GoodsReceivedNoteEntity,
    ]),
  ],
  controllers: [ProcurementController],
  providers: [ProcurementService, ProcurementRepository],
  exports: [ProcurementService],
})
export class ProcurementModule { }

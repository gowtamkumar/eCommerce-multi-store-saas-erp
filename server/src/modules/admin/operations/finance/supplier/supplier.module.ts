import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SupplierEntity } from './entities/supplier.entity'
import { SupplierPortalController } from './supplier-portal.controller'
import { SupplierController } from './supplier.controller'
import { SupplierRepository } from './supplier.repository'
import { SupplierService } from './supplier.service'

import { StoreModule } from '@/modules/system/store/store.module'
import { PurchaseModule } from '../purchase/purchase.module'
import { SupplierDocumentEntity } from './entities/supplier-document.entity'
import { SupplierAPLedgerEntity } from './entities/supplier-ap-ledger.entity'
import { SupplierAPLedgerRepository } from './supplier-ap-ledger.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierEntity, SupplierDocumentEntity, SupplierAPLedgerEntity]),
    StoreModule,
    PurchaseModule,
  ],
  controllers: [SupplierController, SupplierPortalController],
  providers: [SupplierService, SupplierRepository, SupplierAPLedgerRepository],
  exports: [SupplierService, SupplierRepository, SupplierAPLedgerRepository],
})
export class SupplierModule {}

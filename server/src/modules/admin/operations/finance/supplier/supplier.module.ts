import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SupplierEntity } from './entities/supplier.entity'
import { SupplierAPLedgerEntity } from './entities/supplier-ap-ledger.entity'
import { SupplierService } from './supplier.service'
import { SupplierController } from './supplier.controller'
import { SupplierRepository } from './supplier.repository'
import { SupplierAPLedgerRepository } from './supplier-ap-ledger.repository'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierEntity, SupplierAPLedgerEntity]),
    TenantModule,
  ],
  controllers: [SupplierController],
  providers: [SupplierService, SupplierRepository, SupplierAPLedgerRepository],
  exports: [SupplierService, SupplierRepository, SupplierAPLedgerRepository],
})
export class SupplierModule { }


import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SupplierEntity } from './entities/supplier.entity'
import { SupplierService } from './supplier.service'
import { SupplierController } from './supplier.controller'
import { SupplierRepository } from './supplier.repository'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TenantModule],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}

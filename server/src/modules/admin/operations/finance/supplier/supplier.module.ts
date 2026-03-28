import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SupplierEntity } from './entities/supplier.entity'
import { SupplierService } from './supplier.service'
import { SupplierController } from './supplier.controller'
import { SupplierRepository } from './supplier.repository'

@Module({
  imports: [],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}

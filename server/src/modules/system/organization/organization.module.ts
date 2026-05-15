import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BranchController } from './controllers/branch.controller'
import { WarehouseController } from './controllers/warehouse.controller'
import { BranchEntity } from './entities/branch.entity'
import { WarehouseBinEntity } from './entities/warehouse-bin.entity'
import { WarehouseEntity } from './entities/warehouse.entity'
import { BranchRepository } from './repositories/branch.repository'
import { WarehouseBinRepository } from './repositories/warehouse-bin.repository'
import { WarehouseRepository } from './repositories/warehouse.repository'
import { BranchService } from './services/branch.service'
import { WarehouseService } from './services/warehouse.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([BranchEntity, WarehouseEntity, WarehouseBinEntity]),
  ],
  controllers: [BranchController, WarehouseController],
  providers: [
    BranchService,
    WarehouseService,
    BranchRepository,
    WarehouseRepository,
    WarehouseBinRepository,
  ],
  exports: [BranchService, WarehouseService],
})
export class OrganizationModule {}

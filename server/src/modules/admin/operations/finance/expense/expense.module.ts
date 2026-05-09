import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { ExpenseController } from './expense.controller'
import { ExpenseEntity } from './entities/expense.entity'
import { ExpenseRepository } from './expense.repository'
import { ExpenseService } from './expense.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseEntity]), CacheModule, TenantModule],
  controllers: [ExpenseController],
  providers: [ExpenseService, ExpenseRepository],
  exports: [ExpenseService],
})
export class ExpenseModule {}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { ExpenseController } from './expense.controller'
import { ExpenseEntity } from './entities/expense.entity'
import { ExpenseRepository } from './expense.repository'
import { ExpenseService } from './expense.service'

import { StoreModule } from '@/modules/system/store/store.module'
import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseEntity]),
    CacheModule,
    StoreModule,
    NotificationModule,
    SettingsModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, ExpenseRepository],
  exports: [ExpenseService, ExpenseRepository],
})
export class ExpenseModule {}

import { Module } from '@nestjs/common'
import { CacheModule } from './cache/cache.module'
import { PathaoModule } from './courier/pathao/pathao.module'
import { SteadfastModule } from './courier/steadfast/steadfast.module'
import { InventoryTransactionModule } from './inventory-transaction/inventory-transaction.module'
import { MailModule } from './mail/mail.module'
import { FileModule } from './media/file.module'
import { ReportModule } from './report/report.module'

@Module({
  imports: [
    FileModule,
    MailModule,
    PathaoModule,
    SteadfastModule,
    CacheModule,
    ReportModule,
    InventoryTransactionModule,
  ],
  exports: [InventoryTransactionModule],
})
export class OthersModule { }

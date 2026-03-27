import { Module } from '@nestjs/common'
import { FinanceModule } from './finance/finance.module'
import { LogisticsModule } from './logistics/logistics.module'
import { InfraModule } from './infra/infra.module'

@Module({
  imports: [FinanceModule, LogisticsModule, InfraModule],
  exports: [FinanceModule, LogisticsModule, InfraModule],
})
export class OperationsModule {}

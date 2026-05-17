import { Module } from '@nestjs/common'
import { FinanceModule } from './finance/finance.module'
import { LogisticsModule } from './logistics/logistics.module'
import { InfraModule } from './infra/infra.module'
import { HrmModule } from './hrm/hrm.module'


@Module({
  imports: [FinanceModule, LogisticsModule, InfraModule, HrmModule],
  exports: [FinanceModule, LogisticsModule, InfraModule, HrmModule],
})
export class OperationsModule {}

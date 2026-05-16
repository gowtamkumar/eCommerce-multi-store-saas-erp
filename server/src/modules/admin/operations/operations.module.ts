import { Module } from '@nestjs/common'
import { FinanceModule } from './finance/finance.module'
import { LogisticsModule } from './logistics/logistics.module'
import { InfraModule } from './infra/infra.module'
import { HrmModule } from './hrm/hrm.module'
import { ProcurementModule } from './procurement/procurement.module'

@Module({
  imports: [FinanceModule, LogisticsModule, InfraModule, HrmModule, ProcurementModule],
  exports: [FinanceModule, LogisticsModule, InfraModule, HrmModule, ProcurementModule],
})
export class OperationsModule {}

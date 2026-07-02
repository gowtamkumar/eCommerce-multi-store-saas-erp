import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index } from 'typeorm'

export enum FiscalPeriodStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('fiscal_periods')
@Index(['storeId', 'status'])
export class FiscalPeriodEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ type: 'timestamp' })
  startDate: Date

  @Column({ type: 'timestamp' })
  endDate: Date

  @Column({
    type: 'enum',
    enum: FiscalPeriodStatus,
    default: FiscalPeriodStatus.OPEN,
  })
  status: FiscalPeriodStatus

  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string
}

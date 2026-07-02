import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'

/**
 * Per-store monotonically increasing sequence used to mint human-readable
 * employee codes such as `EMP-000123`. The repository uses an atomic UPDATE
 * with `RETURNING` to avoid the random-collision behaviour of the previous
 * `EMP-${1000-9999}` generator.
 */
@Entity('hrm_employee_id_sequences')
@Unique(['storeId'])
export class EmployeeIdSequenceEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'varchar', default: 'EMP-' })
  prefix: string

  @Column({ type: 'int', name: 'pad_length', default: 6 })
  padLength: number

  @Column({ type: 'bigint', name: 'last_value', default: 0 })
  lastValue: number
}

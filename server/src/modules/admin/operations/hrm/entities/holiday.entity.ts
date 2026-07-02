import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, BeforeInsert, BeforeUpdate, Index } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'

@Entity('holidays')
@Index(['storeId', 'year'])
@Index(['storeId', 'date'])
export class HolidayEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  /**
   * Optional branch scope. NULL means the holiday applies to all branches
   * within the store.
   */
  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string | null

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity | null

  @Column({ type: 'date' })
  date: Date

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'int' })
  year: number

  @Column({ type: 'boolean', name: 'is_optional', default: false })
  isOptional: boolean

  @Column({ type: 'text', nullable: true })
  description: string

  @BeforeInsert()
  @BeforeUpdate()
  setYear() {
    if (this.date) {
      this.year = new Date(this.date).getFullYear()
    }
  }
}

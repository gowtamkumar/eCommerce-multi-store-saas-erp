import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('hrm_tax_brackets')
@Index(['storeId', 'fiscalYear'])
export class TaxBracketEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'int', name: 'fiscal_year' })
  fiscalYear: number

  @Column({ type: 'decimal', name: 'min_amount', precision: 14, scale: 2 })
  minAmount: number

  @Column({ type: 'decimal', name: 'max_amount', precision: 14, scale: 2, nullable: true })
  maxAmount: number | null

  @Column({ type: 'decimal', precision: 6, scale: 4 })
  rate: number

  @Column({ type: 'decimal', name: 'flat_tax', precision: 14, scale: 2, default: 0 })
  flatTax: number

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number
}

import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { PriceBookType } from '../enums/price-book-type.enum'
import { ProductPriceEntity } from './product-price.entity'

@Entity('price_books')
@Unique('UQ_price_books_code_store', ['code', 'storeId'])
export class PriceBookEntity extends BaseEntity {
  @Column()
  name: string

  @Column()
  code: string

  @Column({
    type: 'enum',
    enum: PriceBookType,
    default: PriceBookType.RETAIL,
  })
  type: PriceBookType

  @Column({ type: 'varchar', length: 10, default: 'BDT' })
  currency: string

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'timestamptz', name: 'valid_from', nullable: true })
  validFrom: Date

  @Column({ type: 'timestamptz', name: 'valid_to', nullable: true })
  validTo: Date

  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @OneToMany(() => ProductPriceEntity, (price) => price.priceBook)
  prices: ProductPriceEntity[]
}

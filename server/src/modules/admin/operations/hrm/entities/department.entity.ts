import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('departments')
export class DepartmentEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

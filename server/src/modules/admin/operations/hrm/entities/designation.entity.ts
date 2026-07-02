import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { DepartmentEntity } from './department.entity'

@Entity('designations')
export class DesignationEntity extends BaseEntity {
  @Column({ nullable: true })
  name: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  salaryBand: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'uuid', name: 'department_id', nullable: true })
  departmentId: string

  @ManyToOne(() => DepartmentEntity)
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

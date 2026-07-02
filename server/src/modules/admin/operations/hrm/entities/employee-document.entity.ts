import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { EmployeeEntity } from './employee.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

@Entity('employee_documents')
export class EmployeeDocumentEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string

  @ManyToOne(() => EmployeeEntity, (employee) => employee.documents)
  @JoinColumn({ name: 'employee_id' })
  employee: EmployeeEntity

  @Column({ type: 'varchar', name: 'document_type' }) // e.g. "Passport", "Contract", "Certificate"
  documentType: string

  @Column({ type: 'text', name: 'file_url' })
  fileUrl: string

  @Column({ type: 'date', name: 'expiry_date', nullable: true })
  expiryDate: Date

  @Column({ type: 'uuid', name: 'verified_by_id', nullable: true })
  verifiedById: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

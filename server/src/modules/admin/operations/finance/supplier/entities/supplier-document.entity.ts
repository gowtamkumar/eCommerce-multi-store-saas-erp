import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { SupplierEntity } from './supplier.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('supplier_documents')
@Index(['tenantId', 'supplierId'])
export class SupplierDocumentEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'varchar', length: 500 })
  fileUrl: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  documentType: string // e.g., 'CONTRACT', 'TRADE_LICENSE', 'TAX_CERTIFICATE'

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  uploadedBy: UserEntity
}

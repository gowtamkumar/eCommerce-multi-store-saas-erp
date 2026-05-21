import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { SupplierInvoiceEntity } from './supplier-invoice.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'

@Entity('supplier_invoice_items')
export class SupplierInvoiceItemEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'supplier_invoice_id' })
  supplierInvoiceId: string

  @ManyToOne(() => SupplierInvoiceEntity, (inv) => inv.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_invoice_id' })
  supplierInvoice: SupplierInvoiceEntity

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}

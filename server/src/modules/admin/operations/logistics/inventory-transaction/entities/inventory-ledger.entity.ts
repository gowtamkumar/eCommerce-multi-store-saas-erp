import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { WarehouseBinEntity } from '@/modules/system/organization/entities/warehouse-bin.entity'

@Entity('inventory_ledger')
@Index(['tenantId', 'createdAt'])
@Index(['productId', 'warehouseId', 'createdAt'])
export class InventoryLedgerEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'product_id' })
  @Index()
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  @Index()
  variantId: string

  @ManyToOne(() => ProductVariantEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity

  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  @Index()
  branchId: string

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({ type: 'uuid', name: 'warehouse_id', nullable: true })
  @Index()
  warehouseId: string

  @ManyToOne(() => WarehouseEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity

  @Column({ type: 'uuid', name: 'bin_id', nullable: true })
  binId: string

  @ManyToOne(() => WarehouseBinEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bin_id' })
  bin: WarehouseBinEntity

  @Column({ type: 'uuid', name: 'supplier_id', nullable: true })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({
    type: 'enum',
    enum: InventoryTransactionType,
  })
  @Index()
  type: InventoryTransactionType

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'balance_after' })
  balanceAfter: number

  @Column({
    type: 'enum',
    enum: InventoryTransactionReferenceType,
    name: 'reference_type',
  })
  referenceType: InventoryTransactionReferenceType

  @Column({ type: 'varchar', length: 255, name: 'reference_id', nullable: true })
  referenceId: string

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'text', nullable: true })
  remarks: string
}

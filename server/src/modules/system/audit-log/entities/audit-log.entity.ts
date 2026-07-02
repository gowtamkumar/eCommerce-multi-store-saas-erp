import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity('audit_logs')
@Index(['storeId', 'createdAt'])
@Index(['storeId', 'entity', 'entityId'])
@Index(['storeId', 'actorId'])
@Index(['storeId', 'branchId'])
@Index(['storeId', 'warehouseId'])
export class AuditLogEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  /**
   * The user who performed the action.
   * Nullable for system-triggered events (e.g. plan downgrade, scheduled task).
   */
  @Column({ type: 'uuid', name: 'actor_id', nullable: true })
  actorId: string | null

  /** Denormalized name of the actor for fast display (avoids JOIN on audit log reads) */
  @Column({ type: 'varchar', length: 255, name: 'actor_name', nullable: true })
  actorName: string | null

  /** e.g. CREATE, UPDATE, DELETE, LOGIN, LOGOUT, PERMISSION_GRANT, PERMISSION_REVOKE */
  @Column({ type: 'varchar', length: 100 })
  action: string

  /** e.g. Product, Order, Category, Role, UserRoleAssignment, PermissionOverride */
  @Column({ type: 'varchar', length: 100 })
  entity: string

  @Column({ type: 'varchar', length: 255, name: 'entity_id', nullable: true })
  entityId: string

  @Column({ type: 'jsonb', name: 'old_value', nullable: true })
  oldValue: Record<string, any>

  @Column({ type: 'jsonb', name: 'new_value', nullable: true })
  newValue: Record<string, any>

  @Column({ type: 'uuid', name: 'branch_id', nullable: true })
  branchId: string | null

  @Column({ type: 'uuid', name: 'warehouse_id', nullable: true })
  warehouseId: string | null

  @Column({ type: 'varchar', length: 45, name: 'ip_address', nullable: true })
  ipAddress: string

  @Column({ type: 'text', name: 'user_agent', nullable: true })
  userAgent: string
}

import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Index } from 'typeorm'
import { FulfillmentStatus } from '../enums/fulfillment-status.enum'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { WarehouseEntity } from '@/modules/system/organization/entities/warehouse.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { FulfillmentItemEntity } from './fulfillment-item.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

@Entity('fulfillment_tasks')
@Index(['storeId', 'status'])
export class FulfillmentTaskEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity

  @Column({
    type: 'enum',
    enum: FulfillmentStatus,
    default: FulfillmentStatus.PENDING,
  })
  status: FulfillmentStatus

  @Column({ type: 'uuid', name: 'warehouse_id', nullable: true })
  warehouseId: string

  @ManyToOne(() => WarehouseEntity)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: WarehouseEntity

  @Column({ type: 'uuid', name: 'assigned_to_user_id', nullable: true })
  assignedToUserId: string

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'assigned_to_user_id' })
  assignedToUser: UserEntity

  @Column({ type: 'timestamp', name: 'started_at', nullable: true })
  startedAt: Date

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt: Date

  @OneToMany(() => FulfillmentItemEntity, (item) => item.task, { cascade: true })
  items: FulfillmentItemEntity[]

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

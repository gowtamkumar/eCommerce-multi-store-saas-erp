import { BaseEntity } from '@/common/base-entity/BaseEntity';
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity';
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';


@Entity('payments')
export class PaymentEntity extends BaseEntity {

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @ManyToOne(() => OrderItemEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  // TODO: Add user entity and relation
  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  // @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'user_id' })
  // user: UserEntity;

  @Column({ type: 'varchar', name: 'transaction_id', length: 255 })
  transactionId: string;

  @Column({ type: 'decimal', name: 'amount', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', name: 'currency', length: 10, default: 'BDT' })
  currency: string;

  @Column({ type: 'varchar', name: 'method', length: 50 })
  method: string;

  @Column({ type: 'varchar', name: 'status', length: 50 })
  status: string;

  @Column({ type: 'jsonb', name: 'gateway_response', nullable: true })
  gatewayResponse: any;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

}

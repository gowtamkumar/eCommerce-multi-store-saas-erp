import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { UserEntity } from 'src/modules/admin/user/entities/user.entity';
import { TenantEntity } from 'src/modules/tenant/entities/tenant.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CartItemEntity } from './cart-item.entity';

@Entity('carts')
export class CartEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;


  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;
  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  items: CartItemEntity[];
}


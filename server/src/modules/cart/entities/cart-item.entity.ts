import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { ProductEntity } from '../../product/entities/product.entity';
import { ProductVariantEntity } from '../../product/entities/variant.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { CartEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId: string;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'uuid', nullable: true, name: 'variant_id' })
  variantId: string;

  @ManyToOne(() => ProductVariantEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;
}


import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ProductEntity } from './product.entity';

import { UserEntity } from 'src/modules/admin/core/user/entities/user.entity';
@Entity('product_variants')
export class ProductVariantEntity extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number; // Override base price

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 5, name: 'low_stock_threshold' })
  lowStockThreshold: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'jsonb' })
  combination: Record<string, string>; // e.g., { "Color": "Red", "Size": "XL" }

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;



  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}

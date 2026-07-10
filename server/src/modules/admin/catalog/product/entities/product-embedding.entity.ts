import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm'
import { ProductEntity } from './product.entity'

export const vectorTransformer: ValueTransformer = {
  to: (value: number[] | null): string | null => {
    if (!value) return null
    return `[${value.join(',')}]`
  },
  from: (value: any): number[] | null => {
    if (!value) return null
    if (typeof value === 'string') {
      return value.replace(/[\[\]]/g, '').split(',').map(Number)
    }
    return value
  },
}

@Entity('product_embeddings')
@Index(['storeId'])
@Index(['storeId', 'productId'], { unique: true })
export class ProductEmbeddingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'varchar', length: 64, name: 'content_hash' })
  contentHash: string

  @Column({ type: 'varchar', length: 128, name: 'embedding_model' })
  embeddingModel: string

  @Column({
    type: 'vector',
    length: 1536,
    transformer: vectorTransformer,
    nullable: true,
  })
  embedding: number[]

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date
}

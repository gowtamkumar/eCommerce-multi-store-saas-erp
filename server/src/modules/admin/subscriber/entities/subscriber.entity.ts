import { BaseEntity } from 'src/common/base-entity/BaseEntity';

import { UserEntity } from 'src/modules/admin/core/user/entities/user.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity('subscribers')
export class SubscriberEntity extends BaseEntity {

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;





  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}

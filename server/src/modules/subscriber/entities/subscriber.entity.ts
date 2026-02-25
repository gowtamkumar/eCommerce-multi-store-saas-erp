import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import {
  Column,
  Entity,
} from 'typeorm';

@Entity('subscribers')
export class SubscriberEntity extends BaseEntity {

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;




}

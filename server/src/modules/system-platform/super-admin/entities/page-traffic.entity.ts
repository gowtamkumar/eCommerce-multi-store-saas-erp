import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import { Column, Entity, Unique, ManyToOne, JoinColumn } from 'typeorm';

import { UserEntity } from 'src/modules/admin/user/entities/user.entity';
@Entity('page_traffic')
@Unique(['tenantId', 'path', 'date'])
export class PageTrafficEntity extends BaseEntity {

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @Column()
    path: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'int', name: "request_count", default: 0 })
    requestCount: number;

    @Column({ type: 'timestamptz', name: 'last_updated', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}

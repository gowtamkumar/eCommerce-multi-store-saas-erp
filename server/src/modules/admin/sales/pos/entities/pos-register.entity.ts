import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BranchEntity } from '@/modules/system/organization/entities/branch.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

export enum PosRegisterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('pos_registers')
@Index(['branchId'])
@Index(['storeId'])
export class PosRegisterEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'uuid', name: 'branch_id' })
  branchId: string

  @ManyToOne(() => BranchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity

  @Column({
    type: 'enum',
    enum: PosRegisterStatus,
    default: PosRegisterStatus.ACTIVE,
  })
  status: PosRegisterStatus

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}

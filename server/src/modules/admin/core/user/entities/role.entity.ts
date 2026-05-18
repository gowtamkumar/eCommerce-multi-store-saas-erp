import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { PermissionEntity } from './permission.entity'

@Entity('roles')
@Index(['name', 'tenantId'], { unique: true })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ default: false, name: 'is_system_default' })
  isSystemDefault: boolean

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionEntity[]
}

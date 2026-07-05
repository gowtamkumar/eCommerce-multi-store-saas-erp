import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { PermissionEntity } from '@/modules/admin/core/user/entities/permission.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { UserPermissionOverrideEntity } from '@/modules/admin/core/user/entities/user-permission-override.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreFeatureEntity } from '@/modules/system/store/entities/store-feature.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { RbacController } from './rbac.controller'
import { RoleManagementService } from './role-management.service'
import { UserRoleAssignmentService } from './user-role-assignment.service'
import { UserPermissionOverrideService } from './user-permission-override.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'
import { RoleRepository } from '@/modules/admin/core/user/repositories/role.repository'
import { PermissionRepository } from '@/modules/admin/core/user/repositories/permission.repository'
import { UserRoleAssignmentRepository } from '@/modules/admin/core/user/repositories/user-role-assignment.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      PermissionEntity,
      UserRoleAssignmentEntity,
      UserPermissionOverrideEntity,
      UserEntity,
      StoreFeatureEntity,
      StoreEntity,
    ]),
    AuditLogModule,
  ],
  controllers: [RbacController],
  providers: [
    RoleManagementService,
    UserRoleAssignmentService,
    UserPermissionOverrideService,
    PermissionResolutionService,
    RoleRepository,
    PermissionRepository,
    UserRoleAssignmentRepository,
  ],
  exports: [
    RoleManagementService,
    UserRoleAssignmentService,
    UserPermissionOverrideService,
    PermissionResolutionService,
    RoleRepository,
    PermissionRepository,
    UserRoleAssignmentRepository,
  ],
})
export class RbacModule {}

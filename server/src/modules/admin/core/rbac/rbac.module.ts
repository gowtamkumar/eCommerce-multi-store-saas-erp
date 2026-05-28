import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { PermissionEntity } from '@/modules/admin/core/user/entities/permission.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { UserPermissionOverrideEntity } from '@/modules/admin/core/user/entities/user-permission-override.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantFeatureEntity } from '@/modules/system/tenant/entities/tenant-feature.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { RbacController } from './rbac.controller'
import { RoleManagementService } from './role-management.service'
import { UserRoleAssignmentService } from './user-role-assignment.service'
import { UserPermissionOverrideService } from './user-permission-override.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      PermissionEntity,
      UserRoleAssignmentEntity,
      UserPermissionOverrideEntity,
      UserEntity,
      TenantFeatureEntity,
      TenantEntity,
    ]),
    AuditLogModule,
  ],
  controllers: [RbacController],
  providers: [
    RoleManagementService,
    UserRoleAssignmentService,
    UserPermissionOverrideService,
    PermissionResolutionService,
  ],
  exports: [
    RoleManagementService,
    UserRoleAssignmentService,
    UserPermissionOverrideService,
    PermissionResolutionService,
  ],
})
export class RbacModule {}

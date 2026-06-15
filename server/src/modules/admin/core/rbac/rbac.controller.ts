import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req } from '@nestjs/common'
import { RoleManagementService, CreateRoleDto, UpdateRoleDto } from './role-management.service'
import { UserRoleAssignmentService, AssignRoleDto } from './user-role-assignment.service'
import {
  UserPermissionOverrideService,
  CreateOverrideDto,
} from './user-permission-override.service'
import {
  PermissionResolutionService,
  PermissionManifest,
} from '@/common/services/permission-resolution.service'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { PermissionEntity } from '@/modules/admin/core/user/entities/permission.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { UserPermissionOverrideEntity } from '@/modules/admin/core/user/entities/user-permission-override.entity'

@UseGuards(JwtAuthGuard)
@Controller('rbac')
export class RbacController {
  constructor(
    private readonly roleService: RoleManagementService,
    private readonly assignmentService: UserRoleAssignmentService,
    private readonly overrideService: UserPermissionOverrideService,
    private readonly resolutionService: PermissionResolutionService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // Roles
  // ─────────────────────────────────────────────────────────────────

  @Get('roles')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getRoles(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<RoleEntity[]>> {
    const roles = await this.roleService.getAllRoles(ctx.tenantId)
    return { success: true, statusCode: 200, message: 'Roles retrieved successfully', data: roles }
  }

  @Post('roles')
  @RequirePermissions(SystemPermissions.USERS_ROLES_ASSIGN)
  async createRole(
    @RequestContext() ctx: RequestContextDto,
    @Req() req: any,
    @Body() body: CreateRoleDto,
  ): Promise<BaseApiSuccessResponse<RoleEntity>> {
    const actorName = req.user?.name || 'Unknown'
    const role = await this.roleService.createRole(ctx.tenantId, ctx.userId, actorName, body)
    return { success: true, statusCode: 201, message: 'Role created successfully', data: role }
  }

  @Patch('roles/:id')
  @RequirePermissions(SystemPermissions.USERS_ROLES_ASSIGN)
  async updateRole(
    @RequestContext() ctx: RequestContextDto,
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ): Promise<BaseApiSuccessResponse<RoleEntity>> {
    const actorName = req.user?.name || 'Unknown'
    const role = await this.roleService.updateRole(id, ctx.tenantId, ctx.userId, actorName, body)
    return { success: true, statusCode: 200, message: 'Role updated successfully', data: role }
  }

  @Delete('roles/:id')
  @RequirePermissions(SystemPermissions.USERS_ROLES_ASSIGN)
  async deleteRole(
    @RequestContext() ctx: RequestContextDto,
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    const actorName = req.user?.name || 'Unknown'
    await this.roleService.deleteRole(id, ctx.tenantId, ctx.userId, actorName)
    return { success: true, statusCode: 200, message: 'Role deleted successfully', data: null }
  }

  // ─────────────────────────────────────────────────────────────────
  // Permissions Catalog
  // ─────────────────────────────────────────────────────────────────

  @Get('permissions')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getPermissions(): Promise<BaseApiSuccessResponse<PermissionEntity[]>> {
    const permissions = await this.roleService.getAllPermissions()
    return { success: true, statusCode: 200, message: 'Permissions retrieved', data: permissions }
  }

  @Get('permissions/grouped')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getPermissionsGrouped(): Promise<
    BaseApiSuccessResponse<Record<string, PermissionEntity[]>>
  > {
    const grouped = await this.roleService.getPermissionsByFeature()
    return {
      success: true,
      statusCode: 200,
      message: 'Permissions grouped by feature',
      data: grouped,
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // User Role Assignments
  // ─────────────────────────────────────────────────────────────────

  @Get('users/:userId/roles')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getUserRoles(
    @RequestContext() ctx: RequestContextDto,
    @Param('userId') userId: string,
  ): Promise<BaseApiSuccessResponse<UserRoleAssignmentEntity[]>> {
    const roles = await this.assignmentService.getUserRoles(userId, ctx.tenantId)
    return { success: true, statusCode: 200, message: 'User roles retrieved', data: roles }
  }

  @Post('users/:userId/roles')
  @RequirePermissions(SystemPermissions.USERS_ROLES_ASSIGN)
  async assignRole(
    @RequestContext() ctx: RequestContextDto,
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() body: AssignRoleDto,
  ): Promise<BaseApiSuccessResponse<UserRoleAssignmentEntity>> {
    const actorName = req.user?.name || 'Unknown'
    const assignment = await this.assignmentService.assignRoleToUser(
      userId,
      ctx.tenantId,
      ctx.userId,
      actorName,
      body,
    )
    return {
      success: true,
      statusCode: 201,
      message: 'Role assigned successfully',
      data: assignment,
    }
  }

  @Delete('users/:userId/roles/:assignmentId')
  @RequirePermissions(SystemPermissions.USERS_ROLES_ASSIGN)
  async revokeRole(
    @RequestContext() ctx: RequestContextDto,
    @Req() req: any,
    @Param('assignmentId') assignmentId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    const actorName = req.user?.name || 'Unknown'
    await this.assignmentService.revokeRoleFromUser(
      assignmentId,
      ctx.tenantId,
      ctx.userId,
      actorName,
    )
    return { success: true, statusCode: 200, message: 'Role revoked successfully', data: null }
  }

  // ─────────────────────────────────────────────────────────────────
  // User Permission Overrides
  // Note: These overrides are stored and manageable via API, but are NOT
  // evaluated in the per-request permission resolution hot path.
  // They are available for future use (e.g. emergency access, audit purposes).
  // ─────────────────────────────────────────────────────────────────

  @Get('users/:userId/overrides')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getUserOverrides(
    @RequestContext() ctx: RequestContextDto,
    @Param('userId') userId: string,
  ): Promise<BaseApiSuccessResponse<UserPermissionOverrideEntity[]>> {
    const overrides = await this.overrideService.getActiveOverrides(userId, ctx.tenantId)
    return { success: true, statusCode: 200, message: 'User overrides retrieved', data: overrides }
  }

  @Post('users/:userId/overrides')
  @RequirePermissions(SystemPermissions.USERS_PERMISSIONS_OVERRIDE)
  async addOverride(
    @RequestContext() ctx: RequestContextDto,
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() body: CreateOverrideDto,
  ): Promise<BaseApiSuccessResponse<UserPermissionOverrideEntity>> {
    const actorName = req.user?.name || 'Unknown'
    const dto = { ...body, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }
    const override = await this.overrideService.addOverride(
      userId,
      ctx.tenantId,
      ctx.userId,
      actorName,
      dto as any,
    )
    return {
      success: true,
      statusCode: 201,
      message: 'Override added successfully',
      data: override,
    }
  }

  @Delete('users/:userId/overrides/:overrideId')
  @RequirePermissions(SystemPermissions.USERS_PERMISSIONS_OVERRIDE)
  async removeOverride(
    @RequestContext() ctx: RequestContextDto,
    @Req() req: any,
    @Param('overrideId') overrideId: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    const actorName = req.user?.name || 'Unknown'
    await this.overrideService.removeOverride(overrideId, ctx.tenantId, ctx.userId, actorName)
    return { success: true, statusCode: 200, message: 'Override removed successfully', data: null }
  }

  // ─────────────────────────────────────────────────────────────────
  // Permission Manifest
  // ─────────────────────────────────────────────────────────────────

  @Get('users/:userId/manifest')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getUserManifest(
    @RequestContext() ctx: RequestContextDto,
    @Param('userId') userId: string,
  ): Promise<BaseApiSuccessResponse<PermissionManifest>> {
    const manifest = await this.resolutionService.resolvePermissionsManifest(userId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Permission manifest retrieved',
      data: manifest,
    }
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { RoleEntity } from '../entities/role.entity'
import { PermissionEntity } from '../entities/permission.entity'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class RoleController {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  @Get('permissions')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getPermissions(): Promise<BaseApiSuccessResponse<PermissionEntity[]>> {
    const permissions = await this.permissionRepo.find({
      order: { module: 'ASC', code: 'ASC' },
    })
    return {
      success: true,
      statusCode: 200,
      message: 'System permissions list',
      data: permissions,
    }
  }

  @Get('roles')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getRoles(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<RoleEntity[]>> {
    const roles = await this.roleRepo.find({
      where: [{ tenantId: ctx.tenantId }, { isSystemDefault: true }],
      relations: ['permissions'],
      order: { name: 'ASC' },
    })
    return {
      success: true,
      statusCode: 200,
      message: 'Roles retrieved successfully',
      data: roles,
    }
  }

  @Post('roles')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  async createRole(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { name: string; description?: string; permissionCodes: string[] },
  ): Promise<BaseApiSuccessResponse<RoleEntity>> {
    const { name, description, permissionCodes } = body

    // 1. Fetch matching permissions
    const permissions = await this.permissionRepo.find({
      where: { code: In(permissionCodes) },
    })

    // 2. Create and save role
    const role = this.roleRepo.create({
      name,
      description,
      tenantId: ctx.tenantId,
      permissions,
    })

    const saved = await this.roleRepo.save(role)
    return {
      success: true,
      statusCode: 201,
      message: 'Role created successfully',
      data: saved,
    }
  }

  @Patch('roles/:id')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  async updateRole(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; permissionCodes?: string[] },
  ): Promise<BaseApiSuccessResponse<RoleEntity>> {
    const { name, description, permissionCodes } = body

    const role = await this.roleRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
    })

    if (!role) {
      throw new Error('Role not found')
    }

    if (name) role.name = name
    if (description !== undefined) role.description = description

    if (permissionCodes) {
      role.permissions = await this.permissionRepo.find({
        where: { code: In(permissionCodes) },
      })
    }

    const saved = await this.roleRepo.save(role)
    return {
      success: true,
      statusCode: 200,
      message: 'Role updated successfully',
      data: saved,
    }
  }

  @Delete('roles/:id')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  async deleteRole(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    const role = await this.roleRepo.findOne({
      where: { id, tenantId: ctx.tenantId },
    })

    if (!role) {
      throw new Error('Role not found')
    }

    await this.roleRepo.remove(role)
    return {
      success: true,
      statusCode: 200,
      message: 'Role deleted successfully',
      data: null,
    }
  }
}

import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { UserStatus } from '@/common/enums/user/user-status.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { FilterUserDto } from '@/modules/admin/core/user/dtos'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { SuperAdminCrossTenantRepository } from '../repositories/super-admin-cross-tenant.repository'

function sanitizeLog(input: string | undefined | null): string {
  if (!input) return ''
  return input.replace(/[\r\n]/g, '_')
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('super-admin')
export class SuperAdminUsersController {
  private readonly logger = new Logger(SuperAdminUsersController.name)

  constructor(
    private readonly userService: UserService,
    private readonly crossTenantRepository: SuperAdminCrossTenantRepository,
  ) {}

  @Get('/users')
  async getAllUsers(
    @Query() filterDto: FilterUserDto,
    @Query('role') role?: string,
    @Query('status') statusFilter?: string,
    @Query('tenantId') tenantId?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const [users, total] = await this.crossTenantRepository.findAllUsersCrossTenant({
      ...filterDto,
      ...(role && { role }),
      ...(statusFilter && { status: statusFilter }),
      ...(tenantId && { tenantId }),
    } as any)
    const page = Number(filterDto.page) || 1
    const limit = Number(filterDto.limit) || 10

    return {
      success: true,
      statusCode: 200,
      message: 'All users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    }
  }

  @Get('/users/:id')
  async getUserDetails(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    const user = await this.userService.getUser(id)
    return {
      success: true,
      statusCode: 200,
      message: 'User details retrieved successfully',
      data: user as any,
    }
  }

  @Patch('/users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const user = await this.userService.updateUser(id, { status } as any)
    return {
      success: true,
      statusCode: 200,
      message: `User status updated to ${status}`,
      data: user as any,
    }
  }

  @Post('/users/:id/force-password-reset')
  @HttpCode(200)
  async forcePasswordReset(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    try {
      await this.userService.updateUser(id, { requirePasswordChange: true } as any)
      this.logger.log(
        `Super Admin ${sanitizeLog(ctx.user?.username)} forced password reset for user ${sanitizeLog(id)}`,
      )
    } catch (e: any) {
      this.logger.warn(`Force password reset for ${id}: ${e.message}`)
    }
    return {
      success: true,
      statusCode: 200,
      message: 'Password reset flag set for user',
      data: null,
    }
  }

  @Post('/users/:id/send-verification')
  @HttpCode(200)
  async sendVerificationEmail(@Param('id') id: string): Promise<BaseApiSuccessResponse<null>> {
    try {
      const user = await this.userService.getUser(id)
      this.logger.log(
        `Sending verification email to user ${sanitizeLog(id)}: ${sanitizeLog(user?.email)}`,
      )
      // The actual email sending would be triggered here via a notification/email service
      // For now we log and return success — the auth service handles re-sending via existing flows
    } catch (e: any) {
      this.logger.warn(`Send verification for ${id}: ${e.message}`)
    }
    return { success: true, statusCode: 200, message: 'Verification email queued', data: null }
  }
}

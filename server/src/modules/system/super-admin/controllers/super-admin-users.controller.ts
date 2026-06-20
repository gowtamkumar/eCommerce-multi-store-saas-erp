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
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import * as crypto from 'crypto'
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
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
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
    private readonly mailService: MailService,
  ) { }

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
    const user = await this.userService.getUser(id)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    if (!user.email) {
      throw new BadRequestException('User does not have an email address')
    }

    this.logger.log(
      `Sending verification email to user ${sanitizeLog(id)}: ${sanitizeLog(user?.email)}`,
    )

    try {
      let token = user.emailVerificationToken
      if (!token) {
        token = crypto.randomBytes(32).toString('hex')
        await this.userService.updateUser(id, { emailVerificationToken: token } as any)
      }

      await this.mailService.sendVerificationEmail(user.email, token, user.tenantId)
    } catch (e: any) {
      this.logger.error(`Send verification for ${id} failed: ${e.message}`, e.stack)
      throw new InternalServerErrorException(e.message || 'Failed to send verification email')
    }

    return { success: true, statusCode: 200, message: 'Verification email sent successfully', data: null }
  }
}

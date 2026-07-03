import { SkipPermissionCheck } from '@/common/decorators/skip-permission-check.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { Audit } from '@/common/decorators/audit.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CreateUserDto } from '../dtos/create-user.dto'
import { FilterUserDto } from '../dtos/filter-user.dto'
import { InviteStaffDto } from '../dtos/invite-staff.dto'
import { UpdatePasswordDto } from '../dtos/update-password.dto'
import { UpdateUserDto } from '../dtos/update-user.dto'
import { UserResponseDto } from '../dtos/user-response.dto'
import { StaffInvitationService } from '../services/staff-invitation.service'
import { UserService } from '../services/user.service'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(
    private readonly userService: UserService,
    private readonly invitationService: StaffInvitationService,
  ) {}

  @Get('/')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getUsers(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterUserDto: FilterUserDto,
  ): Promise<BaseApiSuccessResponse<UserResponseDto[]>> {
    this.logger.log(`${this.getUsers.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username}" retieving users.`)

    const { users, total } = await this.userService.getUsers(filterUserDto, ctx)

    return {
      success: true,
      statusCode: 200,
      message: `List of users`,
      data: users as any,
      pagination: {
        total,
        page: filterUserDto.page,
        limit: filterUserDto.limit,
        totalPages: Math.ceil(total / filterUserDto.limit),
      },
    }
  }

  @Get('/profile')
  @SkipPermissionCheck()
  async getProfile(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<UserResponseDto & { sessionId?: string }>> {
    this.logger.log(`${this.getProfile.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getProfile.`)
    const result = await this.userService.getUser(ctx.userId)
    return {
      success: true,
      statusCode: 200,
      message: 'Profile retrieved',
      data: { ...(result as any), sessionId: ctx.sessionId } as any,
    }
  }

  // ─── Team Management Endpoints ───────────────────────────────────────────────

  @Get('/team')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getTeamMembers(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.log(`${this.getTeamMembers.name} Controller Called`)
    const data = await this.userService.getTeamMembers(ctx)
    return { success: true, statusCode: 200, message: 'Team members', data }
  }

  @Post('/team/invite')
  @RequirePermissions(SystemPermissions.USERS_INVITE)
  @Audit({ entity: 'User', action: 'INVITE_MEMBER' })
  async inviteStaff(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: InviteStaffDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.log(`${this.inviteStaff.name} Controller Called`)
    const data = await this.invitationService.inviteStaff(dto, ctx, (email, tId) =>
      this.userService.findUserByEmail(email, tId),
    )
    return { success: true, statusCode: 201, message: data.message, data: data.invitation }
  }

  @Get('/team/invitations')
  @RequirePermissions(SystemPermissions.USERS_INVITE)
  async getInvitations(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.log(`${this.getInvitations.name} Controller Called`)
    const data = await this.invitationService.getInvitations(ctx)
    return { success: true, statusCode: 200, message: 'Invitations', data }
  }

  @Delete('/team/invitations/:invitationId')
  @RequirePermissions(SystemPermissions.USERS_INVITE)
  @Audit({ entity: 'User', action: 'REVOKE_INVITATION' })
  async revokeInvitation(
    @RequestContext() ctx: RequestContextDto,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.log(`${this.revokeInvitation.name} Controller Called`)
    const data = await this.invitationService.revokeInvitation(invitationId, ctx)
    return { success: true, statusCode: 200, message: 'Invitation revoked', data }
  }

  @Patch('/team/members/:memberId/role')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  @Audit({ entity: 'User', action: 'UPDATE_MEMBER_ROLE' })
  async updateMemberRole(
    @RequestContext() ctx: RequestContextDto,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body('role') role: UserRole,
  ): Promise<BaseApiSuccessResponse<UserResponseDto>> {
    this.logger.log(`${this.updateMemberRole.name} Controller Called`)
    const data = await this.userService.updateTeamMemberRole(memberId, role, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Member role updated',
      data: data as any,
    }
  }

  @Delete('/team/members/:memberId')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  @Audit({ entity: 'User', action: 'REMOVE_MEMBER' })
  async removeTeamMember(
    @RequestContext() ctx: RequestContextDto,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.log(`${this.removeTeamMember.name} Controller Called`)
    const data = await this.userService.deleteUser(memberId, ctx)
    return { success: true, statusCode: 200, message: 'Team member removed', data: null }
  }

  @Get('/:id')
  @RequirePermissions(SystemPermissions.USERS_READ)
  async getUser(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseApiSuccessResponse<UserResponseDto>> {
    this.logger.log(`${this.getUser.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getUser.`)
    const user = await this.userService.findOneUser(id, ctx)

    return {
      success: true,
      statusCode: 200,
      message: `User of ID: ${id}`,
      data: user as any,
    }
  }

  @Post('/')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  @Audit({ entity: 'User', action: 'CREATE' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<UserResponseDto>> {
    this.logger.log(`${this.createUser.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createUser.`)
    const user = await this.userService.createUser(createUserDto, ctx)

    return {
      success: true,
      statusCode: 201,
      message: `New user created`,
      data: user as any,
    }
  }

  @Patch('/profile')
  @SkipPermissionCheck()
  @Audit({ entity: 'User', action: 'UPDATE_PROFILE' })
  async updateProfile(
    @RequestContext() ctx: RequestContextDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<BaseApiSuccessResponse<UserResponseDto>> {
    this.logger.log(`${this.updateProfile.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username}" called updateProfile.`)

    // Security check: Remove role and status if present to prevent self-elevation
    delete updateUserDto.role
    delete updateUserDto.status

    const user = await this.userService.updateUser(ctx.userId, updateUserDto, ctx)

    return {
      success: true,
      statusCode: 200,
      message: `Profile updated`,
      data: user as any,
    }
  }

  @Patch('/profile/password')
  @SkipPermissionCheck()
  @Audit({ entity: 'User', action: 'UPDATE_PROFILE_PASSWORD' })
  async updateProfilePassword(
    @RequestContext() ctx: RequestContextDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<BaseApiSuccessResponse<UserResponseDto>> {
    this.logger.log(`${this.updateProfilePassword.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username}" called updateProfilePassword.`)
    const user = await this.userService.updatePassword(ctx.userId, updatePasswordDto, ctx)

    return {
      success: true,
      statusCode: 200,
      message: `Password updated`,
      data: user as any,
    }
  }

  @Patch('/:id')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  @Audit({ entity: 'User', action: 'UPDATE' })
  async updateUser(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<BaseApiSuccessResponse<UserResponseDto>> {
    this.logger.log(`${this.updateUser.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateUser.`)
    const user = await this.userService.updateUser(id, updateUserDto, ctx)

    return {
      success: true,
      statusCode: 200,
      message: `User of ID ${user.id} updated`,
      data: user as any,
    }
  }

  @Patch('/update-password/:id')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  @Audit({ entity: 'User', action: 'UPDATE_PASSWORD' })
  async updatePassword(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<BaseApiSuccessResponse<UserResponseDto>> {
    this.logger.log(`${this.updatePassword.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updatePassword.`)
    const user = await this.userService.updatePassword(userId, updatePasswordDto, ctx)

    return {
      success: true,
      statusCode: 200,
      message: `User password of id ${user.id} updated`,
      data: user as any,
    }
  }

  @Delete('/:id')
  @RequirePermissions(SystemPermissions.USERS_WRITE)
  @Audit({ entity: 'User', action: 'DELETE' })
  async deleteUser(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) userId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.log(`${this.deleteUser.name} Controller Called`)
    const user = await this.userService.deleteUser(userId, ctx)

    return {
      success: true,
      statusCode: 200,
      message: `User deleted successfully`,
      data: null,
    }
  }
}

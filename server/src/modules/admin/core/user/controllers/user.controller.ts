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
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Roles } from '@/common/decorators/roles.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { CreateUserDto } from '../dtos/create-user.dto'
import { FilterUserDto } from '../dtos/filter-user.dto'
import { UpdatePasswordDto } from '../dtos/update-password.dto'
import { UpdateUserDto } from '../dtos/update-user.dto'
import { InviteStaffDto } from '../dtos/invite-staff.dto'
import { UserService } from '../services/user.service'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly userService: UserService) {}

  @Get('/')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async getUsers(@RequestContext() ctx: RequestContextDto, @Query() filterUserDto: FilterUserDto) {
    this.logger.log(`${this.getUsers.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username}" retieving users.`)

    const { users, total } = await this.userService.getUsers(filterUserDto, ctx.tenantId)

    return {
      success: true,
      statusCode: 200,
      message: `List of users`,
      data: {
        users,
        pagination: {
          total,
          page: filterUserDto.page,
          limit: filterUserDto.limit,
          totalPages: Math.ceil(total / filterUserDto.limit),
        },
      },
    }
  }

  @Get('/profile')
  async getProfile(@RequestContext() ctx: RequestContextDto) {
    this.logger.log(`${this.getProfile.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getProfile.`)
    return this.userService.getUser(ctx.userId)
  }

  // ─── Team Management Endpoints ───────────────────────────────────────────────

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  @Get('/team')
  async getTeamMembers(@RequestContext() ctx: RequestContextDto) {
    this.logger.log(`${this.getTeamMembers.name} Controller Called`)
    const data = await this.userService.getTeamMembers(ctx.tenantId)
    return { success: true, statusCode: 200, message: 'Team members', data }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  @Post('/team/invite')
  async inviteStaff(@RequestContext() ctx: RequestContextDto, @Body() dto: InviteStaffDto) {
    this.logger.log(`${this.inviteStaff.name} Controller Called`)
    const data = await this.userService.inviteStaff(dto, ctx.tenantId, ctx.userId)
    return { success: true, statusCode: 201, message: data.message, data: data.invitation }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  @Get('/team/invitations')
  async getInvitations(@RequestContext() ctx: RequestContextDto) {
    this.logger.log(`${this.getInvitations.name} Controller Called`)
    const data = await this.userService.getInvitations(ctx.tenantId)
    return { success: true, statusCode: 200, message: 'Invitations', data }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  @Delete('/team/invitations/:invitationId')
  async revokeInvitation(
    @RequestContext() ctx: RequestContextDto,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ) {
    this.logger.log(`${this.revokeInvitation.name} Controller Called`)
    const data = await this.userService.revokeInvitation(invitationId, ctx.tenantId)
    return { success: true, statusCode: 200, message: 'Invitation revoked', data }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  @Patch('/team/members/:memberId/role')
  async updateMemberRole(
    @RequestContext() ctx: RequestContextDto,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body('role') role: UserRole,
  ) {
    this.logger.log(`${this.updateMemberRole.name} Controller Called`)
    const data = await this.userService.updateTeamMemberRole(memberId, role, ctx.tenantId)
    return { success: true, statusCode: 200, message: 'Member role updated', data }
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  @Delete('/team/members/:memberId')
  async removeTeamMember(
    @RequestContext() ctx: RequestContextDto,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    this.logger.log(`${this.removeTeamMember.name} Controller Called`)
    const data = await this.userService.deleteUser(memberId)
    return { success: true, statusCode: 200, message: 'Team member removed', data }
  }

  // ─── Accept Invitation (Public) ──────────────────────────────────────────────
  // Note: This endpoint is intentionally not behind JwtAuthGuard
  // It must be placed OUTSIDE the @UseGuards(JwtAuthGuard) class decorator scope.
  // However since NestJS applies class-level guards first, we'll override via a
  // separate public endpoint handled in the Auth module. For now, this is added
  // here purely as documentation; the real endpoint is handled in AuthController.

  // ─── Legacy User CRUD ────────────────────────────────────────────────────────

  @Get('/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async getUser(@RequestContext() ctx: RequestContextDto, @Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`${this.getUser.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getUser.`)
    const user = await this.userService.getUser(id)

    return {
      success: true,
      statusCode: 200,
      message: `User of ID: ${id}`,
      data: user,
    }
  }

  @Post('/')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async createUser(@Body() createUserDto: CreateUserDto, @RequestContext() ctx: RequestContextDto) {
    this.logger.log(`${this.createUser.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createUser.`)
    const user = await this.userService.createUser(createUserDto, ctx.tenantId)

    return {
      success: true,
      statusCode: 201,
      message: `New user created`,
      data: user,
    }
  }

  @Patch('/profile')
  async updateProfile(
    @RequestContext() ctx: RequestContextDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.log(`${this.updateProfile.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username}" called updateProfile.`)

    // Security check: Remove role and status if present to prevent self-elevation
    delete updateUserDto.role
    delete updateUserDto.status

    const user = await this.userService.updateUser(ctx.userId, updateUserDto)

    return {
      success: true,
      statusCode: 200,
      message: `Profile updated`,
      data: user,
    }
  }

  @Patch('/profile/password')
  async updateProfilePassword(
    @RequestContext() ctx: RequestContextDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    this.logger.log(`${this.updateProfilePassword.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username}" called updateProfilePassword.`)
    const user = await this.userService.updatePassword(ctx.userId, updatePasswordDto)

    return {
      success: true,
      statusCode: 200,
      message: `Password updated`,
      data: user,
    }
  }

  @Patch('/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async updateUser(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.logger.log(`${this.updateUser.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateUser.`)
    const user = await this.userService.updateUser(id, updateUserDto)

    return {
      success: true,
      statusCode: 200,
      message: `User of ID ${user.id} updated`,
      data: user,
    }
  }

  @Patch('/update-password/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async updatePassword(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    this.logger.log(`${this.updatePassword.name} Controller Called`)
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updatePassword.`)
    const user = await this.userService.updatePassword(userId, updatePasswordDto)

    return {
      success: true,
      statusCode: 200,
      message: `User password of id ${user.id} updated`,
      data: user,
    }
  }

  @Delete('/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async deleteUser(@Param('id', ParseUUIDPipe) userId: string) {
    this.logger.log(`${this.deleteUser.name} Controller Called`)
    const user = await this.userService.deleteUser(userId)

    return {
      success: true,
      statusCode: 200,
      message: `User of ${user} deleted`,
      data: user,
    }
  }
}

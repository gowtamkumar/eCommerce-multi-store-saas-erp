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
import { RequestContext } from 'src/common/decorators/request-context.decorator'
import { RequestContextDto } from 'src/common/dto/request-context.dto'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { CreateUserDto } from '../dtos/create-user.dto'
import { FilterUserDto } from '../dtos/filter-user.dto'
import { UpdatePasswordDto } from '../dtos/update-password.dto'
import { UpdateUserDto } from '../dtos/update-user.dto'
import { UserService } from '../services/user.service'

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name)

  constructor(private readonly userService: UserService) {}

  @Get('/')
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
    return this.userService.getUser(ctx.userId)
  }

  @Get('/:id')
  async getUser(@RequestContext() ctx: RequestContextDto, @Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`${this.getUser.name} Controller Called`)
    const user = await this.userService.getUser(id)

    return {
      success: true,
      statusCode: 200,
      message: `User of ID: ${id}`,
      data: user,
    }
  }

  @Post('/')
  async createUser(@Body() createUserDto: CreateUserDto, @RequestContext() ctx: RequestContextDto) {
    this.logger.log(`${this.createUser.name} Controller Called`)
    const user = await this.userService.createUser(createUserDto, ctx.tenantId)

    return {
      success: true,
      statusCode: 201,
      message: `New user created`,
      data: user,
    }
  }

  @Patch('/:id')
  async updateUser(@RequestContext() ctx: RequestContextDto, @Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`${this.updateUser.name} Controller Called`)
    const user = await this.userService.updateUser(id, updateUserDto)

    return {
      success: true,
      statusCode: 200,
      message: `User of ID ${user.id} updated`,
      data: user,
    }
  }

  @Patch('/update-password/:id')
  async updatePassword(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    this.logger.log(`${this.updatePassword.name} Controller Called`)
    const user = await this.userService.updatePassword(userId, updatePasswordDto)

    return {
      success: true,
      statusCode: 200,
      message: `User password of id ${user.id} updated`,
      data: user,
    }
  }

  @Delete('/:id')
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

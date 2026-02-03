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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
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
  async getUsers(@Query() filterUserDto: FilterUserDto, @TenantId() tenantId: string) {
    const { users, total } = await this.userService.getUsers(filterUserDto, tenantId)

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

  @Get('/:id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.getUser(id)

    return {
      success: true,
      statusCode: 200,
      message: `User of ID: ${id}`,
      data: user,
    }
  }

  @Post('/')
  async createUser(@Body() createUserDto: CreateUserDto, @TenantId() tenantId: string) {
    const user = await this.userService.createUser(createUserDto, tenantId)

    return {
      success: true,
      statusCode: 201,
      message: `New user created`,
      data: user,
    }
  }

  @Put('/:id')
  async updateUser(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
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
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
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
    const user = await this.userService.deleteUser(userId)

    return {
      success: true,
      statusCode: 200,
      message: `User of ${user} deleted`,
      data: user,
    }
  }
}

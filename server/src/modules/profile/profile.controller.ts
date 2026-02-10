import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { UpdatePasswordDto, UpdateUserDto } from '../admin/user/dtos'
import { UserService } from '../admin/user/services/user.service'
import { OrderService } from '../order/order.service'

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  @Get()
  async getProfile(@CurrentUser() user: any) {
    return this.userService.getUser(user.id)
  }

  @Get('/orders')
  async getOrders(@CurrentUser() user: any, @TenantId() tenantId: string) {
    return this.orderService.findByUserId(user.id, tenantId)
  }

  @Patch()
  async updateProfile(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(user.id, updateUserDto)
  }

  @Patch('/password')
  async updatePassword(@CurrentUser() user: any, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(user.id, updatePasswordDto)
  }
}

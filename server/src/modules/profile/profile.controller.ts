import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../admin/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../admin/auth/decorators/current-user.decorator';
import { UserService } from '../admin/user/services/user.service';
import { UpdateUserDto, UpdatePasswordDto } from '../admin/user/dtos';
import { UserEntity } from '../admin/user/entities/user.entity';
import { OrderService } from '../order/order.service';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('profile')
// @UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(
        private readonly userService: UserService,
        private readonly orderService: OrderService,
    ) { }

    @Get()
    async getProfile(@CurrentUser() user: any) {
        return this.userService.getUser(user.id);
    }

    @Get('/orders')
    async getOrders(
        @CurrentUser() user: any,
        @TenantId() tenantId: string,
    ) {
        return this.orderService.findByUser(user.id, tenantId);
    }

    @Put()
    async updateProfile(
        @CurrentUser() user: any,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.userService.updateUser(user.id, updateUserDto);
    }

    @Patch('/password')
    async updatePassword(
        @CurrentUser() user: any,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ) {
        return this.userService.updatePassword(user.id, updatePasswordDto);
    }
}

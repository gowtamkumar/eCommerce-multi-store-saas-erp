import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { UserRole } from 'src/common/enums/user/user-role.enum';

@Controller('coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    create(@Body() createCouponDto: CreateCouponDto, @TenantId() tenantId: string) {
        return this.couponService.create(createCouponDto, tenantId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findAll(@Query() filterDto: any, @TenantId() tenantId: string) {
        return this.couponService.findAll(filterDto, tenantId);
    }

    @Post('validate')
    validateCoupon(
        @Body('code') code: string,
        @Body('orderTotal') orderTotal: number,
        @TenantId() tenantId: string
    ) {
        return this.couponService.validateCoupon(code, orderTotal, tenantId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.couponService.findOne(id, tenantId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto, @TenantId() tenantId: string) {
        return this.couponService.update(id, updateCouponDto, tenantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.couponService.remove(id, tenantId);
    }
}

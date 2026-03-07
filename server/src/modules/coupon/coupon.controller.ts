import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Controller('coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    createCoupon(@Body() createCouponDto: CreateCouponDto, @TenantId() tenantId: string) {
        return this.couponService.createCoupon(createCouponDto, tenantId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findAllCoupons(@Query() filterDto: any, @TenantId() tenantId: string) {
        return this.couponService.findAllCoupons(filterDto, tenantId);
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
    findOneCoupon(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.couponService.findOneCoupon(id, tenantId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    updateCoupon(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto, @TenantId() tenantId: string) {
        return this.couponService.updateCoupon(id, updateCouponDto, tenantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    removeCoupon(@Param('id') id: string, @TenantId() tenantId: string) {
        return this.couponService.removeCoupon(id, tenantId);
    }
}

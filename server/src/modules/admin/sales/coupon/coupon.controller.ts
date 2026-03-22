import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Logger } from '@nestjs/common';
import { UserRole } from '@/common/enums/user/user-role.enum';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coupons')
export class CouponController {
    private readonly logger = new Logger(CouponController.name);

    constructor(private readonly couponService: CouponService) { }

    @Post()
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
    createCoupon(@RequestContext() ctx: RequestContextDto, @Body() createCouponDto: CreateCouponDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createCoupon.`);
        return this.couponService.createCoupon(createCouponDto, ctx.tenantId);
    }

    @Get()
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing, UserRole.Support, UserRole.Operator)
    findAllCoupons(@RequestContext() ctx: RequestContextDto, @Query() filterDto: any) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllCoupons.`);
        return this.couponService.findAllCoupons(filterDto, ctx.tenantId);
    }

    @Post('validate')
    validateCoupon(
        @RequestContext() ctx: RequestContextDto, @Body('code') code: string,
        @Body('orderTotal') orderTotal: number
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called validateCoupon.`);
        return this.couponService.validateCoupon(code, orderTotal, ctx.tenantId);
    }

    @Get(':id')
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing, UserRole.Support, UserRole.Operator)
    findOneCoupon(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneCoupon.`);
        return this.couponService.findOneCoupon(id, ctx.tenantId);
    }

    @Patch(':id')
    @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
    updateCoupon(@RequestContext() ctx: RequestContextDto, @Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCoupon.`);
        return this.couponService.updateCoupon(id, updateCouponDto, ctx.tenantId);
    }

    @Delete(':id')
    @Roles(UserRole.Admin, UserRole.StoreManager)
    removeCoupon(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeCoupon.`);
        return this.couponService.removeCoupon(id, ctx.tenantId);
    }
}

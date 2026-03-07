import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Logger } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { RequestContext } from "src/common/decorators/request-context.decorator";
import { RequestContextDto } from "src/common/dto/request-context.dto";

@Controller('coupons')
export class CouponController {
    private readonly logger = new Logger(CouponController.name);

    constructor(private readonly couponService: CouponService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    createCoupon(@RequestContext() ctx: RequestContextDto, @Body() createCouponDto: CreateCouponDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createCoupon.`);
            return this.couponService.createCoupon(createCouponDto, ctx.tenantId);
        }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    findOneCoupon(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneCoupon.`);
            return this.couponService.findOneCoupon(id, ctx.tenantId);
        }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    updateCoupon(@RequestContext() ctx: RequestContextDto, @Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCoupon.`);
            return this.couponService.updateCoupon(id, updateCouponDto, ctx.tenantId);
        }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.Admin)
    removeCoupon(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeCoupon.`);
            return this.couponService.removeCoupon(id, ctx.tenantId);
        }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { CouponService } from '../services/coupon.service'
import { CreateCouponDto } from '../dto/create-coupon.dto'
import { UpdateCouponDto } from '../dto/update-coupon.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { CouponResponseDto } from '../dto/coupon-response.dto'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/coupons')
@Controller('coupons')
export class CouponController {
  private readonly logger = new Logger(CouponController.name)

  constructor(private readonly couponService: CouponService) {}

  @Post()
  @RequirePermissions(SystemPermissions.COUPONS_MANAGE)
  async createCoupon(
    @RequestContext() ctx: RequestContextDto,
    @Body() createCouponDto: CreateCouponDto,
  ): Promise<BaseApiSuccessResponse<CouponResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createCoupon.`)
    const result = await this.couponService.createCoupon(createCouponDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Coupon created successfully',
      data: result as any, // Cast to any to let class-transformer handle serialization via DTO
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.COUPONS_MANAGE)
  async findAllCoupons(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: any,
  ): Promise<BaseApiSuccessResponse<{ coupons: CouponResponseDto[]; total: number }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllCoupons.`)
    const result = await this.couponService.findAllCoupons(filterDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'List of coupons retrieved',
      data: result as any,
    }
  }

  // @Throttle({ promo: { limit: 15, ttl: 60000 } })
  @Post('validate')
  async validateCoupon(
    @RequestContext() ctx: RequestContextDto,
    @Body('code') code: string,
    @Body('orderTotal') orderTotal: number,
  ): Promise<
    BaseApiSuccessResponse<{ valid: boolean; coupon: CouponResponseDto; discountAmount: number }>
  > {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called validateCoupon.`)
    const result = await this.couponService.validateCoupon(code, orderTotal, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Coupon validated successfully',
      data: result as any,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.COUPONS_MANAGE)
  async findOneCoupon(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<CouponResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneCoupon.`)
    const result = await this.couponService.findOneCoupon(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Coupon retrieved',
      data: result as any,
    }
  }

  @Patch(':id')
  @RequirePermissions(SystemPermissions.COUPONS_MANAGE)
  async updateCoupon(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<BaseApiSuccessResponse<CouponResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCoupon.`)
    const result = await this.couponService.updateCoupon(id, updateCouponDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Coupon updated successfully',
      data: result as any,
    }
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.COUPONS_MANAGE)
  async removeCoupon(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeCoupon.`)
    await this.couponService.removeCoupon(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Coupon deleted successfully',
      data: null,
    }
  }
}

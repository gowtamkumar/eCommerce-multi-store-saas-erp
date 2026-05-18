import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { CartService } from '@/modules/store/cart/cart.service'

@ApiTags('Admin Carts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/carts')
@Controller('carts')
export class AdminCartController {
  private readonly logger = new Logger(AdminCartController.name)

  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'List active shopping carts for tenant' })
  @RequirePermissions(SystemPermissions.ORDERS_READ)
  async findAllCarts(
    @RequestContext() ctx: RequestContextDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ): Promise<BaseApiSuccessResponse<{ carts: any[]; pagination: any }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllCarts.`)
    const { carts, total } = await this.cartService.findAllAdminCarts(ctx, page, limit, search)

    return {
      success: true,
      statusCode: 200,
      message: 'Carts retrieved successfully',
      data: {
        carts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    }
  }
}

import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { AiJobService } from '@/modules/admin/ai/services/ai-job.service'
import { CartService } from '@/modules/store/cart/cart.service'

@ApiTags('Admin Carts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('orders')
@Controller('carts')
export class AdminCartController {
  private readonly logger = new Logger(AdminCartController.name)

  constructor(
    private readonly cartService: CartService,
    private readonly aiJobService: AiJobService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List active shopping carts for store' })
  @ApiQuery({ name: 'abandonedOnly', required: false, type: Boolean })
  @RequirePermissions(SystemPermissions.ORDERS_READ)
  async findAllCarts(
    @RequestContext() ctx: RequestContextDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('abandonedOnly') abandonedOnly?: string,
  ): Promise<BaseApiSuccessResponse<{ carts: any[]; pagination: any }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllCarts.`)
    const filterAbandoned = abandonedOnly === 'true' || abandonedOnly === '1'
    const { carts, total } = await this.cartService.findAllAdminCarts(
      ctx,
      page,
      limit,
      search,
      filterAbandoned,
    )

    const draftCartIds = await this.aiJobService.findCompletedCartIdsWithDrafts(
      ctx.storeId,
      carts.map((cart) => cart.id),
    )

    const enrichedCarts = carts.map((cart) => ({
      ...cart,
      hasAiDraft: draftCartIds.has(cart.id),
    }))

    return {
      success: true,
      statusCode: 200,
      message: 'Carts retrieved successfully',
      data: {
        carts: enrichedCarts,
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

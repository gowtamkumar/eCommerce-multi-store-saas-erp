import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { LoyaltyService } from '../services/loyalty.service'
import { UpdateLoyaltyConfigDto } from '../dto/update-loyalty-config.dto'
import { ManualPointsAdjustmentDto } from '../dto/manual-points-adjustment.dto'
import { LoyaltyRuleDto } from '../dto/loyalty-rule.dto'
import { LoyaltyTransactionType } from '@/common/enums/loyalty-transaction-type.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { DataSource } from 'typeorm'

@Controller()
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Admin: Get loyalty configurations for the current tenant.
   */
  @Get('marketing/loyalty/config')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async getConfig(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any>> {
    const config = await this.loyaltyService.getOrCreateConfig(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Loyalty configurations retrieved successfully',
      data: config,
    }
  }

  /**
   * Admin: Update loyalty configurations for the current tenant.
   */
  @Put('marketing/loyalty/config')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async updateConfig(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: UpdateLoyaltyConfigDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const config = await this.loyaltyService.getOrCreateConfig(ctx.tenantId)
    Object.assign(config, dto)
    const saved = await this.dataSource.manager.save(config)
    return {
      success: true,
      statusCode: 200,
      message: 'Loyalty configurations updated successfully',
      data: saved,
    }
  }

  /**
   * Admin: Get points ledger history for a specific customer.
   */
  @Get('marketing/loyalty/history/:customerId')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async getCustomerHistory(
    @Param('customerId') customerId: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const history = await this.loyaltyService.getPointsHistory(customerId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Customer loyalty ledger retrieved successfully',
      data: history,
    }
  }

  /**
   * Admin: Manually credit points to a customer's balance.
   */
  @Post('marketing/loyalty/credit')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async manualCredit(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: ManualPointsAdjustmentDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const ledger = await this.loyaltyService.creditPoints(
      {
        customerId: dto.customerId,
        points: dto.points,
        type: LoyaltyTransactionType.MANUAL_CREDIT,
        referenceType: 'MANUAL',
        note: dto.note,
        createdBy: ctx.userId,
      },
      ctx,
    )

    return {
      success: true,
      statusCode: 200,
      message: `${dto.points} points credited successfully`,
      data: ledger,
    }
  }

  /**
   * Admin: Manually debit points from a customer's balance.
   */
  @Post('marketing/loyalty/debit')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async manualDebit(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: ManualPointsAdjustmentDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const ledger = await this.loyaltyService.debitPoints(
      {
        customerId: dto.customerId,
        points: dto.points,
        type: LoyaltyTransactionType.MANUAL_DEBIT,
        referenceType: 'MANUAL',
        note: dto.note,
        createdBy: ctx.userId,
      },
      ctx,
    )

    return {
      success: true,
      statusCode: 200,
      message: `${dto.points} points debited successfully`,
      data: ledger,
    }
  }

  /**
   * Storefront: Get currently authenticated customer's own points balance, tier, referral code, and history.
   */
  @Get('store/loyalty/me')
  async getMyLoyaltySummary(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const customerId = ctx.userId
    if (!customerId) {
      return {
        success: false,
        statusCode: 401,
        message: 'Unauthenticated',
        data: null,
      }
    }

    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { id: customerId, tenantId: ctx.tenantId },
      select: ['id', 'name', 'membershipTier', 'referralCode', 'loyaltyPointsBalance'],
    })

    const history = await this.loyaltyService.getPointsHistory(customerId, ctx.tenantId)
    const config = await this.loyaltyService.getOrCreateConfig(ctx.tenantId)

    // Calculate progression details (how much spent / needed to reach next tier)
    // E.g., Bronze: silverTierThreshold, Silver: goldTierThreshold, etc.
    const currencyValue = user
      ? (user.loyaltyPointsBalance || 0) / (config.pointsRequiredPerCurrencyDiscount || 100)
      : 0

    return {
      success: true,
      statusCode: 200,
      message: 'My loyalty profile retrieved successfully',
      data: {
        pointsBalance: user?.loyaltyPointsBalance || 0,
        currencyValue,
        membershipTier: user?.membershipTier || 'BRONZE',
        referralCode: user?.referralCode || '',
        history,
        rules: {
          pointsRequiredPerCurrencyDiscount: config.pointsRequiredPerCurrencyDiscount,
          pointsPerCurrencySpent: config.pointsPerCurrencySpent,
        },
      },
    }
  }

  // --- Loyalty Rules Dynamic CRUD ---

  @Get('marketing/loyalty/rules')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async getLoyaltyRules(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const data = await this.loyaltyService.findAllRules(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Loyalty rules retrieved successfully',
      data,
    }
  }

  @Post('marketing/loyalty/rules')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async createLoyaltyRule(
    @Body() body: LoyaltyRuleDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.loyaltyService.createRule(body as any, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Loyalty rule created successfully',
      data,
    }
  }

  @Put('marketing/loyalty/rules/:id')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async updateLoyaltyRule(
    @Param('id') id: string,
    @Body() body: LoyaltyRuleDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.loyaltyService.updateRule(id, body as any, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Loyalty rule updated successfully',
      data,
    }
  }

  /**
   * Admin: outstanding loyalty liability for the current tenant.
   *
   * Useful for finance dashboards — total unredeemed unexpired points and
   * the number of customers holding them. Pairs with the daily expiry sweep
   * so the liability decreases as expired batches roll off.
   */
  @Get('marketing/loyalty/liability')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async getLiability(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<{ outstandingPoints: number; customers: number }>> {
    const data = await this.loyaltyService.getLiability(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Loyalty liability retrieved successfully',
      data,
    }
  }

  @Delete('marketing/loyalty/rules/:id')
  @UseGuards(SubscriptionGuard)
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async deleteLoyaltyRule(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    await this.loyaltyService.deleteRule(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Loyalty rule deleted successfully',
      data: null,
    }
  }
}

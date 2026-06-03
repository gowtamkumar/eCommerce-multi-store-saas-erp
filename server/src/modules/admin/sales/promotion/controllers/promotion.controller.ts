import { Audit } from '@/common/decorators/audit.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { Public } from '@/common/decorators/public.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CreatePromotionDto } from '../dto/create-promotion.dto'
import { PromotionResponseDto } from '../dto/promotion-response.dto'
import { UpdatePromotionDto } from '../dto/update-promotion.dto'
import { PromotionService } from '../services/promotion.service'

@UseGuards(SubscriptionGuard)
@RequireFeature('marketing')
@Controller('promotions')
export class PromotionController {
  private readonly logger = new Logger(PromotionController.name)

  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.PROMOTIONS_MANAGE)
  @Audit({ entity: 'Promotion', action: 'CREATE' })
  async createPromotion(
    @RequestContext() ctx: RequestContextDto,
    @Body() createPromotionDto: CreatePromotionDto,
  ): Promise<BaseApiSuccessResponse<PromotionResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPromotion.`)
    const result = await this.promotionService.createPromotion(createPromotionDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Promotion created successfully',
      data: result,
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.PROMOTIONS_MANAGE)
  async findAllPromotions(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: any,
  ): Promise<BaseApiSuccessResponse<{ promotions: PromotionResponseDto[]; total: number }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPromotions.`)
    const result = await this.promotionService.findAllPromotions(filterDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotions retrieved successfully',
      data: result,
    }
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.PROMOTIONS_MANAGE)
  async findActivePromotions(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<PromotionResponseDto[]>> {
    this.logger.verbose(`[Active Promotions] called for tenant: ${ctx.tenantId}`)
    const result = await this.promotionService.findActivePromotions(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Active promotions retrieved',
      data: result,
    }
  }

  // ─── Public endpoints (no auth, no admin permissions) — storefront ───
  @Public()
  @Get('offers')
  async getOfferProducts(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`[Public] getOfferProducts called for tenant: ${ctx.tenantId}`)
    const result = await this.promotionService.getOfferProducts(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Offer products retrieved',
      data: result,
    }
  }

  @Public()
  @Get('slug/:slug')
  async getPromotionBySlug(
    @Param('slug') slug: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `[Public] getPromotionBySlug called for slug: ${slug}, tenant: ${ctx.tenantId}`,
    )
    const result = await this.promotionService.getOfferProductsBySlug(slug, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotion by slug retrieved',
      data: result,
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.PROMOTIONS_MANAGE)
  async findOnePromotion(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<PromotionResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOnePromotion.`)
    const result = await this.promotionService.findOne(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotion retrieved',
      data: result,
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.PROMOTIONS_MANAGE)
  @Audit({ entity: 'Promotion', action: 'UPDATE' })
  async updatePromotion(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<BaseApiSuccessResponse<PromotionResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updatePromotion.`)
    const result = await this.promotionService.updatePromotion(id, updatePromotionDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotion updated successfully',
      data: result,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.PROMOTIONS_MANAGE)
  @Audit({ entity: 'Promotion', action: 'DELETE' })
  async removePromotion(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removePromotion.`)
    await this.promotionService.removePromotion(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotion deleted successfully',
      data: null,
    }
  }
}

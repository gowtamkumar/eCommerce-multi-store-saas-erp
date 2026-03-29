import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { TenantId } from '@/common/decorators/tenant-id.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
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
import { CreatePromotionDto } from './dto/create-promotion.dto'
import { PromotionResponseDto } from './dto/promotion-response.dto'
import { UpdatePromotionDto } from './dto/update-promotion.dto'
import { PromotionService } from './promotion.service'

@Controller('promotions')
export class PromotionController {
  private readonly logger = new Logger(PromotionController.name)

  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async createPromotion(
    @RequestContext() ctx: RequestContextDto,
    @Body() createPromotionDto: CreatePromotionDto,
  ): Promise<BaseApiSuccessResponse<PromotionResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPromotion.`)
    const result = await this.promotionService.createPromotion(createPromotionDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Promotion created successfully',
      data: result,
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.MARKETING,
    UserRole.SUPPORT,
    UserRole.OPERATOR,
  )
  async findAllPromotions(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: any,
  ): Promise<BaseApiSuccessResponse<{ promotions: PromotionResponseDto[]; total: number }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPromotions.`)
    const result = await this.promotionService.findAllPromotions(filterDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotions retrieved successfully',
      data: result,
    }
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.MARKETING,
    UserRole.SUPPORT,
    UserRole.OPERATOR,
    UserRole.USER,
  )
  async findActivePromotions(
    @TenantId() tenantId: string,
  ): Promise<BaseApiSuccessResponse<PromotionResponseDto[]>> {
    this.logger.verbose(`[Active Promotions] called for tenant: ${tenantId}`)
    const result = await this.promotionService.findActivePromotions(tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Active promotions retrieved',
      data: result,
    }
  }

  // ─── Public endpoint (no auth) — used by storefront /offers page ───
  @Get('offers')
  async getOfferProducts(
    @TenantId() tenantId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`[Public] getOfferProducts called for tenant: ${tenantId}`)
    const result = await this.promotionService.getOfferProducts(tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Offer products retrieved',
      data: result,
    }
  }

  @Get('slug/:slug')
  async getPromotionBySlug(
    @Param('slug') slug: string,
    @TenantId() tenantId: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`[Public] getPromotionBySlug called for slug: ${slug}, tenant: ${tenantId}`)
    const result = await this.promotionService.getOfferProductsBySlug(slug, tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotion by slug retrieved',
      data: result,
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.MARKETING,
    UserRole.SUPPORT,
    UserRole.OPERATOR,
  )
  async findOnePromotion(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<PromotionResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOnePromotion.`)
    const result = await this.promotionService.findOne(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotion retrieved',
      data: result,
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async updatePromotion(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ): Promise<BaseApiSuccessResponse<PromotionResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updatePromotion.`)
    const result = await this.promotionService.updatePromotion(id, updatePromotionDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotion updated successfully',
      data: result,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async removePromotion(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removePromotion.`)
    await this.promotionService.removePromotion(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Promotion deleted successfully',
      data: null,
    }
  }
}

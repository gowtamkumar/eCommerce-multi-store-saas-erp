import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { AiChatDto } from '../dto/ai-chat.dto'
import { DashboardCopilotDto } from '../dto/dashboard-copilot.dto'
import { CampaignCopyResultDto, GenerateCampaignCopyDto } from '../dto/generate-campaign-copy.dto'
import {
  CatalogContentResultDto,
  GenerateCatalogContentDto,
} from '../dto/generate-catalog-content.dto'
import { FaqContentResultDto, GenerateFaqDto } from '../dto/generate-faq.dto'
import { GenerateLeadFollowUpDto, LeadFollowUpResultDto } from '../dto/generate-lead-follow-up.dto'
import {
  GenerateLoyaltyCopyDto,
  LoyaltyProgramCopyResultDto,
  LoyaltyRuleCopyResultDto,
} from '../dto/generate-loyalty-copy.dto'
import {
  GenerateMarketingDescriptionDto,
  MarketingDescriptionResultDto,
} from '../dto/generate-marketing-description.dto'
import { GenerateOrderAssistDto, OrderAssistResultDto } from '../dto/generate-order-assist.dto'
import {
  GenerateBatchWasteReductionDto,
  BatchWasteReductionResultDto,
} from '../dto/generate-batch-waste-reduction.dto'
import {
  GeneratePackingSlipNotesDto,
  PackingSlipNotesResultDto,
} from '../dto/generate-packing-slip-notes.dto'
import {
  GenerateCycleCountVarianceDto,
  CycleCountVarianceResultDto,
} from '../dto/generate-cycle-count-variance.dto'
import {
  GenerateStockTransferReasonDto,
  StockTransferReasonResultDto,
} from '../dto/generate-stock-transfer-reason.dto'
import {
  GenerateInventoryAnomalyDto,
  InventoryAnomalyResultDto,
} from '../dto/generate-inventory-anomaly.dto'
import {
  GenerateMediaAssistDto,
  MediaAssistResultDto,
} from '../dto/generate-media-assist.dto'
import {
  GeneratePriceBookRationaleDto,
  PriceBookRationaleResultDto,
} from '../dto/generate-price-book-rationale.dto'
import {
  GenerateAbandonedCartMessageDto,
  AbandonedCartMessageResultDto,
} from '../dto/generate-abandoned-cart-message.dto'
import {
  GenerateReviewAssistDto,
  ReviewAssistResultDto,
} from '../dto/generate-review-assist.dto'
import {
  GenerateReturnAssistDto,
  ReturnAssistResultDto,
} from '../dto/generate-return-assist.dto'
import {
  GenerateCustomerProfileDto,
  CustomerProfileResultDto,
} from '../dto/generate-customer-profile.dto'
import {
  GenerateSupportReplyDto,
  SupportReplyResultDto,
} from '../dto/generate-support-reply.dto'
import {
  GeneratePageBlockContentDto,
  PageBlockContentResultDto,
} from '../dto/generate-page-block-content.dto'
import { GeneratePageSeoDto, PageSeoResultDto } from '../dto/generate-page-seo.dto'
import {
  GenerateProductContentDto,
  ProductContentResultDto,
} from '../dto/generate-product-content.dto'
import { GenerateStoreSeoDto, StoreSeoResultDto } from '../dto/generate-store-seo.dto'
import { AiAssistantService } from '../services/ai-assistant.service'

@Controller('ai')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('ai')
export class AiController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Get('status')
  @RequirePermissions(SystemPermissions.AI_USE)
  async getStatus(@RequestContext() ctx: RequestContextDto): Promise<
    BaseApiSuccessResponse<{
      enabled: boolean
      configured: boolean
      provider: string
      defaultModel?: string
      hasApiKey: boolean
    }>
  > {
    const data = await this.aiAssistantService.getStatus(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'AI status retrieved successfully',
      data,
    }
  }

  @Post('chat')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async chat(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: AiChatDto,
  ): Promise<BaseApiSuccessResponse<{ reply: string; model: string; totalTokens: number }>> {
    const data = await this.aiAssistantService.chat(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'AI response generated successfully',
      data,
    }
  }

  @Post('copilot/dashboard')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.REPORTS_READ)
  async askDashboardCopilot(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: DashboardCopilotDto,
  ): Promise<BaseApiSuccessResponse<{ reply: string; model: string; totalTokens: number }>> {
    const data = await this.aiAssistantService.askDashboardCopilot(ctx, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Dashboard copilot response generated successfully',
      data,
    }
  }

  @Post('generate/product-content')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateProductContent(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateProductContentDto,
  ): Promise<BaseApiSuccessResponse<ProductContentResultDto>> {
    const data = await this.aiAssistantService.generateProductContent(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Product content generated successfully',
      data,
    }
  }

  @Post('generate/catalog-content')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateCatalogContent(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateCatalogContentDto,
  ): Promise<BaseApiSuccessResponse<CatalogContentResultDto>> {
    const data = await this.aiAssistantService.generateCatalogContent(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Catalog content generated successfully',
      data,
    }
  }

  @Post('generate/campaign-copy')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateCampaignCopy(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateCampaignCopyDto,
  ): Promise<BaseApiSuccessResponse<CampaignCopyResultDto>> {
    const data = await this.aiAssistantService.generateCampaignCopy(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaign copy generated successfully',
      data,
    }
  }

  @Post('generate/faq')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateFaq(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateFaqDto,
  ): Promise<BaseApiSuccessResponse<FaqContentResultDto>> {
    const data = await this.aiAssistantService.generateFaq(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'FAQ content generated successfully',
      data,
    }
  }

  @Post('generate/page-seo')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generatePageSeo(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GeneratePageSeoDto,
  ): Promise<BaseApiSuccessResponse<PageSeoResultDto>> {
    const data = await this.aiAssistantService.generatePageSeo(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Page SEO generated successfully',
      data,
    }
  }

  @Post('generate/store-seo')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateStoreSeo(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateStoreSeoDto,
  ): Promise<BaseApiSuccessResponse<StoreSeoResultDto>> {
    const data = await this.aiAssistantService.generateStoreSeo(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Store SEO generated successfully',
      data,
    }
  }

  @Post('generate/page-block-content')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generatePageBlockContent(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GeneratePageBlockContentDto,
  ): Promise<BaseApiSuccessResponse<PageBlockContentResultDto>> {
    const data = await this.aiAssistantService.generatePageBlockContent(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Page block content generated successfully',
      data,
    }
  }

  @Post('generate/marketing-description')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateMarketingDescription(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateMarketingDescriptionDto,
  ): Promise<BaseApiSuccessResponse<MarketingDescriptionResultDto>> {
    const data = await this.aiAssistantService.generateMarketingDescription(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Marketing description generated successfully',
      data,
    }
  }

  @Post('generate/loyalty-copy')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateLoyaltyCopy(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateLoyaltyCopyDto,
  ): Promise<BaseApiSuccessResponse<LoyaltyProgramCopyResultDto | LoyaltyRuleCopyResultDto>> {
    const data = await this.aiAssistantService.generateLoyaltyCopy(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Loyalty copy generated successfully',
      data,
    }
  }

  @Post('generate/lead-follow-up')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateLeadFollowUp(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateLeadFollowUpDto,
  ): Promise<BaseApiSuccessResponse<LeadFollowUpResultDto>> {
    const data = await this.aiAssistantService.generateLeadFollowUp(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Lead follow-up email generated successfully',
      data,
    }
  }

  @Post('generate/order-assist')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.ORDERS_READ)
  async generateOrderAssist(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateOrderAssistDto,
  ): Promise<BaseApiSuccessResponse<OrderAssistResultDto>> {
    const data = await this.aiAssistantService.generateOrderAssist(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Order assist content generated successfully',
      data,
    }
  }

  @Post('generate/return-assist')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.RETURNS_READ)
  async generateReturnAssist(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateReturnAssistDto,
  ): Promise<BaseApiSuccessResponse<ReturnAssistResultDto>> {
    const data = await this.aiAssistantService.generateReturnAssist(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Return explanation letter generated successfully',
      data,
    }
  }

  @Post('generate/support-reply')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateSupportReply(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateSupportReplyDto,
  ): Promise<BaseApiSuccessResponse<SupportReplyResultDto>> {
    const data = await this.aiAssistantService.generateSupportReply(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Support reply generated successfully',
      data,
    }
  }

  @Post('generate/customer-profile')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.CRM_READ)
  async generateCustomerProfile(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateCustomerProfileDto,
  ): Promise<BaseApiSuccessResponse<CustomerProfileResultDto>> {
    const data = await this.aiAssistantService.generateCustomerProfile(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Customer profile insights generated successfully',
      data,
    }
  }

  @Post('generate/review-assist')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.CATALOG_READ)
  async generateReviewAssist(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateReviewAssistDto,
  ): Promise<BaseApiSuccessResponse<ReviewAssistResultDto>> {
    const data = await this.aiAssistantService.generateReviewAssist(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Review moderation assist generated successfully',
      data,
    }
  }

  @Post('generate/abandoned-cart-message')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.ORDERS_READ)
  async generateAbandonedCartMessage(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateAbandonedCartMessageDto,
  ): Promise<BaseApiSuccessResponse<AbandonedCartMessageResultDto>> {
    const data = await this.aiAssistantService.generateAbandonedCartMessage(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Abandoned cart message generated successfully',
      data,
    }
  }

  @Post('generate/price-book-rationale')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.CATALOG_READ)
  async generatePriceBookRationale(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GeneratePriceBookRationaleDto,
  ): Promise<BaseApiSuccessResponse<PriceBookRationaleResultDto>> {
    const data = await this.aiAssistantService.generatePriceBookRationale(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Price book rationale generated successfully',
      data,
    }
  }

  @Post('generate/media-assist')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.CONTENT_MANAGE)
  async generateMediaAssist(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateMediaAssistDto,
  ): Promise<BaseApiSuccessResponse<MediaAssistResultDto>> {
    const data = await this.aiAssistantService.generateMediaAssist(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Media assist content generated successfully',
      data,
    }
  }

  @Post('generate/inventory-anomaly')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.INVENTORY_READ)
  async generateInventoryAnomaly(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateInventoryAnomalyDto,
  ): Promise<BaseApiSuccessResponse<InventoryAnomalyResultDto>> {
    const data = await this.aiAssistantService.generateInventoryAnomaly(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Inventory anomaly narrative generated successfully',
      data,
    }
  }

  @Post('generate/stock-transfer-reason')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.INVENTORY_READ)
  async generateStockTransferReason(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateStockTransferReasonDto,
  ): Promise<BaseApiSuccessResponse<StockTransferReasonResultDto>> {
    const data = await this.aiAssistantService.generateStockTransferReason(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock transfer reason notes generated successfully',
      data,
    }
  }

  @Post('generate/cycle-count-variance')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.INVENTORY_READ)
  async generateCycleCountVariance(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateCycleCountVarianceDto,
  ): Promise<BaseApiSuccessResponse<CycleCountVarianceResultDto>> {
    const data = await this.aiAssistantService.generateCycleCountVariance(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Cycle count variance explanation generated successfully',
      data,
    }
  }

  @Post('generate/packing-slip-notes')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.FULFILLMENT_MANAGE)
  async generatePackingSlipNotes(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GeneratePackingSlipNotesDto,
  ): Promise<BaseApiSuccessResponse<PackingSlipNotesResultDto>> {
    const data = await this.aiAssistantService.generatePackingSlipNotes(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Packing slip notes generated successfully',
      data,
    }
  }

  @Post('generate/batch-waste-reduction')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.INVENTORY_READ)
  async generateBatchWasteReduction(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateBatchWasteReductionDto,
  ): Promise<BaseApiSuccessResponse<BatchWasteReductionResultDto>> {
    const data = await this.aiAssistantService.generateBatchWasteReduction(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Batch waste reduction tips generated successfully',
      data,
    }
  }
}

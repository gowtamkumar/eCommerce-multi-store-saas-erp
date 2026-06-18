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
import { CampaignCopyResultDto, GenerateCampaignCopyDto } from '../dto/generate-campaign-copy.dto'
import { FaqContentResultDto, GenerateFaqDto } from '../dto/generate-faq.dto'
import {
  GenerateMarketingDescriptionDto,
  MarketingDescriptionResultDto,
} from '../dto/generate-marketing-description.dto'
import { GeneratePageSeoDto, PageSeoResultDto } from '../dto/generate-page-seo.dto'
import {
  GenerateProductContentDto,
  ProductContentResultDto,
} from '../dto/generate-product-content.dto'
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
}

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
}

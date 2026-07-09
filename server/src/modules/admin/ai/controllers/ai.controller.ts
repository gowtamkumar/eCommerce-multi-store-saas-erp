import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import {
  SkipAllThrottles,
  SkipNonAiAdminThrottles,
} from '@/common/throttler/throttler-skip.decorator'
import { CustomThrottlerGuard } from '@/common/throttler/throttler.guard'
import { Body, Controller, Get, HttpCode, Param, Post, Query, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { Throttle } from '@nestjs/throttler'
import { AdminCopilotDto, AdminCopilotResponseDto } from '../dto/admin-copilot.dto'
import { AiChatDto } from '../dto/ai-chat.dto'
import { AiUsageSummaryDto } from '../dto/ai-usage.dto'
import { DashboardCopilotDto } from '../dto/dashboard-copilot.dto'
import {
  AbandonedCartMessageResultDto,
  GenerateAbandonedCartMessageDto,
} from '../dto/generate-abandoned-cart-message.dto'
import {
  ApPaymentReminderResultDto,
  GenerateApPaymentReminderDto,
} from '../dto/generate-ap-payment-reminder.dto'
import {
  ArCollectionDraftResultDto,
  GenerateArCollectionDraftDto,
} from '../dto/generate-ar-collection-draft.dto'
import {
  BatchWasteReductionResultDto,
  GenerateBatchWasteReductionDto,
} from '../dto/generate-batch-waste-reduction.dto'
import { CampaignCopyResultDto, GenerateCampaignCopyDto } from '../dto/generate-campaign-copy.dto'
import {
  CatalogContentResultDto,
  GenerateCatalogContentDto,
} from '../dto/generate-catalog-content.dto'
import {
  CustomerProfileResultDto,
  GenerateCustomerProfileDto,
} from '../dto/generate-customer-profile.dto'
import {
  CycleCountVarianceResultDto,
  GenerateCycleCountVarianceDto,
} from '../dto/generate-cycle-count-variance.dto'
import {
  DebitNoteDisputeResultDto,
  GenerateDebitNoteDisputeDto,
} from '../dto/generate-debit-note-dispute.dto'
import {
  ExpenseCategorySuggestResultDto,
  GenerateExpenseCategoryDto,
} from '../dto/generate-expense-category.dto'
import { FaqContentResultDto, GenerateFaqDto } from '../dto/generate-faq.dto'
import {
  GenerateGrnDiscrepancyNotesDto,
  GrnDiscrepancyNotesResultDto,
} from '../dto/generate-grn-discrepancy-notes.dto'
import {
  GenerateInventoryAnomalyDto,
  InventoryAnomalyResultDto,
} from '../dto/generate-inventory-anomaly.dto'
import { GenerateInvoiceOcrDto, InvoiceOcrResultDto } from '../dto/generate-invoice-ocr.dto'
import {
  GenerateThreeWayMatchDto,
  ThreeWayMatchExplanationResultDto,
} from '../dto/generate-three-way-match.dto'
import { GenerateLeadFollowUpDto, LeadFollowUpResultDto } from '../dto/generate-lead-follow-up.dto'
import {
  GenerateLoyaltyCopyDto,
  LoyaltyProgramCopyResultDto,
  LoyaltyRuleCopyResultDto,
} from '../dto/generate-loyalty-copy.dto'
import {
  GenerateCouponCodeSuggestionsDto,
  CouponCodeSuggestionsResultDto,
} from '../dto/generate-coupon-code-suggestions.dto'
import {
  GenerateMarketingDescriptionDto,
  MarketingDescriptionResultDto,
} from '../dto/generate-marketing-description.dto'
import { GenerateMediaAssistDto, MediaAssistResultDto } from '../dto/generate-media-assist.dto'
import { GenerateOrderAssistDto, OrderAssistResultDto } from '../dto/generate-order-assist.dto'
import {
  GeneratePackingSlipNotesDto,
  PackingSlipNotesResultDto,
} from '../dto/generate-packing-slip-notes.dto'
import {
  GeneratePageBlockContentDto,
  PageBlockContentResultDto,
} from '../dto/generate-page-block-content.dto'
import { GeneratePageSeoDto, PageSeoResultDto } from '../dto/generate-page-seo.dto'
import {
  GeneratePayslipExplanationDto,
  PayslipExplanationResultDto,
} from '../dto/generate-payslip-explanation.dto'
import {
  GeneratePerformanceReviewPhrasesDto,
  PerformanceReviewPhrasesResultDto,
} from '../dto/generate-performance-review-phrases.dto'
import {
  GeneratePoCoverLetterDto,
  PoCoverLetterResultDto,
} from '../dto/generate-po-cover-letter.dto'
import {
  GeneratePriceBookRationaleDto,
  PriceBookRationaleResultDto,
} from '../dto/generate-price-book-rationale.dto'
import {
  GenerateProductContentDto,
  ProductContentResultDto,
} from '../dto/generate-product-content.dto'
import {
  GenerateRecruitmentJobCopyDto,
  RecruitmentJobCopyResultDto,
} from '../dto/generate-recruitment-job-copy.dto'
import {
  GenerateReportExecutiveSummaryDto,
  ReportExecutiveSummaryResultDto,
} from '../dto/generate-report-executive-summary.dto'
import {
  GenerateRequisitionJustificationDto,
  RequisitionJustificationResultDto,
} from '../dto/generate-requisition-justification.dto'
import { GenerateReturnAssistDto, ReturnAssistResultDto } from '../dto/generate-return-assist.dto'
import { GenerateReviewAssistDto, ReviewAssistResultDto } from '../dto/generate-review-assist.dto'
import {
  GeneratePosCashierAssistDto,
  PosCashierAssistResultDto,
} from '../dto/generate-pos-cashier-assist.dto'
import {
  GenerateApplicantScreeningDto,
  ApplicantScreeningResultDto,
} from '../dto/generate-applicant-screening.dto'
import { GenerateLeaveFaqDto, LeaveFaqResultDto } from '../dto/generate-leave-faq.dto'
import {
  GenerateStockTransferReasonDto,
  StockTransferReasonResultDto,
} from '../dto/generate-stock-transfer-reason.dto'
import { GenerateStoreSeoDto, StoreSeoResultDto } from '../dto/generate-store-seo.dto'
import {
  GenerateSupplierProfileSummaryDto,
  SupplierProfileSummaryResultDto,
} from '../dto/generate-supplier-profile-summary.dto'
import {
  GenerateSupportConversationSummaryDto,
  SupportConversationSummaryResultDto,
} from '../dto/generate-support-conversation-summary.dto'
import {
  GenerateSupportMessageIntentsDto,
  SupportMessageIntentsResultDto,
} from '../dto/generate-support-message-intents.dto'
import { GenerateSupportReplyDto, SupportReplyResultDto } from '../dto/generate-support-reply.dto'
import {
  GenerateTaxRuleExplanationDto,
  TaxRuleExplanationResultDto,
} from '../dto/generate-tax-rule-explanation.dto'
import { AdminCopilotService } from '../services/admin-copilot.service'
import { AiJobResponseDto, AiJobService } from '../services/ai-job.service'
import { AiUsageLogService } from '../services/ai-usage-log.service'
import { AiCatalogAssistantService } from '../services/domains/ai-catalog-assistant.service'
import { AiContentAssistantService } from '../services/domains/ai-content-assistant.service'
import { AiCoreAssistantService } from '../services/domains/ai-core-assistant.service'
import { AiCrmAssistantService } from '../services/domains/ai-crm-assistant.service'
import { AiFinanceAssistantService } from '../services/domains/ai-finance-assistant.service'
import { AiHrmAssistantService } from '../services/domains/ai-hrm-assistant.service'
import { AiInventoryAssistantService } from '../services/domains/ai-inventory-assistant.service'
import { AiProcurementAssistantService } from '../services/domains/ai-procurement-assistant.service'
import { AiSalesAssistantService } from '../services/domains/ai-sales-assistant.service'
import { AiSupportAssistantService } from '../services/domains/ai-support-assistant.service'

@Controller('ai')
@UseGuards(JwtAuthGuard, SubscriptionGuard, CustomThrottlerGuard)
@SkipNonAiAdminThrottles()
@Throttle({ ai: { limit: 40, ttl: 60000 } })
@RequireFeature('ai')
export class AiController {
  constructor(
    private readonly coreAssistant: AiCoreAssistantService,
    private readonly catalogAssistant: AiCatalogAssistantService,
    private readonly contentAssistant: AiContentAssistantService,
    private readonly crmAssistant: AiCrmAssistantService,
    private readonly salesAssistant: AiSalesAssistantService,
    private readonly supportAssistant: AiSupportAssistantService,
    private readonly inventoryAssistant: AiInventoryAssistantService,
    private readonly procurementAssistant: AiProcurementAssistantService,
    private readonly financeAssistant: AiFinanceAssistantService,
    private readonly hrmAssistant: AiHrmAssistantService,
    private readonly aiUsageLogService: AiUsageLogService,
    private readonly aiJobService: AiJobService,
    private readonly adminCopilotService: AdminCopilotService,
  ) {}

  @Get('status')
  @SkipAllThrottles()
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
    const data = await this.coreAssistant.getStatus(ctx.storeId)
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
    const data = await this.coreAssistant.chat(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'AI response generated successfully',
      data,
    }
  }

  @Post('chat/stream')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  @SkipNonAiAdminThrottles()
  @Throttle({ ai: { limit: 40, ttl: 60000 } })
  async chatStream(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: AiChatDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const stream = this.coreAssistant.chatStream(ctx.storeId, dto)

    try {
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        if (chunk.type === 'done' || chunk.type === 'error') {
          break
        }
      }
    } catch {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream interrupted' })}\n\n`)
    } finally {
      res.end()
    }
  }

  @Post('copilot/dashboard')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.REPORTS_READ)
  async askDashboardCopilot(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: DashboardCopilotDto,
  ): Promise<BaseApiSuccessResponse<{ reply: string; model: string; totalTokens: number }>> {
    const data = await this.coreAssistant.askDashboardCopilot(ctx, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Dashboard copilot response generated successfully',
      data,
    }
  }

  @Post('copilot/admin')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async askAdminCopilot(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: AdminCopilotDto,
  ): Promise<BaseApiSuccessResponse<AdminCopilotResponseDto>> {
    const data = await this.adminCopilotService.ask(ctx, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Admin copilot response generated successfully',
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
    const data = await this.catalogAssistant.generateProductContent(ctx.storeId, dto)
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
    const data = await this.catalogAssistant.generateCatalogContent(ctx.storeId, dto)
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
    const data = await this.contentAssistant.generateCampaignCopy(ctx.storeId, dto)
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
    const data = await this.contentAssistant.generateFaq(ctx.storeId, dto)
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
    const data = await this.contentAssistant.generatePageSeo(ctx.storeId, dto)
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
    const data = await this.contentAssistant.generateStoreSeo(ctx.storeId, dto)
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
    const data = await this.contentAssistant.generatePageBlockContent(ctx.storeId, dto)
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
    const data = await this.contentAssistant.generateMarketingDescription(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Marketing description generated successfully',
      data,
    }
  }

  @Post('generate/coupon-code-suggestions')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateCouponCodeSuggestions(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateCouponCodeSuggestionsDto,
  ): Promise<BaseApiSuccessResponse<CouponCodeSuggestionsResultDto>> {
    const data = await this.contentAssistant.generateCouponCodeSuggestions(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Coupon code suggestions generated successfully',
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
    const data = await this.contentAssistant.generateLoyaltyCopy(ctx.storeId, dto)
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
    const data = await this.crmAssistant.generateLeadFollowUp(ctx.storeId, dto)
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
    const data = await this.salesAssistant.generateOrderAssist(ctx.storeId, dto)
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
    const data = await this.salesAssistant.generateReturnAssist(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Return explanation letter generated successfully',
      data,
    }
  }

  @Post('generate/pos-cashier-assist')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generatePosCashierAssist(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GeneratePosCashierAssistDto,
  ): Promise<BaseApiSuccessResponse<PosCashierAssistResultDto>> {
    const data = await this.salesAssistant.generatePosCashierAssist(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'POS cashier assist generated successfully',
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
    const data = await this.supportAssistant.generateSupportReply(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Support reply generated successfully',
      data,
    }
  }

  @Post('generate/support-conversation-summary')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateSupportConversationSummary(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateSupportConversationSummaryDto,
  ): Promise<BaseApiSuccessResponse<SupportConversationSummaryResultDto>> {
    const data = await this.supportAssistant.generateSupportConversationSummary(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Support conversation summary generated successfully',
      data,
    }
  }

  @Post('generate/support-message-intents')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE)
  async generateSupportMessageIntents(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateSupportMessageIntentsDto,
  ): Promise<BaseApiSuccessResponse<SupportMessageIntentsResultDto>> {
    const data = await this.supportAssistant.generateSupportMessageIntents(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Support message intent tags generated successfully',
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
    const data = await this.crmAssistant.generateCustomerProfile(ctx.storeId, dto)
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
    const data = await this.crmAssistant.generateReviewAssist(ctx.storeId, dto)
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
    const data = await this.crmAssistant.generateAbandonedCartMessage(ctx.storeId, dto)
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
    const data = await this.catalogAssistant.generatePriceBookRationale(ctx.storeId, dto)
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
    const data = await this.catalogAssistant.generateMediaAssist(ctx.storeId, dto)
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
    const data = await this.inventoryAssistant.generateInventoryAnomaly(ctx.storeId, dto)
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
    const data = await this.inventoryAssistant.generateStockTransferReason(ctx.storeId, dto)
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
    const data = await this.inventoryAssistant.generateCycleCountVariance(ctx.storeId, dto)
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
    const data = await this.inventoryAssistant.generatePackingSlipNotes(ctx.storeId, dto)
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
    const data = await this.inventoryAssistant.generateBatchWasteReduction(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Batch waste reduction tips generated successfully',
      data,
    }
  }

  @Post('generate/requisition-justification')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.PURCHASING_READ)
  async generateRequisitionJustification(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateRequisitionJustificationDto,
  ): Promise<BaseApiSuccessResponse<RequisitionJustificationResultDto>> {
    const data = await this.procurementAssistant.generateRequisitionJustification(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Requisition justification generated successfully',
      data,
    }
  }

  @Post('generate/po-cover-letter')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.PURCHASING_READ)
  async generatePoCoverLetter(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GeneratePoCoverLetterDto,
  ): Promise<BaseApiSuccessResponse<PoCoverLetterResultDto>> {
    const data = await this.procurementAssistant.generatePoCoverLetter(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'PO cover letter generated successfully',
      data,
    }
  }

  @Post('generate/grn-discrepancy-notes')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.INVENTORY_READ)
  async generateGrnDiscrepancyNotes(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateGrnDiscrepancyNotesDto,
  ): Promise<BaseApiSuccessResponse<GrnDiscrepancyNotesResultDto>> {
    const data = await this.procurementAssistant.generateGrnDiscrepancyNotes(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'GRN discrepancy notes generated successfully',
      data,
    }
  }

  @Post('generate/three-way-match')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.PURCHASING_READ)
  async generateThreeWayMatchExplainer(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateThreeWayMatchDto,
  ): Promise<BaseApiSuccessResponse<ThreeWayMatchExplanationResultDto>> {
    const data = await this.procurementAssistant.generateThreeWayMatchExplainer(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Three-way match explanation generated successfully',
      data,
    }
  }

  @Post('generate/invoice-ocr')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.PURCHASING_WRITE)
  async generateInvoiceOcr(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateInvoiceOcrDto,
  ): Promise<BaseApiSuccessResponse<InvoiceOcrResultDto>> {
    const data = await this.procurementAssistant.generateInvoiceOcr(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Invoice OCR extraction completed successfully',
      data,
    }
  }

  @Post('generate/debit-note-dispute')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.PURCHASING_READ)
  async generateDebitNoteDispute(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateDebitNoteDisputeDto,
  ): Promise<BaseApiSuccessResponse<DebitNoteDisputeResultDto>> {
    const data = await this.procurementAssistant.generateDebitNoteDispute(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Debit note dispute letter generated successfully',
      data,
    }
  }

  @Post('generate/supplier-profile-summary')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.SUPPLIER_MANAGE)
  async generateSupplierProfileSummary(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateSupplierProfileSummaryDto,
  ): Promise<BaseApiSuccessResponse<SupplierProfileSummaryResultDto>> {
    const data = await this.procurementAssistant.generateSupplierProfileSummary(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier profile summary generated successfully',
      data,
    }
  }

  @Post('generate/ar-collection-draft')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_FINANCE, SystemPermissions.ACCOUNTING_READ)
  async generateArCollectionDraft(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateArCollectionDraftDto,
  ): Promise<BaseApiSuccessResponse<ArCollectionDraftResultDto>> {
    const data = await this.financeAssistant.generateArCollectionDraft(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'AR collection email draft generated successfully',
      data,
    }
  }

  @Post('generate/ap-payment-reminder')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_FINANCE, SystemPermissions.ACCOUNTING_READ)
  async generateApPaymentReminder(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateApPaymentReminderDto,
  ): Promise<BaseApiSuccessResponse<ApPaymentReminderResultDto>> {
    const data = await this.financeAssistant.generateApPaymentReminder(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'AP payment reminder draft generated successfully',
      data,
    }
  }

  @Post('generate/expense-category')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_FINANCE, SystemPermissions.FINANCE_LEDGER_READ)
  async generateExpenseCategorySuggest(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateExpenseCategoryDto,
  ): Promise<BaseApiSuccessResponse<ExpenseCategorySuggestResultDto>> {
    const data = await this.financeAssistant.generateExpenseCategorySuggest(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Expense category suggestion generated successfully',
      data,
    }
  }

  @Post('generate/report-executive-summary')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_FINANCE, SystemPermissions.REPORTS_READ)
  async generateReportExecutiveSummary(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateReportExecutiveSummaryDto,
  ): Promise<BaseApiSuccessResponse<ReportExecutiveSummaryResultDto>> {
    const data = await this.financeAssistant.generateReportExecutiveSummary(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Report executive summary generated successfully',
      data,
    }
  }

  @Post('generate/tax-rule-explanation')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_FINANCE, SystemPermissions.ACCOUNTING_READ)
  async generateTaxRuleExplanation(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateTaxRuleExplanationDto,
  ): Promise<BaseApiSuccessResponse<TaxRuleExplanationResultDto>> {
    const data = await this.financeAssistant.generateTaxRuleExplanation(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Tax rule explanation generated successfully',
      data,
    }
  }

  @Post('generate/recruitment-job-copy')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_HRM, SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async generateRecruitmentJobCopy(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateRecruitmentJobCopyDto,
  ): Promise<BaseApiSuccessResponse<RecruitmentJobCopyResultDto>> {
    const data = await this.hrmAssistant.generateRecruitmentJobCopy(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Recruitment job copy generated successfully',
      data,
    }
  }

  @Post('generate/performance-review-phrases')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_HRM, SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async generatePerformanceReviewPhrases(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GeneratePerformanceReviewPhrasesDto,
  ): Promise<BaseApiSuccessResponse<PerformanceReviewPhrasesResultDto>> {
    const data = await this.hrmAssistant.generatePerformanceReviewPhrases(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Performance review phrase bank generated successfully',
      data,
    }
  }

  @Post('generate/payslip-explanation')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_HRM, SystemPermissions.HRM_PAYROLL_PROCESS)
  async generatePayslipExplanation(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GeneratePayslipExplanationDto,
  ): Promise<BaseApiSuccessResponse<PayslipExplanationResultDto>> {
    const data = await this.hrmAssistant.generatePayslipExplanation(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Payslip explanation generated successfully',
      data,
    }
  }
  @Post('generate/leave-faq')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_HRM, SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async generateLeaveFaq(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateLeaveFaqDto,
  ): Promise<BaseApiSuccessResponse<LeaveFaqResultDto>> {
    const data = await this.hrmAssistant.generateLeaveFaq(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Leave policy FAQ generated successfully',
      data,
    }
  }

  @Post('generate/applicant-screening')
  @HttpCode(200)
  @RequirePermissions(SystemPermissions.AI_USE_HRM, SystemPermissions.HRM_EMPLOYEE_MANAGE)
  async generateApplicantScreening(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateApplicantScreeningDto,
  ): Promise<BaseApiSuccessResponse<ApplicantScreeningResultDto>> {
    const data = await this.hrmAssistant.generateApplicantScreening(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Applicant screening questions generated successfully',
      data,
    }
  }

  @Get('usage')
  @SkipAllThrottles()
  @RequirePermissions(SystemPermissions.AI_USE)
  async getUsageSummary(
    @RequestContext() ctx: RequestContextDto,
    @Query('days') days?: number,
  ): Promise<BaseApiSuccessResponse<AiUsageSummaryDto>> {
    const data = await this.aiUsageLogService.getSummary(ctx.storeId, days)
    return {
      success: true,
      statusCode: 200,
      message: 'AI usage summary retrieved successfully',
      data,
    }
  }

  @Post('jobs/embedding-reindex')
  @HttpCode(202)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.CATALOG_WRITE)
  async enqueueEmbeddingReindex(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<AiJobResponseDto>> {
    const job = await this.aiJobService.enqueueEmbeddingReindex(ctx.storeId)
    return {
      success: true,
      statusCode: 202,
      message: 'Embedding reindex job queued',
      data: this.aiJobService.toResponse(job),
    }
  }

  @Post('jobs/invoice-ocr')
  @HttpCode(202)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.PURCHASING_WRITE)
  async enqueueInvoiceOcr(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GenerateInvoiceOcrDto,
  ): Promise<BaseApiSuccessResponse<AiJobResponseDto>> {
    const job = await this.aiJobService.enqueueInvoiceOcr(ctx.storeId, dto)
    return {
      success: true,
      statusCode: 202,
      message: 'Invoice OCR job queued',
      data: this.aiJobService.toResponse(job),
    }
  }

  @Post('jobs/demand-forecast')
  @HttpCode(202)
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.INVENTORY_READ)
  async enqueueDemandForecast(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<AiJobResponseDto>> {
    const job = await this.aiJobService.enqueueDemandForecast(ctx.storeId)
    return {
      success: true,
      statusCode: 202,
      message: 'Demand forecast job queued',
      data: this.aiJobService.toResponse(job),
    }
  }

  @Get('jobs/latest')
  @SkipAllThrottles()
  @RequirePermissions(SystemPermissions.AI_USE)
  async getLatestJob(
    @RequestContext() ctx: RequestContextDto,
    @Query('type') type: AiJobType,
    @Query('cartId') cartId?: string,
    @Query('productId') productId?: string,
    @Query('importBatchId') importBatchId?: string,
  ): Promise<BaseApiSuccessResponse<AiJobResponseDto | null>> {
    let payloadKey: string | null = null
    let payloadValue: string | null = null

    if (type === AiJobType.CART_ABANDONED_DRAFT && cartId) {
      payloadKey = 'cartId'
      payloadValue = cartId
    } else if (type === AiJobType.BULK_SEO && productId) {
      payloadKey = 'productId'
      payloadValue = productId
    } else if (type === AiJobType.BULK_DESCRIPTION_IMPORT && importBatchId) {
      payloadKey = 'importBatchId'
      payloadValue = importBatchId
    }

    if (!payloadKey || !payloadValue) {
      return {
        success: true,
        statusCode: 200,
        message: 'No matching job lookup parameters',
        data: null,
      }
    }

    const job = await this.aiJobService.findLatestByPayload(
      ctx.storeId,
      type,
      payloadKey,
      payloadValue,
    )

    return {
      success: true,
      statusCode: 200,
      message: job ? 'Latest AI job retrieved successfully' : 'No completed job found',
      data: job ? this.aiJobService.toResponse(job) : null,
    }
  }

  @Get('jobs/:id')
  @SkipAllThrottles()
  @RequirePermissions(SystemPermissions.AI_USE)
  async getJob(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<AiJobResponseDto>> {
    const job = await this.aiJobService.findByIdForStore(id, ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'AI job retrieved successfully',
      data: this.aiJobService.toResponse(job),
    }
  }
}

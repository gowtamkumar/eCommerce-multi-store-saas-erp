import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import {
  GeneratePlanDescriptionDto,
  PlanDescriptionResultDto,
} from '../../platform/dto/generate-plan-description.dto'
import { PlatformAiService } from '../../platform/services/platform-ai.service'
import { SuperAdminService } from '../super-admin.service'
import {
  GenerateStoreHealthNarrativeDto,
  StoreHealthAggregateDto,
  StoreHealthNarrativeResultDto,
} from '../dto/store-health.dto'
import {
  GenerateOnboardingHintsDto,
  OnboardingHintsResultDto,
} from '../../platform/dto/generate-onboarding-hints.dto'
import {
  GenerateSupportTicketSummaryDto,
  SupportTicketSummaryResultDto,
} from '../../platform/dto/generate-support-ticket-summary.dto'

@Controller('super-admin/ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminAiController {
  constructor(
    private readonly platformAiService: PlatformAiService,
    private readonly superAdminService: SuperAdminService,
  ) {}

  @Get('status')
  async getStatus(): Promise<BaseApiSuccessResponse<{ configured: boolean }>> {
    return {
      success: true,
      statusCode: 200,
      message: 'Platform AI status retrieved',
      data: { configured: await this.platformAiService.isConfigured() },
    }
  }

  @Get('store-health/snapshot')
  async getStoreHealthSnapshot(
    @Query('days') days?: number,
  ): Promise<BaseApiSuccessResponse<StoreHealthAggregateDto>> {
    const data = await this.superAdminService.getStoreHealthAggregate(days)
    return {
      success: true,
      statusCode: 200,
      message: 'Store health snapshot retrieved',
      data,
    }
  }

  @Post('generate/plan-description')
  @HttpCode(200)
  async generatePlanDescription(
    @Body() body: GeneratePlanDescriptionDto,
  ): Promise<BaseApiSuccessResponse<PlanDescriptionResultDto>> {
    const data = await this.platformAiService.generatePlanDescription(body)
    return {
      success: true,
      statusCode: 200,
      message: 'Plan description generated',
      data,
    }
  }

  @Post('generate/store-health-narrative')
  @HttpCode(200)
  async generateStoreHealthNarrative(
    @Body() body: GenerateStoreHealthNarrativeDto,
  ): Promise<BaseApiSuccessResponse<StoreHealthNarrativeResultDto>> {
    const snapshot = await this.superAdminService.getStoreHealthAggregate(body.days)
    const narrative = await this.platformAiService.generateStoreHealthNarrative(snapshot)
    return {
      success: true,
      statusCode: 200,
      message: 'Store health narrative generated',
      data: { ...narrative, snapshot },
    }
  }

  @Post('generate/support-ticket-summary')
  @HttpCode(200)
  async generateSupportTicketSummary(
    @Body() body: GenerateSupportTicketSummaryDto,
  ): Promise<BaseApiSuccessResponse<SupportTicketSummaryResultDto>> {
    const data = await this.platformAiService.generateSupportTicketSummary(body)
    return {
      success: true,
      statusCode: 200,
      message: 'Support ticket summary generated',
      data,
    }
  }

  @Post('generate/onboarding-hints')
  @HttpCode(200)
  async generateOnboardingHints(
    @Body() body: GenerateOnboardingHintsDto,
  ): Promise<BaseApiSuccessResponse<OnboardingHintsResultDto>> {
    const data = await this.platformAiService.generateOnboardingHints(body)
    return {
      success: true,
      statusCode: 200,
      message: 'Onboarding hints generated',
      data,
    }
  }
}

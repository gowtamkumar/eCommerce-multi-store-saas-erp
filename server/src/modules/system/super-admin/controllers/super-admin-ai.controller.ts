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
  GenerateTenantHealthNarrativeDto,
  TenantHealthAggregateDto,
  TenantHealthNarrativeResultDto,
} from '../dto/tenant-health.dto'
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

  @Get('tenant-health/snapshot')
  async getTenantHealthSnapshot(
    @Query('days') days?: number,
  ): Promise<BaseApiSuccessResponse<TenantHealthAggregateDto>> {
    const data = await this.superAdminService.getTenantHealthAggregate(days)
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant health snapshot retrieved',
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

  @Post('generate/tenant-health-narrative')
  @HttpCode(200)
  async generateTenantHealthNarrative(
    @Body() body: GenerateTenantHealthNarrativeDto,
  ): Promise<BaseApiSuccessResponse<TenantHealthNarrativeResultDto>> {
    const snapshot = await this.superAdminService.getTenantHealthAggregate(body.days)
    const narrative = await this.platformAiService.generateTenantHealthNarrative(snapshot)
    return {
      success: true,
      statusCode: 200,
      message: 'Tenant health narrative generated',
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

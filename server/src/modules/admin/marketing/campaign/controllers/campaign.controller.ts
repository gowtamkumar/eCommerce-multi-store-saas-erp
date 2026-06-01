import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { Response } from 'express'
import { CreateCampaignDto } from '../dto/create-campaign.dto'
import { ScheduleCampaignDto } from '../dto/schedule-campaign.dto'
import { UpdateCampaignDto } from '../dto/update-campaign.dto'
import { CampaignEntity } from '../entities/campaign.entity'
import { CampaignService } from '../services/campaign.service'

@Controller('campaigns')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('marketing')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) { }

  @Post()
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateCampaignDto,
  ): Promise<BaseApiSuccessResponse<CampaignEntity>> {
    const result = await this.campaignService.createCampaign(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Campaign created successfully',
      data: result,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CampaignEntity[]>> {
    const result = await this.campaignService.findAll(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaigns retrieved successfully',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async findOne(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CampaignEntity>> {
    const result = await this.campaignService.findOne(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaign retrieved successfully',
      data: result,
    }
  }

  @Post(':id/schedule')
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async schedule(
    @Param('id') id: string,
    @Body() dto: ScheduleCampaignDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CampaignEntity>> {
    const result = await this.campaignService.scheduleCampaign(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaign scheduled successfully',
      data: result,
    }
  }

  @Post(':id/cancel')
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async cancel(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CampaignEntity>> {
    const result = await this.campaignService.cancelSchedule(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaign schedule canceled',
      data: result,
    }
  }

  @Patch(':id')
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<CampaignEntity>> {
    const result = await this.campaignService.updateCampaign(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaign updated successfully',
      data: result,
    }
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async delete(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<void>> {
    await this.campaignService.deleteCampaign(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaign deleted successfully',
      data: null,
    }
  }

  @Get(':id/logs')
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async getLogs(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<{ data: any[]; total: number; page: number; limit: number }>> {
    const result = await this.campaignService.getLogs(id, Number(page), Number(limit), ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaign logs retrieved successfully',
      data: result,
    }
  }

  @Get(':id/kpis')
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
  async kpis(
    @Param('id') id: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.campaignService.getKpis(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Campaign KPIs retrieved successfully',
      data: result,
    }
  }

  /**
   * Tracking pixel — embedded in HTML emails. Public, returns a 1×1 GIF.
   * The tracking key is the same recipientKey used during dispatch so
   * we can attribute opens without exposing internal user ids.
   */
  @Public()
  @Get('track/open')
  async trackOpen(
    @Query('c') campaignId: string,
    @Query('r') recipientKey: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (campaignId && recipientKey) {
        await this.campaignService.recordOpen(campaignId, recipientKey)
      }
    } catch {
      // Tracking pixel must never error visibly.
    }
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    res.setHeader('Content-Type', 'image/gif')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.end(gif)
  }

  @Public()
  @Get('track/click')
  async trackClick(
    @Query('c') campaignId: string,
    @Query('r') recipientKey: string,
    @Query('u') url: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      if (campaignId && recipientKey) {
        await this.campaignService.recordClick(campaignId, recipientKey)
      }
    } catch {
      // never block the redirect on tracking failure
    }
    // Validate target URL — reject open-redirect attempts.
    let target = '/'
    try {
      const parsed = new URL(url)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        target = parsed.toString()
      }
    } catch {
      target = '/'
    }
    res.redirect(302, target)
  }
}

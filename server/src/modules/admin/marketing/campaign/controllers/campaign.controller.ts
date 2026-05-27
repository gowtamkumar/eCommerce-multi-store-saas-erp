import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { CreateCampaignDto } from '../dto/create-campaign.dto'
import { ScheduleCampaignDto } from '../dto/schedule-campaign.dto'
import { UpdateCampaignDto } from '../dto/update-campaign.dto'
import { CampaignEntity } from '../entities/campaign.entity'
import { CampaignService } from '../services/campaign.service'

@Controller('campaigns')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('marketing')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @RequirePermissions(SystemPermissions.MARKETING_MANAGE)
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
}

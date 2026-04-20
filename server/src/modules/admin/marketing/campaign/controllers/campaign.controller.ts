import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CreateCampaignDto } from '../dto/create-campaign.dto'
import { ScheduleCampaignDto } from '../dto/schedule-campaign.dto'
import { UpdateCampaignDto } from '../dto/update-campaign.dto'
import { CampaignEntity } from '../entities/campaign.entity'
import { CampaignService } from '../services/campaign.service'

@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MARKETING)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
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
}

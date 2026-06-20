import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { Public } from '@/common/decorators/public.decorator'
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
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { Response } from 'express'
import { PlatformCampaignEntity } from '../entities/platform-campaign.entity'
import { PlatformCampaignService } from '../services/platform-campaign.service'

@Controller('super-admin/campaigns')
export class PlatformCampaignController {
  private readonly logger = new Logger(PlatformCampaignController.name)

  constructor(private readonly campaignService: PlatformCampaignService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post()
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: any,
  ): Promise<BaseApiSuccessResponse<PlatformCampaignEntity>> {
    const result = await this.campaignService.createCampaign(dto, ctx.userId)
    return {
      success: true,
      statusCode: 201,
      message: 'Platform campaign created successfully',
      data: result,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  async findAll(): Promise<BaseApiSuccessResponse<PlatformCampaignEntity[]>> {
    const result = await this.campaignService.findAll()
    return {
      success: true,
      statusCode: 200,
      message: 'Platform campaigns retrieved successfully',
      data: result,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BaseApiSuccessResponse<PlatformCampaignEntity>> {
    const result = await this.campaignService.findOne(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform campaign retrieved successfully',
      data: result,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/schedule')
  async schedule(
    @Param('id') id: string,
    @Body() dto: { scheduleTime: string },
  ): Promise<BaseApiSuccessResponse<PlatformCampaignEntity>> {
    const result = await this.campaignService.scheduleCampaign(id, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform campaign scheduled successfully',
      data: result,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post(':id/cancel')
  async cancel(@Param('id') id: string): Promise<BaseApiSuccessResponse<PlatformCampaignEntity>> {
    const result = await this.campaignService.cancelSchedule(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform campaign schedule canceled',
      data: result,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
  ): Promise<BaseApiSuccessResponse<PlatformCampaignEntity>> {
    const result = await this.campaignService.updateCampaign(id, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform campaign updated successfully',
      data: result,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<BaseApiSuccessResponse<void>> {
    await this.campaignService.deleteCampaign(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform campaign deleted successfully',
      data: null,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id/logs')
  async getLogs(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<BaseApiSuccessResponse<{ data: any[]; total: number; page: number; limit: number }>> {
    const result = await this.campaignService.getLogs(id, Number(page), Number(limit))
    return {
      success: true,
      statusCode: 200,
      message: 'Platform campaign logs retrieved successfully',
      data: result,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id/kpis')
  async kpis(@Param('id') id: string): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.campaignService.getKpis(id)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform campaign KPIs retrieved successfully',
      data: result,
    }
  }

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
      // ignore errors
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
      // ignore errors
    }
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

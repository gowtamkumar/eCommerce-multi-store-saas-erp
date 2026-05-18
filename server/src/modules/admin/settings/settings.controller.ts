import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Get, Logger, Put, UseGuards } from '@nestjs/common'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsResponseDto } from './dto/site-settings-response.dto'
import { SettingsService } from './settings.service'
import { CacheService } from '../operations/infra/cache/cache.service'
import { Post, HttpCode } from '@nestjs/common'

@UseGuards(SubscriptionGuard)
@RequireFeature('/admin/settings')
@Controller('settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name)

  constructor(
    private readonly settingsService: SettingsService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @RequireFeature('/admin')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  async findByTenantSettings(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SiteSettingsResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByTenantSettings.`)
    const settings = await this.settingsService.findByTenantSettings(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Settings retrieved successfully',
      data: settings as any,
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async updateSettings(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: UpdateSiteSettingsDto,
  ): Promise<BaseApiSuccessResponse<SiteSettingsResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateSettings.`)
    const settings = await this.settingsService.updateSettings(ctx, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Settings updated successfully',
      data: settings as any,
    }
  }

  @Post('cache/clear')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async clearCache(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called clearCache.`)
    await this.cacheService.clearTenantCache(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Store cache cleared successfully',
      data: null,
    }
  }
}

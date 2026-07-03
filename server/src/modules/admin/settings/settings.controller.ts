import { Audit } from '@/common/decorators/audit.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Public } from '@/common/decorators/public.decorator'
import { Body, Controller, Get, Logger, Put, UseGuards } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsResponseDto } from './dto/site-settings-response.dto'
import { SettingsService } from './settings.service'
import { CacheService } from '../operations/infra/cache/cache.service'
import { Post, HttpCode } from '@nestjs/common'

/**
 * Convert a raw SiteSettingsEntity (which has SMTP creds, payment API keys, …)
 * into the safe response shape we ship over the wire. excludeExtraneousValues
 * is the linchpin — anything that isn't explicitly @Expose()-ed in the
 * response DTO is dropped, so a new sensitive column added to the entity in
 * the future can't accidentally leak.
 */
function toSafeSettings<T extends object>(settings: T): SiteSettingsResponseDto {
  return plainToInstance(SiteSettingsResponseDto, settings, {
    excludeExtraneousValues: true,
  })
}

@UseGuards(SubscriptionGuard)
@RequireFeature('settings')
@Controller('settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name)

  constructor(
    private readonly settingsService: SettingsService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  async findByStoreSettings(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SiteSettingsResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByStoreSettings.`)
    const settings = await this.settingsService.findByStoreSettings(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Settings retrieved successfully',
      data: toSafeSettings(settings),
    }
  }

  @Get('public')
  @Public()
  async getPublicSettings(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SiteSettingsResponseDto>> {
    this.logger.verbose(`System called getPublicSettings.`)
    const settings = await this.settingsService.findByStoreSettings(ctx)
    const responseSettings = toSafeSettings(settings)

    // Explicitly delete sensitive credentials from public responses
    delete responseSettings.smtp
    delete responseSettings.payment
    delete responseSettings.pathaoCourier
    delete responseSettings.steadfastCourier
    delete responseSettings.sms

    return {
      success: true,
      statusCode: 200,
      message: 'Settings retrieved successfully',
      data: responseSettings,
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Audit({ entity: 'SiteSettings', action: 'UPDATE' })
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
      data: toSafeSettings(settings),
    }
  }

  @Post('cache/clear')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  async clearCache(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called clearCache.`)
    await this.cacheService.clearStoreCache(ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'Store cache cleared successfully',
      data: null,
    }
  }
}

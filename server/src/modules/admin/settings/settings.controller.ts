import { PublicDuringExpiration } from '@/common/decorators/public-during-expiration.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Get, Logger, Put, UseGuards } from '@nestjs/common'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsResponseDto } from './dto/site-settings-response.dto'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name)

  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @PublicDuringExpiration()
  async findByTenantSettings(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<SiteSettingsResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByTenantSettings.`)
    const settings = await this.settingsService.findByTenantSettings(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Settings retrieved successfully',
      data: settings as any,
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async updateSettings(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: UpdateSiteSettingsDto,
  ): Promise<BaseApiSuccessResponse<SiteSettingsResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateSettings.`)
    const settings = await this.settingsService.updateSettings(ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 200,
      message: 'Settings updated successfully',
      data: settings as any,
    }
  }
}

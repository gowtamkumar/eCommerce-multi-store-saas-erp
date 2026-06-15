import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { Body, Controller, Get, Logger, Put, UseGuards } from '@nestjs/common'
import { Public } from '@/common/decorators/public.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PlatformSettingsResponseDto } from './dto/platform-settings-response.dto'
import { PlatformSettingsService } from './platform-settings.service'

@Controller('platform/settings')
export class PlatformSettingsController {
  private readonly logger = new Logger(PlatformSettingsController.name)

  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  // Public: consumed by the SaaS landing page and the maintenance-mode wrapper
  // (must be reachable while unauthenticated and outside any tenant context).
  @Public()
  @Get()
  async getPlatformSettings(): Promise<BaseApiSuccessResponse<PlatformSettingsResponseDto>> {
    this.logger.verbose('getPlatformSettings called.')
    const settings = await this.platformSettingsService.getPlatformSettings()
    return {
      success: true,
      statusCode: 200,
      message: 'Platform settings retrieved successfully',
      data: settings as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Put()
  async updatePlatformSettings(
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<PlatformSettingsResponseDto>> {
    this.logger.verbose('updatePlatformSettings called.')
    const settings = await this.platformSettingsService.updatePlatformSettings(data)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform settings updated successfully',
      data: settings as any,
    }
  }
}

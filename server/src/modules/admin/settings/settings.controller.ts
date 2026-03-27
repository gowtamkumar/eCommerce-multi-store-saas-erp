import { Body, Controller, Get, Put, UseGuards, Logger } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SettingsService } from './settings.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Controller('settings')
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name)

  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async findByTenantSettings(@RequestContext() ctx: RequestContextDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByTenantSettings.`)
    return await this.settingsService.findByTenantSettings(ctx.tenantId)
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async updateSettings(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: UpdateSiteSettingsDto,
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateSettings.`)
    return await this.settingsService.updateSettings(ctx.tenantId, dto)
  }
}

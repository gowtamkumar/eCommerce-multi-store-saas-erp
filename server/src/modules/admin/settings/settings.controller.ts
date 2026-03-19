import { Body, Controller, Get, Put, Logger } from '@nestjs/common'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SettingsService } from './settings.service'
import { RequestContext } from "src/common/decorators/request-context.decorator";
import { RequestContextDto } from "src/common/dto/request-context.dto";

@Controller('settings')
export class SettingsController {
    private readonly logger = new Logger(SettingsController.name);

  constructor(private readonly settingsService: SettingsService) { }

  @Get()
  async findByTenantSettings(@RequestContext() ctx: RequestContextDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByTenantSettings.`);
      return await this.settingsService.findByTenantSettings(ctx.tenantId)
    }

  @Put()
  async updateSettings(@RequestContext() ctx: RequestContextDto, @Body() dto: UpdateSiteSettingsDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateSettings.`);
      return await this.settingsService.updateSettings(ctx.tenantId, dto)
    }
}

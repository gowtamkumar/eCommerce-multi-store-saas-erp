import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSiteSettingsDto } from './dto/settings.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get site settings' })
    async getSettings(@TenantId() tenantId: string) {
        return await this.settingsService.findByTenant(tenantId);
    }

    @Put()
    @ApiOperation({ summary: 'Update site settings' })
    async updateSettings(@TenantId() tenantId: string, @Body() dto: UpdateSiteSettingsDto) {
        return await this.settingsService.update(tenantId, dto);
    }
}

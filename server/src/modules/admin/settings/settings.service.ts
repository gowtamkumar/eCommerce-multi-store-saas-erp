import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSiteSettingsDto } from './dto/settings.dto';
import { SiteSettingsEntity } from './entities/site-settings.entity';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    constructor(
        @InjectRepository(SiteSettingsEntity)
        private settingsRepository: Repository<SiteSettingsEntity>,
    ) { }

    async findByTenantSettings(tenantId: string) {
        this.logger.log(`${this.findByTenantSettings.name} Service Called`);
        let settings = await this.settingsRepository.findOne({ where: { tenantId } });
        // Create default settings if not exists
        if (!settings) {
            settings = this.settingsRepository.create({ tenantId });
            await this.settingsRepository.save(settings);
        }

        return settings;
    }

    async updateSettings(tenantId: string, dto: UpdateSiteSettingsDto) {
        this.logger.log(`${this.updateSettings.name} Service Called`);
        const settings = await this.findByTenantSettings(tenantId);
        Object.assign(settings, dto);
        return await this.settingsRepository.save(settings);
    }
}

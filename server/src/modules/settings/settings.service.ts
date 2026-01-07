import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettingsEntity } from './entities/site-settings.entity';
import { UpdateSiteSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(SiteSettingsEntity)
        private settingsRepository: Repository<SiteSettingsEntity>,
    ) { }

    async findByTenant(tenantId: string) {
        let settings = await this.settingsRepository.findOne({ where: { tenantId } });

        // Create default settings if not exists
        if (!settings) {
            settings = this.settingsRepository.create({ tenantId });
            await this.settingsRepository.save(settings);
        }

        return settings;
    }

    async update(tenantId: string, dto: UpdateSiteSettingsDto) {
        const settings = await this.findByTenant(tenantId);
        Object.assign(settings, dto);
        return await this.settingsRepository.save(settings);
    }
}

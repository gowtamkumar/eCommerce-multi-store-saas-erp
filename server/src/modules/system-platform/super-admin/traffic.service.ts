import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { TenantTrafficEntity } from './entities/tenant-traffic.entity';
import { PageTrafficEntity } from './entities/page-traffic.entity';

@Injectable()
export class TrafficService {
    constructor(
        @InjectRepository(TenantTrafficEntity)
        private trafficRepository: Repository<TenantTrafficEntity>,
        @InjectRepository(PageTrafficEntity)
        private pageTrafficRepository: Repository<PageTrafficEntity>,
    ) { }

    async logRequest(tenantId: string) {
        if (!tenantId) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            await this.trafficRepository.query(
                `INSERT INTO tenant_traffic ("tenantId", "date", "requestCount")
                 VALUES ($1, $2, 1)
                 ON CONFLICT ("tenantId", "date")
                 DO UPDATE SET "requestCount" = tenant_traffic."requestCount" + 1, "lastUpdated" = CURRENT_TIMESTAMP`,
                [tenantId, today]
            );
        } catch (error) {
            console.error('Error logging traffic:', error);
        }
    }

    async logPageHit(tenantId: string, path: string) {
        if (!tenantId || !path) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            await this.pageTrafficRepository.query(
                `INSERT INTO page_traffic ("tenantId", "path", "date", "requestCount")
                 VALUES ($1, $2, $3, 1)
                 ON CONFLICT ("tenantId", "path", "date")
                 DO UPDATE SET "requestCount" = page_traffic."requestCount" + 1, "lastUpdated" = CURRENT_TIMESTAMP`,
                [tenantId, path, today]
            );
        } catch (error) {
            console.error('Error logging page hit:', error);
        }
    }

    async getTrafficStats(days: number = 7) {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        return await this.trafficRepository.find({
            where: {
                // filter by date if needed
            },
            order: { date: 'DESC' },
        });
    }

    async getPageTrafficStats(tenantId: string, days: number = 30, excludePrefixes: string[] = []) {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        const where: any = { tenantId };

        if (excludePrefixes.length > 0) {
            where.path = Raw(alias => {
                const conditions = excludePrefixes.map(prefix => `${alias} NOT LIKE '${prefix}%'`).join(' AND ');
                return conditions;
            });
        }

        return await this.pageTrafficRepository.find({
            where,
            order: { requestCount: 'DESC' },
            take: 20
        });
    }
}

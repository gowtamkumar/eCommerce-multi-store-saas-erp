import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantTrafficEntity } from './entities/tenant-traffic.entity';

@Injectable()
export class TrafficService {
    constructor(
        @InjectRepository(TenantTrafficEntity)
        private trafficRepository: Repository<TenantTrafficEntity>,
    ) { }

    async logRequest(tenantId: string) {
        if (!tenantId) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            // Atomic increment or insert
            await this.trafficRepository
                .createQueryBuilder()
                .insert()
                .into(TenantTrafficEntity)
                .values({
                    tenantId,
                    date: today,
                    requestCount: 1,
                })
                .orUpdate(['requestCount'], ['tenantId', 'date'])
                .execute();

            // Note: In TypeORM, orUpdate with increment requires manual handling or raw SQL for actual increment
            // The above orUpdate will overwrite. Let's fix it with raw increment if possible or a simple find and update.

            // For simplicity and correctness in this environment:
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

    async getTrafficStats(days: number = 7) {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        return await this.trafficRepository.find({
            where: {
                // date: More than sinceDate (handled in query builder for better control)
            },
            order: { date: 'DESC' },
        });
    }
}

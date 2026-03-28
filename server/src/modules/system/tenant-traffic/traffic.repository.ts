import { Injectable } from '@nestjs/common'
import { DataSource, Raw, Repository } from 'typeorm'
import { TenantTrafficEntity } from './entities/tenant-traffic.entity'

@Injectable()
export class TrafficRepository extends Repository<TenantTrafficEntity> {
  constructor(private dataSource: DataSource) {
    super(TenantTrafficEntity, dataSource.createEntityManager())
  }

  async upsertTraffic(tenantId: string, date: Date): Promise<void> {
    await this.query(
      `INSERT INTO tenant_traffic ("tenant_id", "date", "request_count")
       VALUES ($1, $2, 1)
       ON CONFLICT ("tenant_id", "date")
       DO UPDATE SET request_count = tenant_traffic.request_count + 1, last_updated = CURRENT_TIMESTAMP`,
      [tenantId, date],
    )
  }

  async findAllSince(sinceDate: Date): Promise<TenantTrafficEntity[]> {
    return await this.find({
      where: {
        date: Raw((alias) => `${alias} >= :sinceDate`, { sinceDate }),
      },
      order: { date: 'DESC' },
    })
  }

  async findGlobalStatsSince(sinceDate: Date): Promise<{ date: Date; requestCount: number }[]> {
    const stats = await this.createQueryBuilder('traffic')
      .select('traffic.date', 'date')
      .addSelect('SUM(traffic.request_count)', 'requestCount')
      .where('traffic.date >= :sinceDate', { sinceDate })
      .groupBy('traffic.date')
      .orderBy('traffic.date', 'DESC')
      .getRawMany()

    return stats.map((s) => ({
      date: s.date,
      requestCount: parseInt(s.requestCount, 10),
    }))
  }
}

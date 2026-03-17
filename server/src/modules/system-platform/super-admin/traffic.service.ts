import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Raw, Repository } from 'typeorm'
import { TenantTrafficEntity } from './entities/tenant-traffic.entity'

@Injectable()
export class TrafficService {
    private readonly logger = new Logger(TrafficService.name);

  constructor(
    @InjectRepository(TenantTrafficEntity)
    private trafficRepository: Repository<TenantTrafficEntity>,
  ) { }

  async logRequestTraffic(tenantId: string) {
      this.logger.log(`${this.logRequestTraffic.name} Service Called`);
    if (!tenantId) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
      await this.trafficRepository.query(
        `INSERT INTO tenant_traffic ("tenant_id", "date", "request_count")
                 VALUES ($1, $2, 1)
                 ON CONFLICT ("tenant_id", "date")
                 DO UPDATE SET request_count = tenant_traffic.request_count + 1, last_updated = CURRENT_TIMESTAMP`,
        [tenantId, today],
      )
    } catch (error) {
      console.error('Error logging traffic:', error)
    }
  }



  async getTrafficStats(days: number = 7) {
      this.logger.log(`${this.getTrafficStats.name} Service Called`);
    const sinceDate = new Date()
    sinceDate.setHours(0, 0, 0, 0)
    sinceDate.setDate(sinceDate.getDate() - days)

    return await this.trafficRepository.find({
      where: {
        date: Raw((alias) => `${alias} >= :sinceDate`, { sinceDate }),
      },
      order: { date: 'DESC' },
    })
  }

  async getGlobalTrafficStats(days: number = 7) {
      this.logger.log(`${this.getGlobalTrafficStats.name} Service Called`);
    const sinceDate = new Date()
    sinceDate.setHours(0, 0, 0, 0)
    sinceDate.setDate(sinceDate.getDate() - days)

    const stats = await this.trafficRepository
      .createQueryBuilder('traffic')
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

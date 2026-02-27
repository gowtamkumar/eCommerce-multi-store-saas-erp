import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Raw, Repository } from 'typeorm'
import { PageTrafficEntity } from './entities/page-traffic.entity'
import { TenantTrafficEntity } from './entities/tenant-traffic.entity'

@Injectable()
export class TrafficService {
  constructor(
    @InjectRepository(TenantTrafficEntity)
    private trafficRepository: Repository<TenantTrafficEntity>,
    @InjectRepository(PageTrafficEntity)
    private pageTrafficRepository: Repository<PageTrafficEntity>,
  ) { }

  async logRequest(tenantId: string) {
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

  async logPageHit(tenantId: string, path: string) {
    if (!tenantId || !path) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
      await this.pageTrafficRepository.query(
        `INSERT INTO page_traffic ("tenant_id", "path", "date", "request_count")
                 VALUES ($1, $2, $3, 1)
                 ON CONFLICT ("tenant_id", "path", "date")
                 DO UPDATE SET request_count = page_traffic.request_count + 1, last_updated = CURRENT_TIMESTAMP`,
        [tenantId, path, today],
      )
    } catch (error) {
      console.error('Error logging page hit:', error)
    }
  }

  async getTrafficStats(days: number = 7) {
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

  async getPageTrafficStats(tenantId: string, days: number = 30, excludePrefixes: string[] = []) {
    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - days)

    const where: any = { tenantId }

    if (excludePrefixes.length > 0) {
      where.path = Raw((alias) => {
        const conditions = excludePrefixes
          .map((prefix) => `${alias} NOT LIKE '${prefix}%'`)
          .join(' AND ')
        return conditions
      })
    }

    return await this.pageTrafficRepository.find({
      where,
      order: { requestCount: 'DESC' },
      take: 20,
    })
  }
}

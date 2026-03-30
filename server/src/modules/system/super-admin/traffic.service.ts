import { Injectable, Logger } from '@nestjs/common'
import { TrafficRepository } from './traffic.repository'
import { TenantTrafficEntity } from './entities/tenant-traffic.entity'

@Injectable()
export class TrafficService {
  private readonly logger = new Logger(TrafficService.name)

  constructor(private readonly trafficRepository: TrafficRepository) {}

  async logRequestTraffic(tenantId: string): Promise<void> {
    this.logger.log(`${this.logRequestTraffic.name} Service Called`)
    if (!tenantId) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
      await this.trafficRepository.upsertTraffic(tenantId, today)
    } catch (error) {
      console.error('Error logging traffic:', error)
    }
  }

  async getTrafficStats(days: number = 7): Promise<TenantTrafficEntity[]> {
    this.logger.log(`${this.getTrafficStats.name} Service Called`)
    const sinceDate = new Date()
    sinceDate.setHours(0, 0, 0, 0)
    sinceDate.setDate(sinceDate.getDate() - days)

    return await this.trafficRepository.findAllSince(sinceDate)
  }

  async getGlobalTrafficStats(
    days: number = 7,
  ): Promise<{ date: Date; requestCount: number }[]> {
    this.logger.log(`${this.getGlobalTrafficStats.name} Service Called`)
    const sinceDate = new Date()
    sinceDate.setHours(0, 0, 0, 0)
    sinceDate.setDate(sinceDate.getDate() - days)

    return await this.trafficRepository.findGlobalStatsSince(sinceDate)
  }
}

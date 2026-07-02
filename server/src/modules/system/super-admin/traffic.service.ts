import { Injectable, Logger } from '@nestjs/common'
import { TrafficRepository } from './traffic.repository'
import { StoreTrafficEntity } from './entities/store-traffic.entity'

@Injectable()
export class TrafficService {
  private readonly logger = new Logger(TrafficService.name)

  constructor(private readonly trafficRepository: TrafficRepository) {}

  async logRequestTraffic(storeId: string): Promise<void> {
    this.logger.log(`${this.logRequestTraffic.name} Service Called`)
    if (!storeId) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
      await this.trafficRepository.upsertTraffic(storeId, today)
    } catch (error) {
      console.error('Error logging traffic:', error)
    }
  }

  async getTrafficStats(days: number = 7): Promise<StoreTrafficEntity[]> {
    this.logger.log(`${this.getTrafficStats.name} Service Called`)
    const sinceDate = new Date()
    sinceDate.setHours(0, 0, 0, 0)
    sinceDate.setDate(sinceDate.getDate() - days)

    return await this.trafficRepository.findAllSince(sinceDate)
  }

  async getGlobalTrafficStats(days: number = 7): Promise<{ date: Date; requestCount: number }[]> {
    this.logger.log(`${this.getGlobalTrafficStats.name} Service Called`)
    const sinceDate = new Date()
    sinceDate.setHours(0, 0, 0, 0)
    sinceDate.setDate(sinceDate.getDate() - days)

    return await this.trafficRepository.findGlobalStatsSince(sinceDate)
  }
}

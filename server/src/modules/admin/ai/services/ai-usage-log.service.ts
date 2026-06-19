import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AiUsageLogEntity } from '../entities/ai-usage-log.entity'
import { AiUsageSummaryDto, RecordAiUsageParams } from '../dto/ai-usage.dto'

@Injectable()
export class AiUsageLogService {
  constructor(
    @InjectRepository(AiUsageLogEntity)
    private readonly usageRepo: Repository<AiUsageLogEntity>,
  ) {}

  async record(params: RecordAiUsageParams): Promise<void> {
    await this.usageRepo.insert({
      tenantId: params.tenantId,
      endpoint: params.endpoint.slice(0, 128),
      operation: params.operation,
      model: params.model.slice(0, 128),
      promptTokens: params.promptTokens ?? 0,
      completionTokens: params.completionTokens ?? 0,
      totalTokens: params.totalTokens,
      jobId: params.jobId ?? null,
    })
  }

  async recordSafe(params: RecordAiUsageParams): Promise<void> {
    try {
      await this.record(params)
    } catch {
      // Usage logging must never break AI responses.
    }
  }

  async getSummary(tenantId: string, days = 30): Promise<AiUsageSummaryDto> {
    const safeDays = Math.min(Math.max(days, 1), 90)
    const since = new Date()
    since.setUTCDate(since.getUTCDate() - safeDays)
    since.setUTCHours(0, 0, 0, 0)

    const logs = await this.usageRepo
      .createQueryBuilder('log')
      .where('log.tenant_id = :tenantId', { tenantId })
      .andWhere('log.created_at >= :since', { since })
      .orderBy('log.created_at', 'ASC')
      .getMany()

    const byOperationMap = new Map<string, { totalTokens: number; requestCount: number }>()
    const byEndpointMap = new Map<string, { totalTokens: number; requestCount: number }>()
    const byDayMap = new Map<string, { totalTokens: number; requestCount: number }>()

    let totalTokens = 0

    for (const log of logs) {
      totalTokens += log.totalTokens

      const op = byOperationMap.get(log.operation) ?? { totalTokens: 0, requestCount: 0 }
      op.totalTokens += log.totalTokens
      op.requestCount += 1
      byOperationMap.set(log.operation, op)

      const endpointKey = log.endpoint || 'unknown'
      const ep = byEndpointMap.get(endpointKey) ?? { totalTokens: 0, requestCount: 0 }
      ep.totalTokens += log.totalTokens
      ep.requestCount += 1
      byEndpointMap.set(endpointKey, ep)

      const dateKey = log.createdAt.toISOString().slice(0, 10)
      const day = byDayMap.get(dateKey) ?? { totalTokens: 0, requestCount: 0 }
      day.totalTokens += log.totalTokens
      day.requestCount += 1
      byDayMap.set(dateKey, day)
    }

    const sortByTokens = (
      entries: Array<[string, { totalTokens: number; requestCount: number }]>,
    ) =>
      entries
        .sort((a, b) => b[1].totalTokens - a[1].totalTokens)
        .map(([key, stats]) => ({ key, ...stats }))

    return {
      days: safeDays,
      totalTokens,
      totalRequests: logs.length,
      byOperation: sortByTokens([...byOperationMap.entries()]).map(({ key, ...stats }) => ({
        operation: key,
        totalTokens: stats.totalTokens,
        requestCount: stats.requestCount,
      })),
      byEndpoint: sortByTokens([...byEndpointMap.entries()]).map(({ key, ...stats }) => ({
        endpoint: key,
        totalTokens: stats.totalTokens,
        requestCount: stats.requestCount,
      })),
      byDay: [...byDayMap.entries()].map(([date, stats]) => ({
        date,
        totalTokens: stats.totalTokens,
        requestCount: stats.requestCount,
      })),
    }
  }
}

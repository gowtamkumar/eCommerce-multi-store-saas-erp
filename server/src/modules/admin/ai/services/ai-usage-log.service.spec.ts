import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AiUsageLogEntity } from '../entities/ai-usage-log.entity'
import { AiUsageLogService } from './ai-usage-log.service'

describe('AiUsageLogService', () => {
  let service: AiUsageLogService
  let repo: jest.Mocked<Pick<Repository<AiUsageLogEntity>, 'insert' | 'createQueryBuilder'>>

  beforeEach(async () => {
    repo = {
      insert: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiUsageLogService,
        {
          provide: getRepositoryToken(AiUsageLogEntity),
          useValue: repo,
        },
      ],
    }).compile()

    service = module.get(AiUsageLogService)
  })

  it('records usage with trimmed endpoint', async () => {
    await service.record({
      storeId: 'store-1',
      endpoint: 'ai/chat',
      operation: 'chat',
      model: 'gpt-4o-mini',
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    })

    expect(repo.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'store-1',
        endpoint: 'ai/chat',
        totalTokens: 30,
      }),
    )
  })

  it('summarizes empty usage', async () => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }
    repo.createQueryBuilder.mockReturnValue(qb as never)

    const summary = await service.getSummary('store-1', 7)

    expect(summary.totalTokens).toBe(0)
    expect(summary.totalRequests).toBe(0)
    expect(summary.days).toBe(7)
    expect(summary.byEndpoint).toEqual([])
  })

  it('aggregates usage by endpoint and day', async () => {
    const qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          operation: 'chat',
          endpoint: 'ai/chat',
          totalTokens: 100,
          createdAt: new Date('2026-06-18T10:00:00Z'),
        },
        {
          operation: 'chat',
          endpoint: 'ai/generate/faq',
          totalTokens: 50,
          createdAt: new Date('2026-06-18T12:00:00Z'),
        },
        {
          operation: 'embedding',
          endpoint: 'embeddings/sync',
          totalTokens: 200,
          createdAt: new Date('2026-06-19T08:00:00Z'),
        },
      ]),
    }
    repo.createQueryBuilder.mockReturnValue(qb as never)

    const summary = await service.getSummary('store-1', 30)

    expect(summary.totalTokens).toBe(350)
    expect(summary.totalRequests).toBe(3)
    expect(summary.byEndpoint).toEqual([
      { endpoint: 'embeddings/sync', totalTokens: 200, requestCount: 1 },
      { endpoint: 'ai/chat', totalTokens: 100, requestCount: 1 },
      { endpoint: 'ai/generate/faq', totalTokens: 50, requestCount: 1 },
    ])
    expect(summary.byDay).toHaveLength(2)
  })
})

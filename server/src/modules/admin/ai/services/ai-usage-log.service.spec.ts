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
      tenantId: 'tenant-1',
      endpoint: 'ai/chat',
      operation: 'chat',
      model: 'gpt-4o-mini',
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    })

    expect(repo.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
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

    const summary = await service.getSummary('tenant-1', 7)

    expect(summary.totalTokens).toBe(0)
    expect(summary.totalRequests).toBe(0)
    expect(summary.days).toBe(7)
  })
})

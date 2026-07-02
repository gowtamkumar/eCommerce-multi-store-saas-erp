import { AiJobStatus } from '@/common/enums/ai-job-status.enum'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AiJobEntity } from '../entities/ai-job.entity'
import { AiJobService } from './ai-job.service'

describe('AiJobService', () => {
  let service: AiJobService
  let saveMock: jest.Mock
  let updateMock: jest.Mock
  let createMock: jest.Mock
  let queueAddMock: jest.Mock

  beforeEach(async () => {
    saveMock = jest.fn(async (entity) => ({ id: 'job-1', ...entity }))
    updateMock = jest.fn().mockResolvedValue(undefined)
    createMock = jest.fn((entity) => entity)
    queueAddMock = jest.fn().mockResolvedValue({ id: 'bull-1' })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiJobService,
        {
          provide: getRepositoryToken(AiJobEntity),
          useValue: {
            save: saveMock,
            update: updateMock,
            create: createMock,
            findOne: jest.fn(),
          },
        },
        {
          provide: getQueueToken('ai'),
          useValue: { add: queueAddMock },
        },
      ],
    }).compile()

    service = module.get(AiJobService)
  })

  it('creates and enqueues embedding reindex job', async () => {
    const job = await service.enqueueEmbeddingReindex('store-1')

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: 'store-1',
        type: AiJobType.EMBEDDING_REINDEX,
        status: AiJobStatus.QUEUED,
      }),
    )
    expect(queueAddMock).toHaveBeenCalledWith(
      AiJobType.EMBEDDING_REINDEX,
      expect.objectContaining({ storeId: 'store-1' }),
      expect.objectContaining({ jobId: 'job-1' }),
    )
    expect(job.bullJobId).toBe('bull-1')
  })
})

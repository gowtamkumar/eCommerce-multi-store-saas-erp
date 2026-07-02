import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { AppModule } from '../src/app.module'
import { AiJobStatus } from '@/common/enums/ai-job-status.enum'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { AiJobEntity } from '@/modules/admin/ai/entities/ai-job.entity'
import { AiUsageLogEntity } from '@/modules/admin/ai/entities/ai-usage-log.entity'
import { AiJobService } from '@/modules/admin/ai/services/ai-job.service'
import { AiUsageLogService } from '@/modules/admin/ai/services/ai-usage-log.service'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

describe('AI infrastructure (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let store: StoreEntity
  let usageLogService: AiUsageLogService
  let aiJobService: AiJobService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
    usageLogService = app.get(AiUsageLogService)
    aiJobService = app.get(AiJobService)

    const storeRepo = dataSource.getRepository(StoreEntity)
    store = storeRepo.create({
      storeName: 'AI Infra E2E Store',
      subdomain: `ai-infra-e2e-${Date.now()}`,
    })
    await storeRepo.save(store)
  })

  afterAll(async () => {
    if (store) {
      await dataSource.getRepository(AiUsageLogEntity).delete({ storeId: store.id })
      await dataSource.getRepository(AiJobEntity).delete({ storeId: store.id })
      await dataSource.getRepository(StoreEntity).delete(store.id)
    }
    if (app) {
      await app.close()
    }
  })

  it('persists AI usage logs and returns summary', async () => {
    await usageLogService.record({
      storeId: store.id,
      endpoint: 'ai/status',
      operation: 'chat',
      model: 'gpt-4o-mini',
      promptTokens: 5,
      completionTokens: 10,
      totalTokens: 15,
    })

    const summary = await usageLogService.getSummary(store.id, 30)
    expect(summary.totalTokens).toBeGreaterThanOrEqual(15)
    expect(summary.totalRequests).toBeGreaterThanOrEqual(1)
    expect(summary.byEndpoint.some((row) => row.endpoint === 'ai/status')).toBe(true)
  })

  it('creates queued embedding reindex job row', async () => {
    const job = await aiJobService.createAndEnqueue(store.id, AiJobType.EMBEDDING_REINDEX, {})

    expect(job.storeId).toBe(store.id)
    expect(job.type).toBe(AiJobType.EMBEDDING_REINDEX)
    expect(job.status).toBe(AiJobStatus.QUEUED)
    expect(job.bullJobId).toBeTruthy()
  })
})

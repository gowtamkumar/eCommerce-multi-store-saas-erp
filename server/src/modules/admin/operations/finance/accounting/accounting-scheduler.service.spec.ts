import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { AccountingSchedulerService } from './accounting-scheduler.service'

describe('AccountingSchedulerService', () => {
  let service: AccountingSchedulerService
  let queueAdd: jest.Mock
  let getRepeatableJobs: jest.Mock
  let removeRepeatableByKey: jest.Mock
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(async () => {
    queueAdd = jest.fn()
    getRepeatableJobs = jest.fn().mockResolvedValue([])
    removeRepeatableByKey = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingSchedulerService,
        {
          provide: getQueueToken('accounting'),
          useValue: {
            add: queueAdd,
            getRepeatableJobs,
            removeRepeatableByKey,
          },
        },
      ],
    }).compile()

    service = module.get<AccountingSchedulerService>(AccountingSchedulerService)
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('registers outbox job in production', async () => {
    process.env.NODE_ENV = 'production'
    await service.onModuleInit()
    expect(queueAdd).toHaveBeenCalledTimes(1)
    expect(getRepeatableJobs).not.toHaveBeenCalled()
  })

  it('skips and clears outbox job in development', async () => {
    process.env.NODE_ENV = 'development'
    getRepeatableJobs.mockResolvedValue([
      { name: 'process-accounting-outbox', key: 'repeat-key-1' },
    ])

    await service.onModuleInit()

    expect(queueAdd).not.toHaveBeenCalled()
    expect(getRepeatableJobs).toHaveBeenCalled()
    expect(removeRepeatableByKey).toHaveBeenCalledWith('repeat-key-1')
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { StockReservationSchedulerService } from './stock-reservation-scheduler.service'

describe('StockReservationSchedulerService', () => {
  let service: StockReservationSchedulerService
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
        StockReservationSchedulerService,
        {
          provide: getQueueToken('inventory'),
          useValue: {
            add: queueAdd,
            getRepeatableJobs,
            removeRepeatableByKey,
          },
        },
      ],
    }).compile()

    service = module.get<StockReservationSchedulerService>(StockReservationSchedulerService)
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('registers sweep jobs in production', async () => {
    process.env.NODE_ENV = 'production'
    await service.onModuleInit()
    expect(queueAdd).toHaveBeenCalledTimes(2)
    expect(getRepeatableJobs).not.toHaveBeenCalled()
  })

  it('skips and clears sweep jobs in development', async () => {
    process.env.NODE_ENV = 'development'
    getRepeatableJobs.mockResolvedValue([
      { name: 'sweep-expired-reservations', key: 'repeat-key-1' },
    ])

    await service.onModuleInit()

    expect(queueAdd).not.toHaveBeenCalled()
    expect(getRepeatableJobs).toHaveBeenCalled()
    expect(removeRepeatableByKey).toHaveBeenCalledWith('repeat-key-1')
  })
})

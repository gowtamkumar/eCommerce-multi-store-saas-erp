import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { LoyaltySchedulerService } from './loyalty-scheduler.service'

describe('LoyaltySchedulerService', () => {
  let service: LoyaltySchedulerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltySchedulerService,
        {
          provide: getQueueToken('loyalty'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<LoyaltySchedulerService>(LoyaltySchedulerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

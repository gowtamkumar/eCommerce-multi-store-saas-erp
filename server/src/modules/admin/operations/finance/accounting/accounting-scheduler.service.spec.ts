import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { AccountingSchedulerService } from './accounting-scheduler.service'

describe('AccountingSchedulerService', () => {
  let service: AccountingSchedulerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingSchedulerService,
        {
          provide: getQueueToken('accounting'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AccountingSchedulerService>(AccountingSchedulerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

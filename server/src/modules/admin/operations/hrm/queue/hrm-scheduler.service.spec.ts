import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { HrmSchedulerService } from './hrm-scheduler.service'

describe('HrmSchedulerService', () => {
  let service: HrmSchedulerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrmSchedulerService,
        {
          provide: getQueueToken('hrm'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<HrmSchedulerService>(HrmSchedulerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { getQueueToken } from '@nestjs/bullmq'
import { StockReservationSchedulerService } from './stock-reservation-scheduler.service'

describe('StockReservationSchedulerService', () => {
  let service: StockReservationSchedulerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockReservationSchedulerService,
        {
          provide: getQueueToken('inventory'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<StockReservationSchedulerService>(StockReservationSchedulerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { LoyaltyService } from './loyalty.service'

describe('LoyaltyService', () => {
  let service: LoyaltyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({})),
          },
        },
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<LoyaltyService>(LoyaltyService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

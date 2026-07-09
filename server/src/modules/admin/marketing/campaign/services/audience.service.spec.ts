import { Test, TestingModule } from '@nestjs/testing'
import { AudienceService } from './audience.service'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { SubscriberRepository } from '@/modules/admin/customer/subscriber/repositories/subscriber.repository'
import { LeadRepository } from '@/modules/admin/customer/lead/repositories/lead.repository'

describe('AudienceService', () => {
  let service: AudienceService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudienceService,
        {
          provide: UserRepository,
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
          },
        },
        {
          provide: SubscriberRepository,
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
          },
        },
        {
          provide: LeadRepository,
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AudienceService>(AudienceService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

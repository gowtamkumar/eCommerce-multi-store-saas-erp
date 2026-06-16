import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { LeadRepository } from './lead.repository'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { LeadService } from './lead.service'

describe('LeadService', () => {
  let service: LeadService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        {
          provide: LeadRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<LeadService>(LeadService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

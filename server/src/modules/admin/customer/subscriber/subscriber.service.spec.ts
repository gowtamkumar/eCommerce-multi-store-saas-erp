import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SubscriberRepository } from './subscriber.repository'
import { SubscriberService } from './subscriber.service'

describe('SubscriberService', () => {
  let service: SubscriberService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriberService,
        {
          provide: SubscriberRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<SubscriberService>(SubscriberService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

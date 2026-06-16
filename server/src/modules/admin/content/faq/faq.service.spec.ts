import { Test, TestingModule } from '@nestjs/testing'
import { FaqRepository } from './faq.repository'
import { CacheService } from '../../operations/infra/cache/cache.service'
import { FaqService } from './faq.service'

describe('FaqService', () => {
  let service: FaqService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        {
          provide: FaqRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<FaqService>(FaqService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { ReviewRepository } from '../repositories/review.repository'
import { ReviewService } from './review.service'

describe('ReviewService', () => {
  let service: ReviewService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: ReviewRepository,
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

    service = module.get<ReviewService>(ReviewService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { SubscriptionPlanRepository } from './subscription-plan.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { SubscriptionPlanService } from './subscription-plan.service'

describe('SubscriptionPlanService', () => {
  let service: SubscriptionPlanService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionPlanService,
        {
          provide: SubscriptionPlanRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<SubscriptionPlanService>(SubscriptionPlanService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

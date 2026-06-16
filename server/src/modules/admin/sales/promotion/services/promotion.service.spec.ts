import { Test, TestingModule } from '@nestjs/testing'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { PromotionRepository } from '../repositories/promotion.repository'
import { PromotionService } from './promotion.service'

describe('PromotionService', () => {
  let service: PromotionService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionService,
        {
          provide: PromotionRepository,
          useValue: {},
        },
        {
          provide: ProductRepository,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<PromotionService>(PromotionService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { WishlistRepository } from './wishlist.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { PromotionService } from '@/modules/admin/sales/promotion/services/promotion.service'
import { WishlistService } from './wishlist.service'

describe('WishlistService', () => {
  let service: WishlistService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: WishlistRepository,
          useValue: {},
        },
        {
          provide: ProductRepository,
          useValue: {},
        },
        {
          provide: PricingEngineService,
          useValue: {},
        },
        {
          provide: PromotionService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<WishlistService>(WishlistService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

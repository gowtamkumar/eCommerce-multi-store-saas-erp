import { Test, TestingModule } from '@nestjs/testing'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { CouponService } from '@/modules/admin/sales/coupon/services/coupon.service'
import { PromotionService } from '@/modules/admin/sales/promotion/services/promotion.service'
import { SiteSettingsRepository } from '@/modules/admin/settings/site-settings.repository'
import { CartItemRepository } from './cart-item.repository'
import { CartRepository } from './cart.repository'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { PricingService } from '@/modules/admin/catalog/pricing/pricing.service'
import { CartService } from './cart.service'

describe('CartService', () => {
  let service: CartService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useValue: {},
        },
        {
          provide: CartItemRepository,
          useValue: {},
        },
        {
          provide: ProductRepository,
          useValue: {},
        },
        {
          provide: SiteSettingsRepository,
          useValue: {},
        },
        {
          provide: CouponService,
          useValue: {},
        },
        {
          provide: PromotionService,
          useValue: {},
        },
        {
          provide: PricingEngineService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: PricingService,
          useValue: {},
        },
      ],
    }).compile()

    service = module.get<CartService>(CartService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})

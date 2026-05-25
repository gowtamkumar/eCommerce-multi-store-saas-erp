import { Test, TestingModule } from '@nestjs/testing'
import { CouponController } from './coupon.controller'
import { CouponService } from '../services/coupon.service'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'

describe('CouponController', () => {
  let controller: CouponController

  beforeEach(async () => {
    const mockCouponService = {}
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        {
          provide: CouponService,
          useValue: mockCouponService,
        },
      ],
    })
      .overrideGuard(SubscriptionGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<CouponController>(CouponController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})

import { Test, TestingModule } from '@nestjs/testing'
import { CouponService } from './coupon.service'
import { CouponRepository } from '../repositoris/coupon.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

describe('CouponService', () => {
  let service: CouponService

  beforeEach(async () => {
    const mockCouponRepository = {}
    const mockCacheService = {}

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: CouponRepository,
          useValue: mockCouponRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile()

    service = module.get<CouponService>(CouponService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
